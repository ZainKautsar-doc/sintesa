# SINTESA

**SINTESA** (Sistem Identifikasi Rekayasa Suara dan Citra) adalah aplikasi *defensive AI* untuk mendeteksi manipulasi media pada gambar dan audio. Sistem menggunakan model deep learning lokal dari Hugging Face sebagai deteksi utama, sedangkan LLM OpenRouter bertugas menjelaskan hasil, menganalisis risiko *social engineering*, dan memberikan langkah mitigasi.

> SINTESA tidak menjamin hasil 100% akurat. Prediksi harus dipadukan dengan verifikasi identitas melalui kanal resmi dan independen.

## Fitur Utama

- Deteksi gambar **ORISINIL** atau **DEEPFAKE** melalui model vision pretrained.
- Deteksi audio **ORISINIL** atau **DEEPFAKE** melalui model Wav2Vec2 pretrained.
- Visualisasi **Error Level Analysis (ELA)** untuk gambar.
- Visualisasi **Mel-Spectrogram** untuk audio.
- Rekaman suara langsung dari browser menggunakan `MediaRecorder API`.
- Halaman **Simulasi Probabilitas** untuk mempelajari pembentukan skor Deepfake/Orisinil secara interaktif tanpa mengunggah atau merekam media.
- Penjelasan tahap model untuk media gambar dan audio, contoh kasus, istilah probabilitas, dan confidence.
- Asisten keamanan berbasis OpenRouter dengan sistem fallback model gratis.
- Riwayat chat berbasis state frontend; aplikasi tidak menggunakan database.
- Skrip evaluasi batch untuk gambar dan audio.

## Arsitektur

```text
React + Tailwind
      |
      | HTTP REST / multipart form-data
      v
FastAPI
   ├── /api/detect/image
   ├── /api/detect/audio
   ├── /api/chat
   └── /api/health
      |
      ├── Model Hugging Face lokal (PyTorch/CUDA/CPU)
      └── OpenRouter API
```

Prinsip kerja:

1. Pengguna mengunggah atau merekam media.
2. Backend memvalidasi format dan ukuran file.
3. Model lokal melakukan klasifikasi utama.
4. Backend membuat visualisasi forensik.
5. Frontend menampilkan label, confidence, risiko, dan probabilitas.
6. Hasil dikirim ke OpenRouter untuk ringkasan dan rekomendasi mitigasi.

## Struktur Direktori

```text
sintesa/
├── backend/
│   ├── .env                  # Konfigurasi rahasia lokal
│   ├── .env.example
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── schemas.py
│       ├── routers/
│       └── services/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── evaluation/
│   ├── evaluate_image.py
│   ├── evaluate_audio.py
│   ├── dataset/
│   └── results/
├── PLAN.md
└── README.md
```

## Prasyarat

- Windows 10/11
- Python 3.10+ (disarankan; Python yang tersedia di sistem juga dapat digunakan jika dependency mendukung)
- Node.js 18+
- npm
- FFmpeg untuk pemrosesan format audio tertentu seperti `.webm`
- Koneksi internet untuk mengunduh dependency dan model Hugging Face
- API key OpenRouter untuk fitur chatbot

> Karena model dapat memerlukan ruang disk besar, cache Hugging Face dan virtual environment sebaiknya ditempatkan pada drive dengan ruang kosong yang memadai.

## Konfigurasi Backend

Salin template konfigurasi jika belum tersedia:

```powershell
cd C:\Users\hp\Downloads\FinalProjectKI\backend
Copy-Item .env.example .env
```

Isi `backend/.env`:

```env
OPENROUTER_API_KEY=sk-or-v1-ISI_API_KEY_ANDA
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_PRIMARY_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_FALLBACK_MODELS=google/gemini-2.0-flash-exp:free,openrouter/free

IMAGE_MODEL_ID=dima806/deepfake_vs_real_image_detection
AUDIO_MODEL_ID=MelodyMachine/Deepfake-audio-detection-V2

MAX_FILE_SIZE_MB=10
FRONTEND_ORIGIN=http://localhost:5173
```

Jangan commit `backend/.env`. File tersebut sudah dimasukkan ke `.gitignore`.

## Instalasi dan Menjalankan Backend

Dari folder proyek:

```powershell
cd C:\Users\hp\Downloads\FinalProjectKI\backend
py -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Jika PowerShell menolak eksekusi script:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

Jika venv sudah dibuat dan virtual environment hanya perlu diaktifkan:

```powershell
cd C:\Users\hp\Downloads\FinalProjectKI\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Untuk mengarahkan cache Hugging Face dan pip ke drive lain, misalnya `E:`:

