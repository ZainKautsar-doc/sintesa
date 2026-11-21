import base64
import io
import threading
import torch
from PIL import Image, ImageChops, ImageEnhance
from transformers import pipeline

from app.config import IMAGE_MODEL_ID


class ImageDetector:
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
                        "image-classification",
                        model=IMAGE_MODEL_ID,
                        device=self.device,
                    )

    def normalize_label(self, label: str) -> str:
        normalized = label.lower().replace("_", " ").replace("-", " ")
        if any(token in normalized for token in ("fake", "deepfake", "spoof", "synthetic", "label 1")):
            return "DEEPFAKE"
        if any(token in normalized for token in ("real", "bonafide", "authentic", "original", "label 0")):
            return "ORISINIL"
        return "ORISINIL" if normalized.startswith("label") and normalized.endswith("0") else "DEEPFAKE"

    def predict(self, image: Image.Image):
        self.load()
        outputs = self._classifier(image.convert("RGB"))
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
        confidence = probabilities[prediction]
        return prediction, confidence, probabilities


def generate_ela_base64(pil_image: Image.Image) -> str:
    image = pil_image.convert("RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90)
    buffer.seek(0)
    recompressed = Image.open(buffer).convert("RGB")
    ela = ImageChops.difference(image, recompressed)
    ela = ImageEnhance.Contrast(ela).enhance(15.0)

    output = io.BytesIO()
    ela.save(output, format="PNG")
    encoded = base64.b64encode(output.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"
