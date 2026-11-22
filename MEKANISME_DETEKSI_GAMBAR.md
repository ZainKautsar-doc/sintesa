# Mekanisme Cara Kerja Deteksi Gambar Hingga Assistant

## 1. Ringkasan Alur

Deteksi gambar pada SINTESA berjalan melalui tujuh tahapan berikut:

```text
Pengguna memilih gambar
        ↓
Frontend menampilkan preview dan tombol analisis
        ↓
Gambar dikirim ke backend melalui HTTP
        ↓
Backend memvalidasi format dan ukuran file
        ↓
Model AI klasifikasi memprediksi ORISINIL atau DEEPFAKE
        ↓
Backend membuat analisis ELA dan mengembalikan hasil
        ↓
Frontend menampilkan hasil dan meminta penjelasan ke Assistant
        ↓
Assistant menjelaskan hasil atau menampilkan pesan fallback
```

## 2. Pemilihan dan Preview Gambar

Pengguna memilih gambar dari komputer atau menaruh file ke area upload pada halaman React.

Komponen yang bertugas:

- `frontend/src/components/MediaUploader.tsx`
- `frontend/src/App.tsx`

Format gambar yang diterima:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

Batas ukuran yang digunakan secara default adalah 10 MB.

Saat file dipilih, `File` ditambahkan ke state React. Frontend lalu membuat preview gambar menggunakan `URL.createObjectURL(file)`.

Setelah pengguna menekan tombol **Analisis Media**, frontend memanggil fungsi `detectMedia()` dan mengubah status menjadi `loading` sehingga tombol menampilkan **Menganalisis...**.

## 3. Pengiriman Gambar ke Backend

Fungsi pengiriman gambar berada di:

- `frontend/src/services/api.ts`

Gambar dikirim menggunakan `multipart/form-data` ke endpoint:

```text
POST http://localhost:8000/api/detect/image
```

Isi permintaan berupa field bernama `file` yang berisi gambar yang dipilih pengguna.

## 4. Penerimaan dan Validasi di Backend

Router yang menerima permintaan adalah:

- `backend/app/routers/detect.py`

Langkah yang dilakukan fungsi `detect_image()`:

1. Backend membaca seluruh isi file.
2. Ekstensi gambar diperiksa.
3. Ukuran file diperiksa dan tidak boleh melebihi batas konfigurasi.
4. Gambar dibaca melalui Pillow dan dikonversi menjadi mode RGB.
5. Jika format tidak valid atau ukuran terlalu besar, backend mengirim pesan error.

Validasi ini penting untuk mencegah file yang tidak didukung atau terlalu besar diproses oleh model.

## 5. Pemuatan Model AI

Detektor gambar berada di:

- `backend/app/services/image_detector.py`

Model yang digunakan secara default adalah:

```text
dima806/deepfake_vs_real_image_detection
```

Model dipilih melalui variabel `IMAGE_MODEL_ID` pada `backend/app/config.py`.

Pada permintaan pertama, `ImageDetector.load()` membuat pipeline Hugging Face bertipe `image-classification`.

Pemuatan model dapat memakan waktu lama karena beberapa kondisi berikut:

- Model belum ada di cache komputer.
- Bobot model perlu diunduh dari Hugging Face.
- Ukuran model dapat mencapai ratusan megabyte.
- Inferensi pertama memerlukan proses inisialisasi.

Setelah model berhasil dimuat, objek classifier disimpan pada instance detektor agar permintaan berikutnya tidak perlu mengunduh atau memuat model dari awal.

Backend memilih perangkat berikut secara otomatis:

- GPU CUDA jika tersedia.
- CPU jika GPU CUDA tidak tersedia.

## 6. Proses Prediksi Gambar

Setelah model termuat, gambar dikirim ke pipeline klasifikasi.

Model menghasilkan daftar probabilitas atau skor untuk label tertentu. Label model dinormalisasi oleh SINTESA menjadi dua kategori:

- `ORISINIL`
- `DEEPFAKE`

Proses normalisasi label dilakukan berdasarkan kata pada nama label asli, misalnya:

- Label yang mengandung `real`, `authentic`, atau `original` menjadi `ORISINIL`.
- Label yang mengandung `fake`, `deepfake`, atau `synthetic` menjadi `DEEPFAKE`.

Dua nilai probabilitas digabung menjadi:

- Probabilitas `ORISINIL`
- Probabilitas `DEEPFAKE`

Kemudian nilai probabilitas dinormalisasi agar jumlah keduanya mendekati 1 atau 100%.

Prediksi ditentukan dari kategori dengan nilai terbesar:

- Jika probabilitas `DEEPFAKE` lebih besar, hasilnya `DEEPFAKE`.
- Jika probabilitas `ORISINIL` lebih besar, hasilnya `ORISINIL`.

## 7. Penentuan Tingkat Risiko

Tingkat risiko ditentukan oleh kombinasi prediksi dan confidence:

| Prediksi | Confidence | Risiko |
|---|---:|---|
| DEEPFAKE | ≥ 80% | TINGGI |
| DEEPFAKE | < 80% | SEDANG |
| ORISINIL | ≥ 80% | RENDAH |
| ORISINIL | < 80% | PERLU VERIFIKASI |

Penjelasannya adalah:

- `DEEPFAKE` dengan confidence tinggi menghasilkan risiko tinggi.
- `ORISINIL` tidak berarti bukti mutlak bahwa gambar asli.
- Confidence rendah harus dipadukan dengan verifikasi lain.

## 8. Pembuatan Visualisasi ELA

