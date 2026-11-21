import os
import tempfile
import time
from pathlib import Path
from PIL import Image, UnidentifiedImageError
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import MAX_FILE_SIZE_MB
from app.schemas import DetectionResponse

image_router_detector = None
audio_router_detector = None

router = APIRouter(prefix="/api/detect", tags=["Detection"])

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
AUDIO_EXTENSIONS = {".wav", ".mp3", ".ogg", ".flac", ".webm"}


def risk_level(prediction: str, confidence: float) -> str:
    if prediction == "DEEPFAKE":
        return "TINGGI" if confidence >= 0.80 else "SEDANG"
    return "RENDAH" if confidence >= 0.80 else "PERLU VERIFIKASI"


def validate_file(filename: str, allowed: set[str], content: bytes) -> None:
    suffix = Path(filename).suffix.lower()
    if suffix not in allowed:
        raise HTTPException(status_code=400, detail=f"Format file tidak didukung: {suffix}")
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Ukuran file melebihi {MAX_FILE_SIZE_MB} MB")


@router.post("/image", response_model=DetectionResponse)
async def detect_image(file: UploadFile = File(...)):
    global image_router_detector
    content = await file.read()
    validate_file(file.filename or "image", IMAGE_EXTENSIONS, content)

    started = time.perf_counter()
    try:
        image = Image.open(__import__("io").BytesIO(content)).convert("RGB")
        if image_router_detector is None:
            from app.services.image_detector import ImageDetector
            image_router_detector = ImageDetector()
        prediction, confidence, probabilities = image_router_detector.predict(image)
        from app.services.image_detector import generate_ela_base64
        visual = generate_ela_base64(image)
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=f"Gambar tidak dapat diproses: {exc}")

    elapsed = int((time.perf_counter() - started) * 1000)
    return DetectionResponse(
        media_type="image",
        filename=file.filename or "image",
        prediction=prediction,
        confidence=confidence,
        probabilities=probabilities,
        risk_level=risk_level(prediction, confidence),
        processing_time_ms=elapsed,
        forensic_visual_base64=visual,
        forensic_visual_label="Error Level Analysis (ELA)",
    )


@router.post("/audio", response_model=DetectionResponse)
async def detect_audio(file: UploadFile = File(...)):
    global audio_router_detector
    content = await file.read()
    validate_file(file.filename or "audio", AUDIO_EXTENSIONS, content)

    suffix = Path(file.filename or "audio").suffix.lower()
    temp_path = None
    started = time.perf_counter()
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(content)
            temp_path = temp.name

        if audio_router_detector is None:
            from app.services.audio_detector import AudioDetector
            audio_router_detector = AudioDetector()

        from app.services.audio_detector import load_audio_segment, generate_spectrogram_base64
        y, sr = load_audio_segment(temp_path)
        prediction, confidence, probabilities = audio_router_detector.predict(y, sr)
        visual = generate_spectrogram_base64(y, sr)
    except (ValueError, OSError, RuntimeError) as exc:
        raise HTTPException(status_code=400, detail=f"Audio tidak dapat diproses: {exc}")
    finally:
        if temp_path:
            try:
                os.unlink(temp_path)
            except FileNotFoundError:
                pass

    elapsed = int((time.perf_counter() - started) * 1000)
    return DetectionResponse(
        media_type="audio",
        filename=file.filename or "audio",
        prediction=prediction,
        confidence=confidence,
        probabilities=probabilities,
        risk_level=risk_level(prediction, confidence),
        processing_time_ms=elapsed,
        forensic_visual_base64=visual,
        forensic_visual_label="Mel-Spectrogram Frekuensi",
    )
