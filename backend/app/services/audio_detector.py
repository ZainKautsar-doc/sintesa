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
        1. Digital Silence (ketiadaan ambient noise / noise floor = 0)
        2. Cut-off frequency / Rolloff (codec TTS web memotong frekuensi di batas spesifik)
        3. Variabilitas pitch (F0) & intonasi mekanis
        4. Spectral flatness (derajat noise vs nada harmonik)
        """
        heuristics = {
            "tts_suspect": False,
            "tts_confidence_boost": 0.0,
            "reasons": []
        }

        # 1. Deteksi Keheningan Digital Mutlak (Zero Ambient Noise)
        # Suara manusia dari mic nyata selalu memiliki noise floor (> -60dB).
        # TTS seperti Google Translate di bagian jeda bernilai 0.0 persis atau sangat rendah.
        abs_y = np.abs(y)
        silent_samples_ratio = float(np.mean(abs_y < 1e-4))
        if silent_samples_ratio > 0.15:
            heuristics["reasons"].append("Keheningan latar belakang digital mutlak (khas generator TTS)")
            heuristics["tts_confidence_boost"] += 0.25

        # 2. Spectral Rolloff (Pemeriksaan Cut-Off Frekuensi Tinggi)
        # Web TTS biasanya di-encode pada 16kHz atau 22kHz dengan cut-off tajam di 8kHz atau 11kHz.
        rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, roll_percent=0.95)
        mean_rolloff = float(np.mean(rolloff))
        if mean_rolloff < 6000:
            heuristics["reasons"].append(f"Frekuensi tinggi terpotong tajam di {int(mean_rolloff)} Hz")
            heuristics["tts_confidence_boost"] += 0.20

        # 3. Variabilitas Intonasi / Pitch (F0 Variance)
        # Suara Google Translate / TTS sintetis memiliki nada dasar yang terlalu stabil/monoton.
        try:
            f0, voiced_flag, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'), sr=sr)
            voiced_f0 = f0[voiced_flag] if voiced_flag is not None else np.array([])
            if len(voiced_f0) > 10:
                f0_std = float(np.std(voiced_f0))
                # Manusia berbicara alami biasanya memiliki variasi pitch > 20 Hz
                if f0_std < 18.0:
                    heuristics["reasons"].append(f"Variasi intonasi vokal sangat rendah/mekanis (Std: {f0_std:.1f} Hz)")
                    heuristics["tts_confidence_boost"] += 0.25
        except Exception:
            pass

        # 4. Spectral Flatness
        flatness = librosa.feature.spectral_flatness(y=y)
        mean_flatness = float(np.mean(flatness))
        if mean_flatness < 0.002:
            heuristics["reasons"].append("Sinyal vokal sangat terisolasi tanpa resonansi ruangan")
            heuristics["tts_confidence_boost"] += 0.15

        if heuristics["tts_confidence_boost"] >= 0.40:
            heuristics["tts_suspect"] = True

        return heuristics

    def predict(self, y: np.ndarray, sr: int):
        self.load()
        if len(y) < sr:
            raise ValueError("Durasi audio terlalu pendek, rekam minimal sekitar 1 detik")
        y = y.astype(np.float32)
        y = y / max(float(np.max(np.abs(y))), 1e-8)

        # 1. Inferensi model neural network
        outputs = self._classifier({"array": y, "sampling_rate": sr}, top_k=None)
        probabilities = {"ORISINIL": 0.0, "DEEPFAKE": 0.0}
        for item in outputs:
            label = self.normalize_label(str(item["label"]))
            probabilities[label] = max(probabilities[label], float(item["score"]))

        total = sum(probabilities.values())
        if total <= 0:
            probabilities = {"ORISINIL": 0.5, "DEEPFAKE": 0.5}
        elif total != 1:
            probabilities = {key: value / total for key, value in probabilities.items()}

        # 2. Analisis Forensik Akustik Heuristik
        heuristics = self.analyze_acoustic_heuristics(y, sr)
        if heuristics["tts_suspect"]:
            # Jika artefak TTS kuat (misal Google Translate), tingkatkan probabilitas DEEPFAKE
            boost = min(heuristics["tts_confidence_boost"], 0.65)
            probabilities["DEEPFAKE"] = min(0.98, probabilities["DEEPFAKE"] + boost)
            probabilities["ORISINIL"] = max(0.02, 1.0 - probabilities["DEEPFAKE"])

        # Ambang batas dinamis
        prediction = "DEEPFAKE" if probabilities["DEEPFAKE"] >= 0.45 else "ORISINIL"
        return prediction, probabilities[prediction], probabilities


def load_audio_segment(temp_path: str, max_seconds: int = 30):
    y, sr = librosa.load(temp_path, sr=16000, mono=True)
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
