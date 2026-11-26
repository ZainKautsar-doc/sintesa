import asyncio
import httpx
from app.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    OPENROUTER_PRIMARY_MODEL,
    OPENROUTER_FALLBACK_MODELS,
)

SYSTEM_PROMPT = """Kamu adalah SINTESA Assistant, analis keamanan siber spesialis Defensive AI dan pencegahan social engineering. Jawab secara singkat, jelas, objektif, dan langsung ke inti dalam Bahasa Indonesia.

ATURAN WAJIB:
- Maksimal 150 kata untuk satu jawaban.
- Gunakan maksimal 3-5 poin penting.
- Jangan mengulang konteks hasil deteksi secara panjang.
- Jangan memberikan latar belakang atau penjelasan bertele-tele.
- Untuk hasil DEEPFAKE, jelaskan risiko yang paling relevan dan berikan langkah mitigasi konkret.
- Untuk hasil ORISINIL, ingatkan secara singkat bahwa deteksi AI belum 100% dan tetap lakukan verifikasi.
- Jika pengguna bertanya secara spesifik, jawab pertanyaan itu terlebih dahulu tanpa menambah informasi yang tidak diminta."""


async def chat_completion(detection_context: dict | None, messages: list[dict]) -> tuple[str, str, bool]:
    if not OPENROUTER_API_KEY or not OPENROUTER_API_KEY.startswith("sk-or-"):
        return (
            "Asisten LLM belum dapat digunakan karena OPENROUTER_API_KEY belum dikonfigurasi. Hasil deteksi model lokal tetap tersedia.",
            "none",
            True,
        )

    context_text = ""
    if detection_context:
        context_text = (
            "Konteks hasil deteksi:\n"
            f"- Jenis media: {detection_context.get('media_type')}\n"
            f"- Prediksi: {detection_context.get('prediction')}\n"
            f"- Confidence: {detection_context.get('confidence')}\n"
            f"- Risiko: {detection_context.get('risk_level')}"
        )

    payload_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context_text:
        payload_messages.append({"role": "system", "content": context_text})
    allowed_topics = (
        "deepfake", "gambar", "audio", "video", "suara", "voice", "rekam",
        "deteksi", "keaslian", "orisinal", "forensik", "ela", "spectrogram",
        "saya", "verifikasi", "e-kyc", "ekyc", "social engineering", "phishing",
        "penipuan", "mitigasi", "keamanan", "hasil", "media", "kloning",
        "deep fake", "impostor", "identitas", "risiko", "confidence",
    )
    # Kirim seluruh riwayat percakapan tanpa pembatasan jumlah pesan/karakter.
    payload_messages.extend(messages if isinstance(messages, list) else [])

    extra_fallbacks = [
        "openrouter/free",
        "google/gemma-3-27b-it:free",
        "mistralai/mistral-small-3.1-24b-instruct:free",
        "qwen/qwen-2.5-72b-instruct:free",
    ]
    models = list(dict.fromkeys([OPENROUTER_PRIMARY_MODEL, *OPENROUTER_FALLBACK_MODELS, *extra_fallbacks]))
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in models:
            for attempt in range(2):
                try:
                    response = await client.post(
                        OPENROUTER_BASE_URL,
                        headers=headers,
                        json={
                            "model": model,
                            "messages": payload_messages,
                            "temperature": 0.5,
                            "max_tokens": 1024,
                        },
                    )
                    if response.status_code == 200:
                        data = response.json()
                        reply = data["choices"][0]["message"].get("content")
                        if isinstance(reply, str) and reply.strip():
                            return reply.strip(), model, False
                    if response.status_code == 429 and attempt == 0:
                        await asyncio.sleep(1.0)
                        continue
                    break
                except (httpx.HTTPError, KeyError, IndexError, ValueError):
                    break

    if detection_context:
        pred = detection_context.get("prediction", "UNKNOWN")
        conf = detection_context.get("confidence", 0)
        risk = detection_context.get("risk_level", "SEDANG")
        return (
            f"Ringkasan Lokal: Media terdeteksi sebagai **{pred}** (keyakinan {conf:.1%}, risiko **{risk}**). "
            "Lakukan verifikasi silang melalui saluran resmi sebelum mengambil keputusan.",
            "local-fallback",
            True,
        )

    return (
        "Asisten LLM sedang mengalami antrean pada layanan eksternal. Silakan kirim ulang pertanyaan Anda beberapa saat lagi.",
        "fallback",
        True,
    )
