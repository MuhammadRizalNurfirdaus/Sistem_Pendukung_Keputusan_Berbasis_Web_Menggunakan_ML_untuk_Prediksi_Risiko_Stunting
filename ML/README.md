# Proyek Prediksi Stunting Berbasis Machine Learning (Random Forest)

Tujuan utama dari modul Machine Learning ini adalah membangun sebuah sistem klasifikasi cerdas dan Sistem Peringatan Dini (*Early Warning System*) menggunakan algoritma Random Forest. Sistem ini dirancang untuk mendeteksi risiko *Faltering Growth* (Gagal Tumbuh) dan memprediksi status Stunting berdasarkan rekam jejak pertumbuhan fisik balita.

Berbeda dengan sistem deteksi statis, arsitektur ML pada proyek ini bersifat hibrida (*Hybrid Architecture*): menggabungkan kepastian medis dari Rumus Z-Score WHO dengan kemampuan prediktif AI melalui fitur kecepatan tumbuh (*Growth Velocity*), memungkinkan deteksi pada berbagai durasi pemantauan masa depan.

---

## Struktur Direktori

*   **`data/`**: Direktori penyimpanan dataset utama.
    *   `raw/`: Tempat menyimpan file Excel mentah asli dari Posyandu (`dataset_posyandu.xlsx`). Data di dalam folder ini dijaga keasliannya dan merupakan representasi langsung dari *ground truth* lapangan.
    *   `processed/`: Tempat menyimpan dataset final (`dataset_final_training.csv`) yang telah melalui tahap pembersihan, ekstraksi fitur, augmentasi (simulasi parametrik), dan penyeimbangan (*balancing*). File ini berisi ~602 baris data latih yang sangat *robust* secara medis.
*   **`notebooks/`**: Ruang eksperimen utama.
    *   `generate_dummy_data.ipynb`: Tahap pembersihan data, ekstraksi fitur (*Feature Engineering*), Injeksi Z-Score WHO, Simulasi Parametrik (Injeksi 500 Data), dan augmentasi SMOTE. Dilengkapi visualisasi pembuktian medis (*EDA Faltering Growth*).
    *   `modelling_experiment.ipynb`: Tahap pelatihan algoritma Random Forest, evaluasi akurasi metrik, visualisasi *Feature Importance*, dan pendaftaran model ke dalam *registry* MLflow.
*   **`src/`**: Direktori yang berisi *source code* Python berstruktur modular (termasuk FastAPI) yang siap diintegrasikan dengan *backend* Aplikasi Web.
*   **`mlruns/`**: Direktori pelacakan dari *framework* MLflow untuk menyimpan versi model dan metrik akurasi.

---

## Arsitektur Data & Strategi Machine Learning

Untuk memastikan model mencapai akurasi tinggi dan memiliki relevansi medis yang valid (bebas dari akurasi semu), pipeline ML ini menerapkan strategi kelas industri:

### 1. Injeksi Z-Score WHO (Jangkar Klinis)
Sistem secara dinamis menghitung dan menyuntikkan nilai mutlak `Z_Score_Akhir` berdasarkan tabel standar WHO LMS untuk Tinggi-terhadap-Umur. Fitur ini berfungsi sebagai "Jangkar Medis" agar model Machine Learning memiliki pijakan kuat terhadap standar medis internasional, bukan sekadar menebak angka buta.

### 2. Ekstraksi Fitur Dinamis (Radar Masa Depan)
Model tidak mengandalkan pencatatan statis berbasis kalender, melainkan mengekstrak metrik performa historis:
*   **`Kecepatan_Tumbuh_TB` & `Kecepatan_Tumbuh_BB`**: Laju pertumbuhan rata-rata (*Average Growth Velocity*). Fitur ini memungkinkan model bertindak sebagai *Early Warning System* untuk mendeteksi gagal tumbuh (*Faltering Growth*) sebelum tinggi anak absolut jatuh di bawah standar Z-Score WHO di masa depan.
*   **`Rasio_BB_TB_Akhir`**: Indikator nutrisi akut pada bulan pemeriksaan terakhir.

### 3. Synthetic Data Generation (Parametric Simulation)
Mengingat keterbatasan kuantitas data mentah awal, pipeline ini melahirkan 500 profil pasien virtual (250 Normal, 250 Stunting) melalui teknik simulasi parametrik. Setiap anak virtual diikat dengan korelasi klinis yang ketat (Umur, Tinggi, dan Berat mengikuti standar fisik Z-Score WHO). Hal ini memungkinkan mesin belajar dari rentang skenario medis yang sempurna secara matematis.

### 4. Penyeimbangan Kelas dengan SMOTE
Untuk menyempurnakan proporsi kelas agar 50:50 sempurna secara matematis (mencegah bias minoritas), dataset dikalibrasi akhir menggunakan metode interpolasi *Synthetic Minority Over-sampling Technique* (SMOTE).

### 5. Proyeksi Ekstrapolasi Masa Depan (Mesin Waktu)
Di sisi operasional (API), sistem memiliki modul yang mampu meramalkan status gizi anak N-bulan di masa depan. Sistem pertama-tama memproyeksikan estimasi tinggi anak, lalu **mengkalkulasi ulang Z-Score** untuk usia masa depan tersebut, sebelum akhirnya diumpankan ke model Random Forest untuk dinilai probabilitas stunting-nya.

---

## Endpoint API (Backend ML)
Sistem ini mempublikasikan API berkecepatan tinggi menggunakan *framework* FastAPI (terletak di `main.py`) yang terintegrasi penuh dengan Prometheus Metrics untuk keperluan operasional. *Endpoint* utamanya meliputi:

1. **`POST /api/predict/bulk`**: Memproses unggahan (*upload*) data Excel Posyandu untuk melalukan klasifikasi massal (*batch prediction*) riwayat anak saat ini.
2. **`POST /api/predict/bulk-future`**: Mesin Waktu. Melakukan prediksi massal dengan tambahan fitur ekstrapolasi masa depan (meramal risiko Stunting dalam X bulan ke depan berdasarkan tren kecepatan tumbuh saat ini).
3. **`GET /metrics`**: Target *scrape* metrik metrik server (CPU, Latency, dll) secara *real-time* untuk dasbor operasional (Prometheus/Grafana).
