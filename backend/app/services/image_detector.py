import base64
import io
import threading
import torch
import numpy as np
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
        # Token untuk deepfake / AI-generated / artificial
        if any(token in normalized for token in ("artificial", "fake", "deepfake", "spoof", "synthetic", "ai")):
            return "DEEPFAKE"
        # Token untuk gambar manusia / nyata / orisinil
        if any(token in normalized for token in ("human", "real", "bonafide", "authentic", "original")):
            return "ORISINIL"
        # Fallback index
        return "DEEPFAKE" if "0" in normalized else "ORISINIL"

    def analyze_fft_spectrum(self, image: Image.Image) -> float:
        """
        Analisis anomali spektrum frekuensi 2D FFT (Fast Fourier Transform).
        Generator difusi AI & GAN meninggalkan artefak periodik / kisi-kisi pada
        frekuensi tinggi (azimuthal / radial power distribution).
        """
        gray = image.convert("L").resize((256, 256))
        np_gray = np.array(gray, dtype=np.float32)
        fft = np.fft.fft2(np_gray)
        fft_shift = np.fft.fftshift(fft)
        magnitude = np.log(np.abs(fft_shift) + 1e-8)

        # Hitung rasio energi frekuensi tinggi terhadap frekuensi rendah
        h, w = magnitude.shape
        cy, cx = h // 2, w // 2
        r_inner = 30
        r_outer = 90

        y, x = np.ogrid[:h, :w]
        dist_from_center = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)

        high_freq_mask = (dist_from_center >= r_inner) & (dist_from_center <= r_outer)
        high_freq_variance = float(np.var(magnitude[high_freq_mask]))
        return high_freq_variance

    def analyze_ela_artifacts(self, image: Image.Image) -> float:
        """
        Menghitung skor anomali kompresi ELA secara kuantitatif.
        """
        img_rgb = image.convert("RGB")
        buffer = io.BytesIO()
        img_rgb.save(buffer, format="JPEG", quality=90)
        buffer.seek(0)
        recompressed = Image.open(buffer).convert("RGB")
        diff = ImageChops.difference(img_rgb, recompressed)
        diff_np = np.array(diff, dtype=np.float32)
        mean_diff = float(np.mean(diff_np))
        return mean_diff

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

        # Tambahan pembobot FFT jika skor model berada di area borderline (0.35 - 0.55)
        fft_var = self.analyze_fft_spectrum(image)
        if fft_var > 3.8 and probabilities["DEEPFAKE"] >= 0.35:
            # Anomali frekuensi tinggi terdeteksi
            probabilities["DEEPFAKE"] = min(0.98, probabilities["DEEPFAKE"] + 0.15)
            probabilities["ORISINIL"] = max(0.02, 1.0 - probabilities["DEEPFAKE"])

        # Ambang batas sensitivitas dinamis: jika DEEPFAKE >= 0.45, tetapkan DEEPFAKE
        prediction = "DEEPFAKE" if probabilities["DEEPFAKE"] >= 0.45 else "ORISINIL"
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
