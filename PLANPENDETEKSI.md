# Rencana Peningkatan Akurasi Deteksi SINTESA (PLANPENDETEKSI.md)

Dokumen ini memuat analisis mendalam mengenai penyebab kegagalan deteksi pada gambar AI-generated dan audio sintetis (TTS/Google Translate), serta rencana arsitektur komprehensif untuk meningkatkan performa deteksi hingga maksimal.

---

## 1. Analisis Akar Masalah (Root Cause Analysis)

### A. Masalah Deteksi Gambar (AI Generated Lolos / Dianggap Orisinil)
1. **Dataset Bias pada Model Saat Ini (`dima806/deepfake_vs_real_image_detection`):**
   - Model ini dilatih terutama pada dataset **FaceForensics++ / Celeb-DF** era lama (fokus pada face-swap / manipulasi wajah orang nyata).
   - Model ini **tidak dilatih** secara spesifik untuk mengenali generator AI generasi terbaru berbasis difusi (seperti Midjourney, Stable Diffusion XL, FLUX, DALL-E 3) yang menghasilkan gambar utuh dari teks (Text-to-Image), bukan sekadar pertukaran wajah.
2. **Ketiadaan Analisis Frekuensi / Spektral Gambar:**
   - Deteksi saat ini hanya mengandalkan satu model klasifikasi RGB spasial (ViT) langsung.
   - Generator AI (Diffusion / GAN) selalu meninggalkan artefak matematis khas pada domain frekuensi (FFT / DCT high-frequency artifacts) yang tidak terlihat secara kasat mata di RGB tetapi sangat jelas di domain Fourier.
3. **Ketiadaan Pemeriksaan Metadata EXIF & Artefak Kompresi Otomatis:**
   - Gambar asli dari kamera/ponsel memiliki metadata EXIF dan pola noise sensor (PRNU) yang konsisten. Gambar buatan AI biasanya tidak memiliki metadata kamera (atau memiliki tag metadata Stable Diffusion / web generator) serta noise yang terlalu halus (*oversmoothed skin/textures*).
4. **Tidak Ada Threshold Calibration:**
   - Sistem saat ini memakai ambang batas naif $50\%$ biner ($P(\text{fake}) \ge 0.5$). Jika model ragu ($51\%$ real vs $49\%$ fake), sistem langsung memvonis Orisinil padahal harusnya diklasifikasikan sebagai anomali / perlu verifikasi lebih lanjut.

---

### B. Masalah Deteksi Audio (Google Translate / TTS Lolos Sebagai Orisinil)
1. **Model Saat Ini Berfokus pada Deepfake Voice Cloning Spesifik, Bukan TTS:**
   - Model `MelodyMachine/Deepfake-audio-detection-V2` dilatih pada dataset seperti ASVspoof yang berfokus pada pemalsuan suara pembicara tertentu (speaker verification spoofing).
   - Suara Google Translate menggunakan sistem **Concatenative / Neural Text-to-Speech (Tacotron / WaveNet)** dengan sinyal vokal yang sangat jernih dan bebas noise latar belakang. Model ASVspoof sering kali salah mengira kejernihan vokal murni tanpa artefak modulasi sebagai suara manusia asli di studio rekaman.
2. **Ketiadaan Detektor Akustik Heuristik (Pitch, Spectral Flatness, Silences):**
   - Suara sintesis TTS (seperti Google Translate) memiliki karakteristik khas:
     - Pitch ($F_0$) dan intonasi yang terlalu robotik/datar atau terlalu konsisten (variabilitas fundamental frequency rendah).
     - Tidak adanya suara napas manusia (*inhalation/exhalation artifacts*).
     - Spektrum frekuensi tinggi terpotong tajam di batas sampling tertentu (misal cut-off di 8 kHz atau 11 kHz khas codec web).
   - Sistem saat ini hanya mengumpankan raw waveform ke Wav2Vec2 tanpa mengevaluasi fitur-fitur akustik biologis manusia.

---

## 2. Rencana Peningkatan Sistem (Multi-Tier & Ensemble Architecture)

Untuk mencapai akurasi maksimal, SINTESA akan beralih dari **pendekatan model tunggal** (*Single Model*) ke **pendekatan Ensemble Multi-Layer (Kombinasi Deep Learning + Forensik Sinyal + Metadata)**:

