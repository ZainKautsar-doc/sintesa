export type MediaType = 'image' | 'audio';
export type Prediction = 'ORISINIL' | 'DEEPFAKE';

export interface DetectionResult {
  media_type: MediaType;
  filename: string;
  prediction: Prediction;
  confidence: number;
  probabilities: Record<'ORISINIL' | 'DEEPFAKE', number>;
  risk_level: 'TINGGI' | 'SEDANG' | 'RENDAH' | 'PERLU VERIFIKASI';
  processing_time_ms: number;
  forensic_visual_base64: string;
  forensic_visual_label: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  model_used: string;
  fallback: boolean;
}
