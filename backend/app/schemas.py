from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class DetectionResponse(BaseModel):
    media_type: Literal["image", "audio"]
    filename: str
    prediction: Literal["ORISINIL", "DEEPFAKE"]
    confidence: float
    probabilities: Dict[str, float]
    risk_level: Literal["TINGGI", "SEDANG", "RENDAH", "PERLU VERIFIKASI"]
    processing_time_ms: int
    forensic_visual_base64: str
    forensic_visual_label: str


class ChatDetectionContext(BaseModel):
    media_type: Literal["image", "audio"]
    prediction: Literal["ORISINIL", "DEEPFAKE"]
    confidence: float
    risk_level: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    detection_context: Optional[ChatDetectionContext] = None
    messages: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    model_used: str
    fallback: bool = False
