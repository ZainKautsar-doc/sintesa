# Panduan Evaluasi SINTESA

Taruh dataset uji pada folder:

- `dataset/image/real/` dan `dataset/image/fake/`
- `dataset/audio/real/` dan `dataset/audio/fake/`

Jalankan dari folder proyek:

```powershell
python evaluation/evaluate_image.py
python evaluation/evaluate_audio.py
```

Jika satu folder kosong atau tidak ada sampel, skrip memberikan instruksi dan tidak menghitung metrik palsu. Hasil disimpan ke folder `results/`.
