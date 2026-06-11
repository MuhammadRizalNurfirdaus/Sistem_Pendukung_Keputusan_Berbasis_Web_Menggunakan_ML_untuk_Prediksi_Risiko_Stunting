# 🧠 Modul Machine Learning (FastAPI & Random Forest)

Tujuan utama dari modul Machine Learning ini adalah membangun sistem klasifikasi risiko stunting dan Sistem Peringatan Dini (*Early Warning System*) berbasis AI. Modul ini diintegrasikan ke dalam aplikasi web menggunakan **FastAPI** yang berjalan dalam kontainer Docker.

---

## 🛠️ Perubahan Terbaru (v2.4.0)

Modul ML telah diperbarui dengan stabilitas tingkat produksi sebagai berikut:
1. **Robust Model Loading**: Logika pengenalan model di [model.py](file:///home/rizal/MyProject/Pijak/Sistem_Pendukung_Keputusan_Berbasis_Web_Menggunakan_Machine_Learning_untuk_Prediksi_Risiko_Stunting_pada_Anak/ML/src/modelling/model.py) diperkuat. Sistem secara dinamis mencari subdirektori model di dalam `mlruns/569065162946818888/models/` dan memvalidasi bahwa model tersebut dilatih dengan **11 fitur lengkap** (termasuk fitur medis `Z_Score_Akhir`).
2. **Native Sklearn Loading**: Mengubah pemanggilan pemuatan model dari `mlflow.pyfunc.load_model` menjadi `mlflow.sklearn.load_model`. Ini memungkinkan model mengembalikan probabilitas prediksi secara akurat menggunakan method bawaan `.predict_proba()`.
3. **Penyelarasan Endpoint & Bugfix**: Memperbaiki bug typo pada endpoint ekstrapolasi massal `/api/predict/bulk-future` di mana variabel `df_fitur` diubah menjadi `df_future` untuk menghindari error eksekusi pandas DataFrame.
4. **Volume Mount & Sync**: Mendukung pemuatan volume dinamis Docker `./ML/mlruns:/app/mlruns` sehingga sinkronisasi model baru via `scp` dari komputer lokal langsung terdeteksi oleh kontainer ML setelah dilakukan restart service.

---

## 📂 Struktur Direktori ML

```
ML/
├── main.py                   # Entrypoint server FastAPI
├── requirements.txt          # Dependensi pustaka Python
├── mlruns/                   # Folder repositori model MLflow (Diabaikan oleh Git)
│   └── 569065162946818888/   # Eksperimen ID Model Aktif
│       └── models/           # Berisi subdirektori versi model
├── src/
│   ├── preprocessing/        # Pembersihan data & validasi Excel
│   └── modelling/
│       └── model.py          # Logika pemuatan model & fungsi prediksi
└── monitoring/               # Konfigurasi Prometheus
```

---

## 🎯 Fitur Input Model (11 Fitur Lengkap)

Model Random Forest memprediksi status stunting berdasarkan parameter berikut:
1. `Umur (Bulan)`
2. `Jenis Kelamin` (L/P)
3. `BB_Awal`
4. `TB_Awal`
5. `BB_Akhir`
6. `TB_Akhir`
7. `Lama_Pantau_Bulan`
8. `Kecepatan_Tumbuh_BB`
9. `Kecepatan_Tumbuh_TB`
10. `Rasio_BB_TB_Akhir`
11. `Z_Score_Akhir` (Jangkar Medis WHO)

---

## 🚀 Cara Menjalankan Modul ML secara Lokal

1. Buat & aktifkan virtual environment Python:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Instal dependensi:
   ```bash
   pip install -r requirements.txt
   ```

3. Jalankan server FastAPI:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   * Dokumentasi Swagger API interaktif dapat diakses pada [http://localhost:8000/docs](http://localhost:8000/docs).