```text
[ Input Media: Citra / Audio ]
           │
     ┌─────┴─────────────────────────────┐
     ▼                                   ▼
 [LAYER 1: Model Ensemble]        [LAYER 2: Forensik Sinyal & Frekuensi]
 ├── Model AI Generatif (Diffusion/GAN) ├── Gambar: Analisis FFT / DCT / ELA
 └── Model Face-Swap / Deepfake        └── Audio: Pitch Flatness & Zero-Crossing
     └─────────────┬─────────────────────┘
                   ▼
     [LAYER 3: Metadata & Anomali Heuristik]
     ├── EXIF / Header Tags Check
     └── Cut-off Frequency & Noise Consistency
                   ▼
     [LAYER 4: Weighted Decision Engine]
     ├── Dynamic Thresholding & Confidence Calibrator
     └── Klasifikasi Akhir: ORISINIL / DEEPFAKE / SINTETIS AI
```

---

## 3. Rincian Teknis Implementasi

### A. Peningkatan Deteksi Gambar
1. **Model Ensemble Khusus AI-Generated:**
   - Menambahkan/mengganti model yang memang spesifik dilatih mendeteksi AI modern (Diffusion/GAN/Midjourney), misalnya:
     - Model Hugging Face: `Organika/sdxl-detector` atau `umm-maybe/AI-image-detector` atau `roberta/convnext-ai-detector`.
     - Menggabungkan model deteksi wajah (`dima806`) dengan model deteksi gambar sintetik penuh (`AI-image-detector`).
2. **Pemeriksaan Domain Frekuensi (2D FFT Spectrum):**
   - Melakukan transformasi Fourier 2 dimensi pada gambar. Generator AI meninggalkan pola konsentris periodik (*checkerboard artifacts*) pada frekuensi tinggi yang dapat dihitung rata-rata magnitudo energinya.
3. **Analisis ELA Terukur (Quantitative ELA):**
   - ELA saat ini hanya menghasilkan visualisasi untuk mata pengguna. Kita ubah agar backend juga menghitung deviasi standar perbedaan piksel ELA secara otomatis untuk memberi skor kecurigaan kompresi.

### B. Peningkatan Deteksi Audio
1. **Deteksi TTS / Synthetic Voice Heuristik:**
   - Menambahkan ekstraksi fitur akustik via `librosa`:
     - **Variabilitas Pitch ($F_0$ Stdev):** Suara TTS memiliki modulasi pitch yang lebih mekanis dibanding manusia alami.
     - **Spectral Rolloff & High-Frequency Cut-off:** TTS berbasis internet (seperti Google Translate) biasanya memiliki sinyal yang terpotong tajam di frekuensi atas 8 kHz atau 12 kHz.
     - **Jeda Hening & Napas (Voice Activity Detection):** Suara asli memiliki variasi jeda napas mikro dan ambient noise, sedangkan Google Translate menghasilkan noise latar hening mutlak (0 dB digital silence).
2. **Model Tambahan untuk Audio Spoofing / Synthetic:**
   - Evaluasi model audio yang mencakup deteksi TTS/VC kontemporer, misal model berbasis Wav2Vec2 / HuBERT yang di-fine-tune pada multi-TTS datasets.

### C. Mesin Keputusan Terpadu (Ensemble Weighted Scoring)
- Skor Akhir dihitung dengan bobot gabungan:
  $$\text{Score}_{\text{final}} = w_1 \cdot \text{Score}_{\text{Model}} + w_2 \cdot \text{Score}_{\text{Frekuensi/Akustik}} + w_3 \cdot \text{Score}_{\text{Artefak}}$$
- Label keluaran lebih spesifik:
  - `ORISINIL (MANUSIA / ALAMI)`
  - `DEEPFAKE / AI GENERATED`
  - Tambahan indikator sub-kategori: *Face Manipulation* vs *AI Text-to-Image* vs *Synthetic Voice/TTS*.

---

## 4. Tahapan Rencana Kerja (Action Plan)

| Tahap | Tindakan | Target File |
|---|---|---|
| **Tahap 1** | Uji coba model Hugging Face alternatif untuk AI Image Detection & TTS Audio di lingkungan lokal. | `backend/app/config.py`, test script |
| **Tahap 2** | Implementasi modul ekstraksi akustik (Pitch variance, Spectral Rolloff, Silence detection) pada audio detector. | `backend/app/services/audio_detector.py` |
| **Tahap 3** | Implementasi detektor AI generatif dan ekstraksi FFT/anomali frekuensi pada image detector. | `backend/app/services/image_detector.py` |
| **Tahap 4** | Integrasi sistem penilaian ensemble & dynamic threshold di router deteksi. | `backend/app/routers/detect.py` |
| **Tahap 5** | Pembaruan visualisasi frontend agar menampilkan indikator detail (misal: "Terdeteksi Artefak TTS" atau "Pola Difusi AI"). | `frontend/src/components/DetectionResult.tsx` |
| **Tahap 6** | Pengujian menyeluruh menggunakan gambar Midjourney/DALL-E dan audio Google Translate. | Pengujian lokal |
