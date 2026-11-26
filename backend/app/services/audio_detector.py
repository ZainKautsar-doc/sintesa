import base64
import io
import threading
import torch
import librosa
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from transformers import pipeline

from app.config import AUDIO_MODEL_ID


class AudioDetector:
    def __init__(self) -> None:
        self.device = 0 if torch.cuda.is_available() else -1
        self._classifier = None
        self._lock = threading.Lock()

    @property
    def loaded(self) -> bool:
        return self._classifier is not None

    def load(self) -> None:
        if self._classifier is None:
            with self._lock:
                if self._classifier is None:
                    self._classifier = pipeline(
                        "audio-classification",
                        model=AUDIO_MODEL_ID,
                        device=self.device,
                    )

    def normalize_label(self, label: str) -> str:
        normalized = label.lower().replace("_", " ").replace("-", " ")
        if any(token in normalized for token in ("fake", "deepfake", "spoof", "synthetic", "label 1")):
            return "DEEPFAKE"
        if any(token in normalized for token in ("real", "bonafide", "authentic", "original", "label 0")):
            return "ORISINIL"
        return "ORISINIL" if normalized.startswith("label") and normalized.endswith("0") else "DEEPFAKE"

    def analyze_acoustic_heuristics(self, y: np.ndarray, sr: int) -> dict:
        """
        Mengekstrak fitur akustik biologis manusia vs Text-to-Speech (TTS/Google Translate):
        1. Digital Silence (ketiadaan ambient noise / noise floor = 0 pada jeda bicara)
        2. Brick-wall High-Frequency Cut-off (codec TTS web memotong frekuensi tajam di batas 10.5 - 11kHz / 8kHz)
        3. Spectral Rolloff (konsentrasi energi terpotong pada frekuensi menengah)
        4. Jitter & Pitch Perturbation
        """
        reasons = []
        confidence_boost = 0.0

        # 1. Deteksi Keheningan Digital Ekstrem / Zero Ambient Noise
        frame_len = 512
        if len(y) >= frame_len:
            frames = librosa.util.frame(y, frame_length=frame_len, hop_length=frame_len)
            rms_frames = np.sqrt(np.mean(frames**2, axis=0))
            quiet_ratio = float(np.mean(rms_frames < 0.0008))
            extreme_silent_ratio = float(np.mean(rms_frames < 0.0001))

            if extreme_silent_ratio > 0.05 or quiet_ratio > 0.08:
                reasons.append("Keheningan latar belakang digital mutlak (tanpa noise floor mikrofon alami)")
                confidence_boost += 0.35

        # 2. Pemeriksaan Cut-off Frekuensi Tinggi (Ciri khas Google TTS / Neural Vocoder)
        stft_mag = np.abs(librosa.stft(y, n_fft=1024, hop_length=256))
        freq_bins = librosa.fft_frequencies(sr=sr, n_fft=1024)
        if sr >= 20000:
            idx_cut = np.where(freq_bins >= 10500)[0]
            if len(idx_cut) > 0:
                cut_idx = idx_cut[0]
                energy_above = float(np.mean(stft_mag[cut_idx:, :]))
                energy_below = float(np.mean(stft_mag[:cut_idx, :]))
                drop_ratio = energy_above / (energy_below + 1e-8)
                if drop_ratio < 0.08:
                    reasons.append("Cut-off spektral tajam di atas 10.5 kHz (ciri khas Google Translate/Neural Vocoder)")
                    confidence_boost += 0.40
        else:
            rolloff85 = float(np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.85)))
            if rolloff85 < 4800:
                reasons.append(f"Frekuensi terpusat di bawah {int(rolloff85)} Hz (spektrum terpotong)")
                confidence_boost += 0.30

        # 3. Variabilitas Intonasi / Pitch Perturbation
        try:
            f0, voiced_flag, _ = librosa.pyin(
                y,
                fmin=librosa.note_to_hz('C2'),
                fmax=librosa.note_to_hz('C7'),
                sr=sr,
                frame_length=1024,
            )
            voiced_f0 = f0[voiced_flag] if voiced_flag is not None else np.array([])
            if len(voiced_f0) > 8:
                f0_diff = np.abs(np.diff(voiced_f0))
                jitter_proxy = float(np.mean(f0_diff) / (np.mean(voiced_f0) + 1e-8))
                if jitter_proxy < 0.035:
                    reasons.append("Transisi vokal terlalu mulus secara sintetis tanpa fluktuasi pita suara alami")
                    confidence_boost += 0.25
        except Exception:
            pass

        # 4. Spectral Flatness
        flatness = librosa.feature.spectral_flatness(y=y)
        min_flatness = float(np.min(flatness))
        if min_flatness < 1e-5:
            reasons.append("Ditemukan segmen frekuensi sintetis terisolasi mutlak")
            confidence_boost += 0.15

        is_tts_suspect = confidence_boost >= 0.30

        return {
            "tts_suspect": is_tts_suspect,
            "confidence_boost": min(0.95, confidence_boost),
            "reasons": reasons,
        }

    def predict(self, y: np.ndarray, sr: int):
        self.load()
        if len(y) < sr:
            raise ValueError("Durasi audio terlalu pendek, rekam minimal sekitar 1 detik")

        # 1. Analisis Forensik Akustik Heuristik (pada sampling rate asli audio)
        heuristics = self.analyze_acoustic_heuristics(y, sr)
        boost = heuristics["confidence_boost"]

        # 2. Resample ke 16000 Hz untuk classifier Wav2Vec2 agar tidak memerlukan torchaudio
        if sr != 16000:
            y_16k = librosa.resample(y, orig_sr=sr, target_sr=16000)
        else:
            y_16k = y

        y_16k = y_16k.astype(np.float32)
        y_16k = y_16k / max(float(np.max(np.abs(y_16k))), 1e-8)

        # 3. Inferensi model neural network lokal
        outputs = self._classifier({"array": y_16k, "sampling_rate": 16000}, top_k=None)
        probabilities = {"ORISINIL": 0.0, "DEEPFAKE": 0.0}
        for item in outputs:
            label = self.normalize_label(str(item["label"]))
            probabilities[label] = max(probabilities[label], float(item["score"]))

        total = sum(probabilities.values())
        if total <= 0:
            probabilities = {"ORISINIL": 0.5, "DEEPFAKE": 0.5}
        elif total != 1:
            probabilities = {key: value / total for key, value in probabilities.items()}

        raw_fake_score = probabilities["DEEPFAKE"]

        # 4. Fusi Skor Forensik Akustik & Neural Model (seimbang agar rekaman mikrofon browser tidak false-positive)
        if heuristics["tts_suspect"] and raw_fake_score >= 0.35:
            combined_fake = (0.80 * raw_fake_score) + (0.20 * min(1.0, boost))
        else:
            combined_fake = (0.90 * raw_fake_score) + (0.10 * min(1.0, boost))

        final_fake = float(np.clip(combined_fake, 0.01, 0.99))
        final_real = 1.0 - final_fake

        probabilities = {
            "ORISINIL": round(final_real, 4),
            "DEEPFAKE": round(final_fake, 4),
        }

        # Ambang batas seimbang: tetapkan DEEPFAKE hanya jika probabilitas >= 0.65
        prediction = "DEEPFAKE" if probabilities["DEEPFAKE"] >= 0.65 else "ORISINIL"
        return prediction, probabilities[prediction], probabilities


