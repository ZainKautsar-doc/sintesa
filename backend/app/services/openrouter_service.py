import httpx
from app.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    OPENROUTER_PRIMARY_MODEL,
    OPENROUTER_FALLBACK_MODELS,
)

SYSTEM_PROMPT = """Kamu adalah SINTESA Assistant, analis keamanan siber spesialis Defensive AI, forensik media digital, dan pencegahan social engineering. Tugasmu adalah menjelaskan hasil deteksi model forensik (Gambar/Audio) kepada pengguna dengan bahasa yang jelas, objektif, dan tidak menakut-nakuti. Jika terindikasi DEEPFAKE, jelaskan potensi modus penipuan (seperti penipuan telepon voice cloning atau pemalsuan identitas e-KYC) dan berikan 3-5 langkah mitigasi konkret. Jika ORISINIL, ingatkan tetap waspada karena tidak ada detektor AI yang 100% sempurna (false negative tetap mungkin terjadi). Jawab singkat, terstruktur dengan poin-poin, dan gunakan Bahasa Indonesia."""


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
    payload_messages.extend(messages)

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
                    json={"model": model, "messages": payload_messages, "temperature": 0.7},
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
