# PLAN.md — SINTESA: Sistem Identifikasi Rekayasa Suara dan Citra sebagai Detektor Deepfake Multimodal untuk Pencegahan Social Engineering

## 1. Ringkasan Proyek

**SINTESA (Sistem Identifikasi Rekayasa Suara dan Citra)** adalah aplikasi web *Defensive AI* berbasis arsitektur *hybrid* (Model Forensik Lokal + Asisten LLM) yang dirancang untuk mendeteksi manipulasi media **gambar (*face-swap* / AI-generated)** dan **audio (*voice cloning* / TTS sintetis)** guna mencegah penipuan *social engineering* dan pembobolan e-KYC.

### Prinsip Utama Arsitektur

1. **Deteksi Utama (Model Spesialis Lokal):** Klasifikasi keaslian media (`ORISINIL` vs `DEEPFAKE`) **wajib** dilakukan oleh model *deep learning pretrained* dari Hugging Face yang dijalankan di backend Python, bukan oleh LLM. Hal ini menjamin akurasi forensik dan memungkinkan evaluasi metrik secara terukur.

2. **Asisten Respons & Mitigasi (OpenRouter LLM):** Hasil klasifikasi (label, *confidence score*, jenis media) diteruskan ke LLM gratis via API OpenRouter untuk memberikan penjelasan yang mudah dipahami pengguna, analisis risiko *social engineering*, langkah mitigasi, serta fitur tanya-jawab interaktif.

3. **Stateless Design:** Aplikasi berjalan secara *stateless* tanpa database. File yang diunggah diproses sementara di memori/direktori temporer lalu langsung dihapus setelah inferensi selesai. Riwayat percakapan chatbot disimpan di *state* sisi klien (*frontend*).

## 2. Arsitektur Sistem & Alur Data

```
+-------------------------------------------------------------------+
|                   FRONTEND (React + Tailwind CSS)                 |
|  [Tab Gambar]  [Tab Audio + Rekam Mic]  [Panel Hasil + Forensik]  |
|                [Panel Chatbot Mitigasi (Stateless)]               |
+---------------------------------+---------------------------------+
                                  | HTTP REST API (JSON / Multipart)
                                  v
+-------------------------------------------------------------------+
|                     BACKEND (Python FastAPI)                      |
|  1. /api/detect/image  ---> HF Pretrained Vision Model + ELA Map  |
|  2. /api/detect/audio  ---> HF Pretrained Audio Model + Mel-Spec  |
|  3. /api/chat          ---> OpenRouter API (Free LLM + Fallback)  |
+---------------------------------+---------------------------------+
                                  |
             +--------------------+--------------------+
             v                                         v
+--------------------------+             +--------------------------+
| Local Inference Engine   |             | OpenRouter External API  |
| PyTorch (CUDA / CPU)     |             | Free Tier Models         |
| Hugging Face Transformers|             | (Cybersecurity Advisor)  |
+--------------------------+             +--------------------------+

```

## 3. Tech Stack

### Frontend (`/frontend`)

* **Framework:** React (Vite) + TypeScript (atau JSX sesuai inisialisasi Vite)

* **Styling:** Tailwind CSS (tema *Dark Mode* bernuansa keamanan siber dengan efek *glassmorphism* halus)

* **Icons:** `lucide-react`

* **HTTP Client:** `axios` atau `fetch` native

* **Markdown Rendering:** `react-markdown` (untuk merender respons rapi dari chatbot)

### Backend (`/backend`)

* **Framework:** Python 3.10+, FastAPI, Uvicorn

* **AI & Machine Learning:** `torch`, `transformers`, `timm`, `accelerate` (otomatis mendeteksi GPU CUDA jika tersedia, fallback ke CPU)

* **Pemrosesan Gambar & Forensik:** `Pillow`, `numpy` (untuk *preprocessing* dan visualisasi *Error Level Analysis* / ELA)

* **Pemrosesan Audio & Forensik:** `librosa`, `soundfile`, `matplotlib` (untuk *resampling* 16kHz mono dan visualisasi *Mel-Spectrogram*)

* **Integrasi OpenRouter:** `httpx` (async HTTP client)

* **Utilities:** `python-multipart`, `python-dotenv`, `pydantic`

### Modul Evaluasi (`/evaluation`)