def load_audio_segment(temp_path: str, max_seconds: int = 30):
    # Load audio dengan sampling asli (atau hingga 24kHz) agar analisis cut-off frekuensi tinggi akurat
    y, sr = librosa.load(temp_path, sr=None, mono=True)
    if sr > 24000:
        y = librosa.resample(y, orig_sr=sr, target_sr=24000)
        sr = 24000

    if len(y) > sr:
        peak_index = int(np.argmax(np.abs(y)))
        desired_samples = max_seconds * sr
        start = max(0, min(peak_index - desired_samples // 2, len(y) - desired_samples))
        y = y[start:start + desired_samples]
    if len(y) == 0:
        raise ValueError("File audio tidak memiliki data yang dapat diproses")
    return y, sr


def generate_spectrogram_base64(y: np.ndarray, sr: int) -> str:
    mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    mel_db = librosa.power_to_db(mel, ref=np.max)

    fig, ax = plt.subplots(figsize=(8, 4), dpi=120)
    fig.patch.set_facecolor("#020617")
    ax.set_facecolor("#020617")
    librosa.display.specshow(mel_db, sr=sr, x_axis="time", y_axis="mel", cmap="magma", ax=ax)
    ax.set_title("Mel-Spectrogram", color="#e2e8f0", fontsize=11)
    ax.tick_params(colors="#94a3b8")
    for spine in ax.spines.values():
        spine.set_visible(False)
    fig.tight_layout()

    output = io.BytesIO()
    fig.savefig(output, format="png", transparent=False, bbox_inches="tight")
    plt.close(fig)
    encoded = base64.b64encode(output.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"