Setelah prediksi selesai, backend membuat `Error Level Analysis` atau ELA.

Lokasi fungsi:

- `backend/app/services/image_detector.py`

Langkah ELA:

1. Gambar RGB disimpan sebagai JPEG dengan kualitas 90.
2. Hasil JPEG dikompres ulang dibaca kembali.
3. Backend membandingkan gambar asli dengan hasil kompresi.
4. Perbedaan piksel dihitung menggunakan `ImageChops.difference()`.
5. Kontras hasil perbandingan diperkuat.
6. Hasil ELA dikonversi menjadi PNG dan disimpan dalam format `base64`.

Dengan demikian, hasil ELA dapat langsung ditampilkan frontend sebagai data gambar.

ELA membantu memperlihatkan area dengan tingkat perubahan kompresi yang tidak biasa. Namun, ELA bukan bukti mutlak bahwa gambar dimanipulasi.

## 9. Respons Hasil dari Backend

Backend mengembalikan objek respons JSON yang berisi:

- `media_type`: jenis media, yaitu `image`
- `filename`: nama file
- `prediction`: `ORISINIL` atau `DEEPFAKE`
- `confidence`: confidence hasil prediksi
- `probabilities`: probabilitas kedua kategori
- `risk_level`: tingkat risiko
- `processing_time_ms`: lama pemrosesan
- `forensic_visual_base64`: hasil ELA dalam base64
- `forensic_visual_label`: nama visual forensik

Respons dikirim ke frontend, lalu state `result` diperbarui.

## 10. Penyajian Hasil pada Antarmuka

Komponen utama frontend yang menampilkan hasil adalah:

- `frontend/src/components/DetectionResult.tsx`
- `frontend/src/components/SecurityChatbot.tsx`

Setelah hasil diterima, frontend menampilkan:

- Prediksi ORISINIL atau DEEPFAKE.
- Confidence persentase.
- Tingkat risiko.
- Probabilitas kedua kelas.
- Gambar ELA.
- Waktu pemrosesan.

## 11. Panggilan Assistant setelah Analisis

Begitu state `result` diisi, `SecurityChatbot` menjalankan `useEffect()` untuk memanggil API chat secara otomatis.

Pesan awal yang dikirim ke backend adalah:

```text
Tolong jelaskan hasil deteksi ini dan apa yang harus saya lakukan.
```

Endpoint yang dipanggil:

```text
POST http://localhost:8000/api/chat
```

Frontend mengirim:

- `media_type`
- `prediction`
- `confidence`
- `risk_level`
- Riwayat pesan terakhir untuk konteks percakapan

Fungsi frontend yang bertanggung jawab adalah `sendChat()` pada:

- `frontend/src/services/api.ts`

## 12. Pemrosesan Assistant di Backend

Router chat berada di:

- `backend/app/routers/chat.py`

Router memanggil layanan:

- `backend/app/services/openrouter_service.py`

Layanan chat membuat pesan konteks yang berisi hasil deteksi, misalnya:

```text
Jenis media: image
Prediksi: ORISINIL
Confidence: 0.998
Risiko: RENDAH
```

Backend kemudian mengirim konteks tersebut bersama pesan pengguna ke API OpenRouter.

Satu permintaan dapat mencoba model utama lalu model fallback apabila model utama gagal.

## 13. Munculnya Output pada Assistant

Jika OpenRouter berhasil memberikan respons:

1. Backend mengambil isi `choices[0].message.content`.
2. Backend memastikan isi respons berupa string yang tidak kosong.
3. Backend mengembalikan `reply`, `model_used`, dan status `fallback`.
4. Frontend memasukkan `reply` ke dalam riwayat pesan sebagai pesan dari assistant.
5. Pesan ditampilkan pada panel SINTESA Assistant dengan format Markdown.

Jika API key belum dikonfigurasi, OpenRouter tidak tersedia, atau seluruh model gagal:

1. Backend mengembalikan pesan fallback yang valid sebagai string.
2. Frontend tidak menampilkan error blank atau respons `null`.
3. Hasil deteksi tetap tersedia meskipun ringkasan LLM belum dapat dimuat.

## 14. Alur Lengkap Gambar Pertama Kali

Untuk gambar yang dianalisis pertama kali:

```text
1. Pengguna memilih gambar.
2. Frontend mengirim gambar ke backend.
3. Backend memvalidasi file.
4. Backend memuat model Hugging Face.
5. Model diunduh jika belum tersedia di cache.
6. Gambar dikonversi menjadi RGB.
7. Model menghasilkan probabilitas ORISINIL dan DEEPFAKE.
8. Backend menghitung confidence dan tingkat risiko.
9. Backend membuat visualisasi ELA.
10. Backend mengirim seluruh hasil ke frontend.
11. Frontend menampilkan hasil deteksi dan ELA.
12. Frontend memanggil endpoint chat secara otomatis.
13. OpenRouter menghasilkan penjelasan berdasarkan hasil deteksi.
14. Assistant menampilkan ringkasan dan langkah mitigasi.
```

Untuk gambar berikutnya, proses lebih cepat karena model AI tetap disimpan dalam memori dan cache.

## 15. Catatan Penting

- Analisis AI bersifat probabilistik, bukan bukti kepastian.
- Hasil ORISINIL belum tentu memastikan gambar asli.
- Hasil DEEPFAKE perlu dipadukan dengan bukti lain dan verifikasi independen.
- ELA membantu pemeriksaan visual tetapi tidak menggantikan investigasi forensik.
- Assistant bertindak sebagai penjelas dan pemberi rekomendasi, bukan penentu utama kebenaran hasil deteksi.
