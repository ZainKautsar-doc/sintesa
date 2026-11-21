import axios from 'axios';
import type { ChatMessage, ChatResponse, DetectionResult, MediaType } from '../types';

const api = axios.create({ baseURL: 'http://localhost:8000' });

export async function getHealth() {
  const { data } = await api.get('/api/health');
  return data;
}

export async function detectMedia(mediaType: MediaType, file: File): Promise<DetectionResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/api/detect/${mediaType}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function sendChat(
  detectionContext: DetectionResult | null,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  const context = detectionContext
    ? {
        media_type: detectionContext.media_type,
        prediction: detectionContext.prediction,
        confidence: detectionContext.confidence,
        risk_level: detectionContext.risk_level,
      }
    : null;
  const { data } = await api.post('/api/chat', { detection_context: context, messages });
  return data;
}