* **Libraries:** `scikit-learn`, `pandas`, `matplotlib`, `seaborn`, `tqdm`

* **Output:** Metrik *Accuracy, Precision, Recall, F1-Score*, gambar *Confusion Matrix* (`.png`), serta laporan analisis *False Positive* & *False Negative* (`.csv` & `.json`).

## 4. Struktur Direktori Proyek

AI Agent harus membuat dan mengikuti struktur direktori berikut:

```
sintesa/
├── .gitignore
├── PLAN.md
├── README.md
├── backend/
│   ├── .env                          # JANGAN di-commit ke Git
│   ├── .env.example                  # Template variabel environment
│   ├── requirements.txt
│   └── app/
│       ├── main.py                   # Entry point FastAPI & CORS config
│       ├── config.py                 # Load env vars & konstanta model
│       ├── schemas.py                # Pydantic models (Request/Response)
│       ├── routers/
│       │   ├── detect.py             # Endpoint /api/detect/image & /audio
│       │   └── chat.py               # Endpoint /api/chat (OpenRouter)
│       └── services/
│           ├── image_detector.py     # HF Vision model + generator ELA
│           ├── audio_detector.py     # HF Audio model + generator Mel-Spectrogram
│           └── openrouter_service.py # Integrasi OpenRouter + fallback free model
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── types/
│       │   └── index.ts              # Interface TypeScript hasil deteksi & chat
│       ├── services/
│       │   └── api.ts                # Fungsi pemanggilan ke FastAPI
│       └── components/
│           ├── Navbar.tsx            # Header SINTESA + indikator status backend
│           ├── MediaUploader.tsx     # Drag & drop + audio recorder opsional
│           ├── DetectionResult.tsx   # Kartu hasil, skor, visualisasi ELA/Spectrogram
│           └── SecurityChatbot.tsx   # Panel chat interaktif berbasis konteks deteksi
└── evaluation/
    ├── README_EVAL.md                # Panduan menaruh dataset uji
    ├── evaluate_image.py             # Evaluasi batch model gambar
    ├── evaluate_audio.py             # Evaluasi batch model audio
    ├── dataset/                      # (Di-ignore Git) Folder data uji lokal
    │   ├── image/
    │   │   ├── real/
    │   │   └── fake/
    │   └── audio/
    │       ├── real/
    │       └── fake/
    └── results/                      # Output confusion matrix & CSV FP/FN

```

## 5. Konfigurasi Environment & Keamanan

### File `backend/.env`

AI Agent wajib membuat file `backend/.env` dengan isi berikut (pengguna akan melengkapi karakter yang dihapus pada `OPENROUTER_API_KEY` secara manual sebelum menjalankan produksi):

```
# OpenRouter Configuration
# CATATAN: Sesuaikan/lengkapi karakter API key asli sebelum menjalankan aplikasi
OPENROUTER_API_KEY=sk-or-v1-46658a0520327dc5ca038a3d46931d9c000abba9d84d2f9dd6de55f8b26f217
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_PRIMARY_MODEL=meta-llama/llama-3.3-70b-instruct:free
OPENROUTER_FALLBACK_MODELS=google/gemini-2.0-flash-exp:free,openrouter/free

# Hugging Face Pretrained Models
IMAGE_MODEL_ID=dima806/deepfake_vs_real_image_detection
AUDIO_MODEL_ID=MelodyMachine/Deepfake-audio-detection-V2

# Server Settings
MAX_FILE_SIZE_MB=10
FRONTEND_ORIGIN=http://localhost:5173

```

### Aturan `.gitignore`

Wajib menyertakan:

* `backend/.env`

* `**/__pycache__/`

* `backend/venv/`, `.venv/`

* `frontend/node_modules/`, `frontend/dist/`

* `evaluation/dataset/` (agar file dataset besar tidak terunggah ke Git)

## 6. Spesifikasi Detail Backend (FastAPI)

### A. Detektor Gambar (`services/image_detector.py`)

* **Model Pretrained:** `dima806/deepfake_vs_real_image_detection` (berbasis ViT via `transformers.pipeline("image-classification")` atau `AutoImageProcessor` + `AutoModelForImageClassification`).

* **Normalisasi Label:** Petakan label mentah model (`Real`, `Fake`, `real`, `fake`, `LABEL_0`, dll.) menjadi standar konsisten: `"ORISINIL"` atau `"DEEPFAKE"`.

