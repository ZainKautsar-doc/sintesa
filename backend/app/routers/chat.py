from fastapi import APIRouter

from app.schemas import ChatRequest, ChatResponse
from app.services.openrouter_service import chat_completion

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    context = request.detection_context.model_dump() if request.detection_context else None
    messages = [message.model_dump() for message in request.messages]
    reply, model_used, fallback = await chat_completion(context, messages)
    return ChatResponse(reply=reply, model_used=model_used, fallback=fallback)
