import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_ORIGIN
from app.routers.detect import router as detect_router
from app.routers.chat import router as chat_router

app = FastAPI(title="SINTESA API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detect_router)
app.include_router(chat_router)


@app.get("/api/health")
async def health():
    image_loaded = False
    audio_loaded = False
    try:
        from app.routers.detect import image_router_detector, audio_router_detector
        image_loaded = bool(image_router_detector and image_router_detector.loaded)
        audio_loaded = bool(audio_router_detector and audio_router_detector.loaded)
    except Exception:
        pass

    return {
        "status": "ok",
        "server": "running",
        "models_loaded": {"image": image_loaded, "audio": audio_loaded},
        "device": "cuda" if torch.cuda.is_available() else "cpu",
    }