* **Visualisasi Forensik (ELA - Error Level Analysis):**

  * Buat fungsi `generate_ela_base64(pil_image)` yang menyimpan ulang gambar ke buffer JPEG kualitas 90%, menghitung selisih piksel (`ImageChops.difference`), meningkatkan kontrasnya, lalu mengembalikannya sebagai string `data:image/png;base64,...`.

  * Tujuannya memberi bukti visual area kompresi/manipulasi saat demo.

* **Validasi:** Terima format `.jpg`, `.jpeg`, `.png`, `.webp`. Batas ukuran 10 MB.

### B. Detektor Audio (`services/audio_detector.py`)

* **Model Pretrained:** `MelodyMachine/Deepfake-audio-detection-V2` (berbasis Wav2Vec2 via `transformers`).

* **Preprocessing Audio:**

  * Muat file menggunakan `librosa.load(temp_path, sr=16000, mono=True)` (wajib *resample* ke 16kHz mono).

  * Potong atau proses segmen maksimal 15–30 detik pertama jika file terlalu panjang agar mencegah *Out of Memory* (OOM).

  * Hapus file temporer di blok `finally`.

* **Normalisasi Label:** Petakan output model (`real`/`bonafide` vs `fake`/`spoof`) menjadi standar: `"ORISINIL"` atau `"DEEPFAKE"`.

* **Visualisasi Forensik (Mel-Spectrogram):**

  * Buat fungsi `generate_spectrogram_base64(y, sr)` menggunakan `librosa.feature.melspectrogram` + `matplotlib` (tema gelap `magma` atau `inferno`, tanpa *axis* berlebihan) dan kembalikan sebagai `data:image/png;base64,...`.

* **Validasi:** Terima format `.wav`, `.mp3`, `.ogg`, `.flac`, `.webm` (untuk hasil rekaman mikrofon browser).

### C. Layanan Chatbot OpenRouter (`services/openrouter_service.py`)

* **Mekanisme Fallback Otomatis:** Karena model *free* di OpenRouter terkadang mengalami *rate limit* (`429`), implementasikan *loop* percobaan berurutan: mulai dari `OPENROUTER_PRIMARY_MODEL`, jika gagal/timeout coba satu per satu dari `OPENROUTER_FALLBACK_MODELS`.

* **System Prompt (Bahasa Indonesia):**

  > "Kamu adalah SINTESA Assistant, analis keamanan siber spesialis Defensive AI, forensik media digital, dan pencegahan social engineering. Tugasmu adalah menjelaskan hasil deteksi model forensik (Gambar/Audio) kepada pengguna dengan bahasa yang jelas, objektif, dan tidak menakut-nakuti. Jika terindikasi DEEPFAKE, jelaskan potensi modus penipuan (seperti penipuan telepon voice cloning atau pemalsuan identitas e-KYC) dan berikan 3-5 langkah mitigasi konkret. Jika ORISINIL, ingatkan tetap waspada karena tidak ada detektor AI yang 100% sempurna (false negative tetap mungkin terjadi). Jawab singkat, terstruktur dengan poin-poin, dan gunakan Bahasa Indonesia."

### D. Kontrak API Endpoints

1. **`GET /api/health`**

   * Mengembalikan status server, status model (sudah dimuat/belum), dan *device* aktif (`cuda` atau `cpu`).

2. **`POST /api/detect/image`** (`multipart/form-data`, field: `file`)

   * **Response JSON:**

     ```
     {
       "media_type": "image",
       "filename": "sample.jpg",
       "prediction": "DEEPFAKE",
       "confidence": 0.9421,
       "probabilities": {
         "ORISINIL": 0.0579,
         "DEEPFAKE": 0.9421
       },
       "risk_level": "TINGGI",
       "processing_time_ms": 215,
       "forensic_visual_base64": "data:image/png;base64,...",
       "forensic_visual_label": "Error Level Analysis (ELA)"
     }
     
     ```

3. **`POST /api/detect/audio`** (`multipart/form-data`, field: `file`)

   * **Response JSON:** Struktur identik dengan `/api/detect/image`, dengan `media_type: "audio"` dan `forensic_visual_label: "Mel-Spectrogram Frekuensi"`.

