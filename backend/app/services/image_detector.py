import base64
import io
import threading
import torch
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from scipy import ndimage
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

    def analyze_fft_spectrum(self, image: Image.Image) -> dict:
        """
        Analisis anomali spektrum frekuensi 2D FFT (Fast Fourier Transform).
        Generator AI (Diffusion / GAN) meninggalkan pola simetri periodik frekuensi tinggi
        dan penurunan eksponensial daya spektral yang tidak wajar dibanding foto kamera alami.
        """
        gray = image.convert("L").resize((256, 256))
        np_gray = np.array(gray, dtype=np.float32)
        fft = np.fft.fft2(np_gray)
        fft_shift = np.fft.fftshift(fft)
        magnitude = np.log(np.abs(fft_shift) + 1e-8)

        h, w = magnitude.shape
        cy, cx = h // 2, w // 2

        # Cincin frekuensi tinggi
        y, x = np.ogrid[:h, :w]
        dist_from_center = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)

        r_inner = 35
        r_outer = 110
        high_freq_mask = (dist_from_center >= r_inner) & (dist_from_center <= r_outer)
        high_freq_vals = magnitude[high_freq_mask]

        var_val = float(np.var(high_freq_vals))
        mean_val = float(np.mean(high_freq_vals))

        # Generator AI sering menunjukkan rasio frekuensi tinggi yang sangat seragam atau berpola kisi
        return {
            "high_freq_variance": var_val,
            "high_freq_mean": mean_val,
            "is_anomalous": var_val > 3.6 or var_val < 1.2,
        }

    def analyze_noise_residual(self, image: Image.Image) -> dict:
        """
        Analisis noise residual (PRNU / High-pass filtering).
        Kamera optik nyata menghasilkan sensor noise (Poisson-Gaussian) yang tersebar acak.
        Sebaliknya, foto hasil render AI modern (Midjourney/FLUX/DALL-E) sering kali memiliki
        tekstur kulit/latar yang terlalu halus (oversmoothed) atau noise sintetis homogen.
        """
        gray = image.convert("L").resize((256, 256))
        arr = np.array(gray, dtype=np.float32)

        # Median filter residual untuk ekstraksi noise
        filtered = ndimage.median_filter(arr, size=3)
        residual = np.abs(arr - filtered)

        residual_std = float(np.std(residual))
        residual_mean = float(np.mean(residual))
        kurtosis_like = float(np.mean(((residual - residual_mean) / (residual_std + 1e-8)) ** 4))

        # Generator AI sering memiliki residual yang sangat rendah (terlalu licin) atau kurtosis tinggi
        is_synthetic_smoothness = residual_std < 2.5
        is_synthetic_pattern = kurtosis_like > 15.0

        return {
            "residual_std": residual_std,
            "kurtosis": kurtosis_like,
            "is_synthetic": is_synthetic_smoothness or is_synthetic_pattern,
        }

    def analyze_color_temperature_saturation(self, image: Image.Image) -> dict:
        """
        Analisis anomali statistik warna.
        Generator AI sering memiliki 'AI sheen' (saturasi mikro berlebih pada pencahayaan dan kontras lokal).
        """
        hsv = image.convert("HSV").resize((256, 256))
        np_hsv = np.array(hsv, dtype=np.float32)
        s_channel = np_hsv[:, :, 1]
        v_channel = np_hsv[:, :, 2]

        sat_mean = float(np.mean(s_channel))
        val_std = float(np.std(v_channel))
        oversaturated = sat_mean > 165.0 and val_std > 65.0

        return {
            "saturation_mean": sat_mean,
            "value_std": val_std,
            "oversaturated_sheen": oversaturated,
        }

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
        return float(np.mean(diff_np))

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

        raw_deepfake_score = probabilities["DEEPFAKE"]

        # Ekstraksi Fitur Forensik Multi-Modal
        fft_data = self.analyze_fft_spectrum(image)
        noise_data = self.analyze_noise_residual(image)
        color_data = self.analyze_color_temperature_saturation(image)
        ela_val = self.analyze_ela_artifacts(image)

        # Hitung Akumulasi Poin Kecurigaan AI Forensik
        forensic_ai_score = 0.0
        if fft_data["is_anomalous"]:
            forensic_ai_score += 0.22
        if noise_data["is_synthetic"]:
            forensic_ai_score += 0.25
        if color_data["oversaturated_sheen"]:
            forensic_ai_score += 0.15
        if ela_val < 1.1 or ela_val > 9.5:  # Terlalu murni sintetis (<1.1) atau composited (>9.5)
            forensic_ai_score += 0.18

        # Weighted Ensemble:
        # Jika model neural network condong fake ATAU forensik sinyal menemukan anomali kuat
        combined_fake = (0.55 * raw_deepfake_score) + (0.45 * min(1.0, forensic_ai_score * 1.3))

        # Bila model awal ragu (30% - 60%) tetapi sinyal fisik mendeteksi artefak AI, beri boost
        if raw_deepfake_score >= 0.25 and forensic_ai_score >= 0.35:
            combined_fake = max(combined_fake, 0.72)
        elif forensic_ai_score >= 0.55:
            # Bukti forensik fisik sangat mencurigakan (FFT + noise halus khas Midjourney/FLUX)
            combined_fake = max(combined_fake, 0.68)

        final_fake = float(np.clip(combined_fake, 0.01, 0.99))
        final_real = 1.0 - final_fake

        probabilities = {
            "ORISINIL": round(final_real, 4),
            "DEEPFAKE": round(final_fake, 4),
        }

        # Threshold defensif: jika probabilitas DEEPFAKE >= 0.45, tetapkan DEEPFAKE
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
