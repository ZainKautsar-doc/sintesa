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
    if messages:
        latest_message = str(messages[-1].get("content", "")).strip().lower()
        if len(latest_message) > 500:
            return (
                "Pertanyaan terlalu panjang. Ringkas menjadi maks. 500 karakter agar dapat diproses.",
                "none",
                True,
            )
        if latest_message and not any(topic in latest_message for topic in allowed_topics):
            return (
                "SINTESA Assistant hanya menjawab pertanyaan terkait deteksi deepfake, forensik media, verifikasi identitas, serta pencegahan social engineering.",
                "none",
                True,
            )

    # Kirim hanya konteks dan maksimal 6 pesan terakhir untuk mencegah pertumbuhan token.
    payload_messages.extend(messages[-6:] if isinstance(messages, list) else [])

    models = [OPENROUTER_PRIMARY_MODEL, *OPENROUTER_FALLBACK_MODELS]
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in dict.fromkeys(models):
            try:
                response = await client.post(
                    OPENROUTER_BASE_URL,
                    headers=headers,
                    json={
                        "model": model,
                        "messages": payload_messages,
                        "temperature": 0.5,
                        "max_tokens": 220,
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    reply = data["choices"][0]["message"]["content"]
                    return reply, model, False
            except (httpx.HTTPError, KeyError, IndexError, ValueError):
                continue

    return (
        "Asisten LLM sedang tidak tersedia karena layanan atau model gratis sedang mengalami keterbatasan. Hasil deteksi model lokal tetap dapat digunakan.",
        "fallback",
        True,
    )