4. **`POST /api/chat`** (`application/json`)

   * **Request JSON:**

     ```
     {
       "detection_context": {
         "media_type": "audio",
         "prediction": "DEEPFAKE",
         "confidence": 0.915,
         "risk_level": "TINGGI"
       },
       "messages": [
         { "role": "user", "content": "Tolong jelaskan hasil deteksi ini dan apa yang harus saya lakukan." }
       ]
     }
     
     ```

   * **Response JSON:**

     ```
     {
       "reply": "...",
       "model_used": "meta-llama/llama-3.3-70b-instruct:free"
     }
     
     ```

### E. Penentuan `risk_level`

* Jika `prediction == "DEEPFAKE"` dan `confidence >= 0.80` -> `"TINGGI"`

* Jika `prediction == "DEEPFAKE"` dan `confidence < 0.80` -> `"SEDANG"`

* Jika `prediction == "ORISINIL"` dan `confidence >= 0.80` -> `"RENDAH"`

* Jika `prediction == "ORISINIL"` dan `confidence < 0.80` -> `"PERLU VERIFIKASI"`

## 7. Spesifikasi Detail Frontend (React + Tailwind CSS)

### Tema & Pengalaman Pengguna (UX)

* **Estetika:** Dark Mode (`bg-slate-950`, kartu `bg-slate-900/70 backdrop-blur border border-slate-800`), aksen warna *emerald* untuk `ORISINIL`, *rose/red* untuk `DEEPFAKE`, dan *amber* untuk `PERLU VERIFIKASI`.

* **Layout Responsif (2 Kolom pada Desktop):**

  * **Kolom Kiri (Area Pengujian & Forensik):**

    1. Tab pemilih mode: **Deteksi Gambar** | **Deteksi Audio**.

    2. Area *Drag & Drop* file + preview gambar asli atau *audio player* bawaan.

    3. Khusus Tab Audio: sediakan tombol opsional **"Rekam Suara (Mikrofon)"** menggunakan browser `MediaRecorder API` untuk demo *live* suara asli.

    4. Tombol **"Analisis Media"** dengan indikator *loading spinner*.

    5. **Kartu Hasil Forensik:** Menampilkan badge besar (`ORISINIL` / `DEEPFAKE`), *progress bar* probabilitas kedua kelas, waktu proses (ms), serta tampilan *side-by-side* atau *toggle* visualisasi **ELA** (untuk gambar) / **Mel-Spectrogram** (untuk audio).

  * **Kolom Kanan (Panel SINTESA Assistant):**

    1. Begitu hasil deteksi muncul, frontend otomatis mengirimkan 1 permintaan awal ke `/api/chat` agar chatbot langsung menjelaskan analisis risiko & langkah mitigasi tanpa perlu diketik manual.

    2. Sediakan *quick prompt chips* di bawah chat (misal: *"Bagaimana cara verifikasi e-KYC aman?"*, *"Ciri penipuan voice cloning?"*, *"Kenapa hasil ini bisa keliru?"*).

    3. Pengguna dapat mengetik pertanyaan lanjutan secara interaktif (riwayat chat direset saat pengguna mengunggah file baru atau menekan tombol *Reset*).

## 8. Spesifikasi Modul Evaluasi (`/evaluation`)

Modul ini wajib dibangun dengan rapi untuk memenuhi kebutuhan laporan akhir dan presentasi demo (metrik *Precision*, *Recall*, *F1-Score*, serta bedah *False Positive* dan *False Negative*).

### Fitur pada `evaluate_image.py` dan `evaluate_audio.py`

1. Membaca seluruh file dari `evaluation/dataset/{image|audio}/real/` (ground truth = `0` / `ORISINIL`) dan `.../fake/` (ground truth = `1` / `DEEPFAKE`).

2. Mengimpor langsung fungsi inferensi dari `backend/app/services/` agar hasil evaluasi 100% konsisten dengan aplikasi web.

3. Menghitung dan mencetak ke terminal serta menyimpan ke `evaluation/results/metrics_{image|audio}.json`:

   * Total sampel uji (Real vs Fake)

   * `Accuracy`, `Precision`, `Recall`, `F1-Score` (dengan kelas positif = `DEEPFAKE`)

   * Jumlah `TP` (True Positive), `TN` (True Negative), `FP` (False Positive), `FN` (False Negative)

