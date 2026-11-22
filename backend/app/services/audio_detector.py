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

    def predict(self, y: np.ndarray, sr: int):
        self.load()
        if len(y) < sr:
            raise ValueError("Durasi audio terlalu pendek, rekam minimal sekitar 1 detik")
        y = y.astype(np.float32)
        y = y / max(float(np.max(np.abs(y))), 1e-8)
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

        prediction = "DEEPFAKE" if probabilities["DEEPFAKE"] >= probabilities["ORISINIL"] else "ORISINIL"
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
