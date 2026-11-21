# SINTESA

SINTESA adalah aplikasi defensif untuk mendeteksi gambar dan audio deepfake menggunakan model lokal Hugging Face serta SINTESA Assistant berbasis OpenRouter.

## Struktur

- `backend/`: FastAPI, detektor lokal, dan OpenRouter
- `frontend/`: React, TypeScript, Tailwind
- `evaluation/`: skrip evaluasi batch dan dataset uji lokal

## Instalasi Backend

```powershell
cd backend
py -3.10 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Konfigurasi API tersedia di `backend/.env`. Lengkapi `OPENROUTER_API_KEY` sebelum produksi. FFmpeg perlu tersedia pada PATH untuk format audio tertentu, khususnya `.webm`/rekaman browser.

Endpoint utama:

- `GET http://localhost:8000/api/health`
- `POST http://localhost:8000/api/detect/image`
- `POST http://localhost:8000/api/detect/audio`
- `POST http://localhost:8000/api/chat`

Dokumentasi Swagger tersedia di `http://localhost:8000/docs`.

## Instalasi Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

## Build Produksi Frontend

```powershell
cd frontend
npm run build
npm run preview
```

## Evaluasi Model

Taruh data uji di:

- `evaluation/dataset/image/real/`
- `evaluation/dataset/image/fake/`
- `evaluation/dataset/audio/real/`
- `evaluation/dataset/audio/fake/`

Kemudian jalankan:

```powershell
python evaluation/evaluate_image.py
python evaluation/evaluate_audio.py
```

Output metrik dan visualisasi berada di `evaluation/results/`.

## Catatan Keamanan

- Tidak ada database atau penyimpanan riwayat permanen.
- File diproses secara sementara dan dihapus setelah inferensi audio.
- Model lokal tetap menjadi otoritas klasifikasi utama; LLM hanya menjelaskan dan memberi mitigasi.