4. Membuat dan menyimpan grafik *Confusion Matrix* beresolusi tinggi (300 DPI) ke `evaluation/results/confusion_matrix_{image|audio}.png`.

5. Mengekspor daftar seluruh prediksi salah ke `evaluation/results/error_analysis_{image|audio}.csv` dengan kolom:

   * `filename`, `actual_label`, `predicted_label`, `confidence_fake`, `error_type` (`FALSE_POSITIVE` atau `FALSE_NEGATIVE`).

   * File CSV ini memudahkan tim membedah kasus *False Positive* & *False Negative* di laporan.

## 9. Tahapan Eksekusi AI Agent (Checklist Implementasi)

AI Agent harus mengerjakan proyek ini secara berurutan per fase dan memverifikasi setiap fase sebelum lanjut:

* [ ] **Fase 1: Inisialisasi Struktur & Environment**

  * Buat seluruh struktur folder (`backend/`, `frontend/`, `evaluation/`).

  * Buat `.gitignore`, `backend/.env`, `backend/.env.example`, dan `backend/requirements.txt`.

* [ ] **Fase 2: Implementasi Backend & Model Pretrained**

  * Implementasikan `config.py` dan `schemas.py`.

  * Implementasikan `image_detector.py` (model HF + ELA) dan `audio_detector.py` (model HF + Mel-Spectrogram) dengan deteksi otomatis CUDA/CPU dan *lazy/startup loading*.

  * Implementasikan `openrouter_service.py` lengkap dengan sistem *fallback* model gratis dan penanganan *error* API yang ramah pengguna.

  * Implementasikan router `detect.py`, `chat.py`, dan `main.py` (aktifasi CORS untuk `http://localhost:5173`).

* [ ] **Fase 3: Implementasi Frontend (React + Tailwind)**

  * Inisialisasi Vite React + Tailwind CSS di folder `/frontend`.

  * Bangun komponen `Navbar`, `MediaUploader` (termasuk fitur rekam suara), `DetectionResult` (termasuk tampilan ELA/Spectrogram), dan `SecurityChatbot`.

  * Hubungkan seluruh alur *upload* -> tampilkan hasil forensik -> auto-trigger ringkasan OpenRouter -> chat lanjutan.

* [ ] **Fase 4: Implementasi Modul Evaluasi**

  * Buat `evaluation/evaluate_image.py`, `evaluation/evaluate_audio.py`, dan `evaluation/README_EVAL.md`.

  * Pastikan skrip menangani kasus folder kosong secara informatif (memberikan instruksi jelas cara mengisi sampel dataset uji).

* [ ] **Fase 5: Verifikasi & Dokumentasi**

  * Tulis `README.md` utama berisi panduan instalasi lengkap (`venv`, `pip install`, `ffmpeg` check jika perlu, `npm install`), cara menjalankan backend & frontend, dan cara menjalankan skrip evaluasi.

  * Uji endpoint `/api/health` serta pastikan build frontend (`npm run build`) bebas dari *syntax/type error*.

## 10. Panduan Teknis Tambahan untuk AI Agent

1. **Manajemen Memori Model:** Jangan memuat ulang model Hugging Face di setiap *request*. Gunakan pola *Singleton* atau *lifespan* FastAPI agar model dimuat sekali saja ke memori/VRAM. Sediakan opsi *lazy loading* jika *startup* terlalu lama saat pengembangan.

2. **Penanganan Error OpenRouter:** Jika API key belum lengkap atau sedang terkena *rate limit*, endpoint `/api/chat` tidak boleh membuat aplikasi *crash*. Kembalikan pesan informatif (status 200 dengan flag `fallback: true` atau pesan jelas) sambil tetap menampilkan hasil deteksi utama dari model lokal.

3. **Kompatibilitas Format Audio:** Pastikan `audio_detector.py` dapat menangani file `.wav` dan `.mp3` dengan mulus. Jika browser merekam dalam format `.webm`, gunakan `librosa` atau konversi ringan (sertakan catatan dependensi `ffmpeg` di `README.md` jika dibutuhkan oleh `librosa`/`audioread`).

4. **Kode Bersih & Modular:** Pisahkan logika bisnis (`services/`) dari *routing* (`routers/`), serta gunakan *type hints* Python dan TypeScript secara konsisten.