```powershell
mkdir E:\sintesa-cache\huggingface -Force
mkdir E:\sintesa-cache\pip -Force
mkdir E:\sintesa-cache\temp -Force

$env:HF_HOME="E:\sintesa-cache\huggingface"
$env:PIP_CACHE_DIR="E:\sintesa-cache\pip"
$env:TEMP="E:\sintesa-cache\temp"
$env:TMP="E:\sintesa-cache\temp"

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Variabel tersebut berlaku pada terminal yang sedang aktif.

Endpoint backend:

- Health: http://localhost:8000/api/health
- Dokumentasi Swagger: http://localhost:8000/docs
- Deteksi gambar: `POST /api/detect/image`
- Deteksi audio: `POST /api/detect/audio`
- Chat mitigasi: `POST /api/chat`

Backend akan mendeteksi GPU CUDA secara otomatis. Jika GPU tidak tersedia, inferensi berjalan menggunakan CPU.

## Instalasi dan Menjalankan Frontend

Buka terminal baru:

```powershell
cd C:\Users\hp\Downloads\FinalProjectKI\frontend
npm install
npm run dev
```

Frontend tersedia di:

```text
http://localhost:5173
```

Pastikan backend tetap berjalan di port `8000`.

## Build Frontend untuk Produksi

```powershell
cd C:\Users\hp\Downloads\FinalProjectKI\frontend
npm run build
npm run preview
```

Hasil build produksi tersimpan di `frontend/dist/`.

## Format File yang Didukung

### Gambar

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

### Audio

- `.wav`
- `.mp3`
- `.ogg`
- `.flac`
- `.webm`

Batas default adalah **10 MB** dan dapat diubah melalui `MAX_FILE_SIZE_MB` pada `backend/.env`.

## Tingkat Risiko

Penentuan risiko mengikuti confidence hasil prediksi:

| Prediksi | Confidence | Risiko |
|---|---:|---|
| DEEPFAKE | ≥ 80% | TINGGI |
| DEEPFAKE | < 80% | SEDANG |
| ORISINIL | ≥ 80% | RENDAH |
| ORISINIL | < 80% | PERLU VERIFIKASI |

## Modul Evaluasi

Siapkan dataset lokal pada folder berikut:

```text
evaluation/dataset/image/real/
evaluation/dataset/image/fake/
evaluation/dataset/audio/real/
evaluation/dataset/audio/fake/
```

Folder `evaluation/dataset/` diabaikan oleh Git dan tidak boleh berisi data sensitif yang tidak sah untuk digunakan.

Jalankan evaluasi dari root proyek:

```powershell
cd C:\Users\hp\Downloads\FinalProjectKI
python evaluation/evaluate_image.py
python evaluation/evaluate_audio.py
```

Output disimpan ke `evaluation/results/`:

- `metrics_image.json`
- `metrics_audio.json`
- `confusion_matrix_image.png`
- `confusion_matrix_audio.png`
- `error_analysis_image.csv`
- `error_analysis_audio.csv`

Metrik yang dihitung: Accuracy, Precision, Recall, F1-Score, serta jumlah TP, TN, FP, dan FN.

Jika folder dataset kosong, skrip akan menampilkan instruksi yang jelas dan tidak akan menghasilkan metrik palsu.

## Troubleshooting

### Python 3.10 tidak ditemukan

Gunakan interpreter Python yang tersedia:

```powershell
py --version
py -m venv venv
```

### Cakupan disk kurang

Pindahkan virtual environment dan cache ke drive yang memiliki ruang tersedia:

```powershell
mkdir E:\sintesa-venv -Force
Move-Item C:\Users\hp\Downloads\FinalProjectKI\backend\venv E:\sintesa-venv
E:\sintesa-venv\venv\Scripts\Activate.ps1
```

Sesuaikan path jika lokasinya berbeda.

### File `.webm` atau audio gagal diproses

Pasang FFmpeg dan pastikan perintah `ffmpeg -version` dapat dijalankan di terminal.

### Chatbot tidak merespons

Periksa:

1. `OPENROUTER_API_KEY` sudah diisi dan valid.
2. Backend dapat mengakses internet.
3. Model utama masih tersedia.
4. Sistem akan mencoba model fallback secara berurutan.

Jika API OpenRouter gagal, aplikasi tetap menampilkan hasil deteksi lokal beserta pesan fallback yang informatif.

### Health check backend gagal

Pastikan backend berjalan dan buka:

```text
http://localhost:8000/api/health
```

Jika port `8000` digunakan proses lain, jalankan backend pada port berbeda dan sesuaikan `baseURL` frontend pada `frontend/src/services/api.ts`.

## Keamanan dan Privasi

- Tidak menggunakan database.
- Tidak menyimpan riwayat chat secara permanen.
- Riwayat chat hanya disimpan pada state frontend dan direset saat media baru diunggah atau tombol Reset ditekan.
- File audio/dokumen sementara dihapus setelah inferensi.
- `backend/.env` tidak boleh dipublikasikan.
- Hasil deteksi bersifat membantu, bukan bukti tunggal keaslian media.
