# Proyek Prediksi Stunting Berbasis Machine Learning (Random Forest)

Tujuan utama dari modul Machine Learning ini adalah membangun sebuah sistem klasifikasi cerdas dan Sistem Peringatan Dini (*Early Warning System*) menggunakan algoritma Random Forest. Sistem ini dirancang untuk mendeteksi risiko *Faltering Growth* (Gagal Tumbuh) dan memprediksi status Stunting berdasarkan rekam jejak pertumbuhan fisik balita.

Berbeda dengan sistem deteksi statis, arsitektur ML pada proyek ini bersifat dinamis karena menggunakan fitur kecepatan tumbuh (*Growth Velocity*), memungkinkan deteksi pada berbagai durasi pemantauan.

---

## Struktur Direktori

*   **`data/`**: Direktori penyimpanan dataset utama.
    *   `raw/`: Tempat menyimpan file Excel mentah asli dari Posyandu (`dataset_posyandu.xlsx`). Data di dalam folder ini dijaga keasliannya dan merupakan representasi langsung dari *ground truth* lapangan.
    *   `processed/`: Tempat menyimpan dataset final (`dataset_final_training.csv`) yang telah melalui tahap pembersihan, ekstraksi fitur, augmentasi (simulasi parametrik), dan penyeimbangan (*balancing*). File ini berisi ~602 baris data latih yang sangat *robust* secara medis.
*   **`notebooks/`**: Ruang eksperimen utama.
    *   `generate_dummy_data.ipynb`: Tahap pembersihan data, ekstraksi fitur (*Feature Engineering*), Injeksi Profil Virtual (*Parametric Simulation*), dan augmentasi menggunakan SMOTE.
    *   `modelling_experiment.ipynb`: Tahap pelatihan algoritma Random Forest, evaluasi akurasi metrik, identifikasi *Feature Importance*, dan pendaftaran model ke dalam *registry* MLflow.
    *   `uji_coba_data_baru.ipynb`: Lingkungan simulasi untuk menguji hasil *inference* (prediksi) model.
*   **`src/`**: Direktori yang berisi *source code* Python berstruktur modular (termasuk FastAPI) yang siap diintegrasikan dengan *backend* Aplikasi Web.
*   **`mlruns/`**: Direktori pelacakan dari *framework* MLflow untuk menyimpan versi model dan metrik akurasi.

---

## Arsitektur Data & Strategi Machine Learning

Untuk memastikan model mencapai akurasi tinggi dan memiliki relevansi medis yang valid (bebas dari akurasi semu), pipeline ML ini menerapkan strategi kelas industri:

### 1. Data Cleansing (Koreksi Label Berbasis Standar WHO)
Dikarenakan data mentah dari lapangan (*raw data*) kerap memiliki anomali pelabelan atau *Human Error* (misal: anak kerdil dilabeli normal, anak tinggi dilabeli stunting), model ini melakukan pembersihan awal. Label stunting dihitung ulang dan dikalibrasi secara ketat mengikuti kurva batas bawah Tinggi-terhadap-Umur dari WHO. 

### 2. Ekstraksi Fitur Dinamis (Feature Engineering)
Model tidak mengandalkan pencatatan statis berbasis kalender, melainkan mengekstrak metrik performa:
*   **`Kecepatan_Tumbuh_TB` & `Kecepatan_Tumbuh_BB`**: Laju pertumbuhan rata-rata (*Average Growth Velocity*). Fitur ini memungkinkan model bertindak sebagai *Early Warning System* untuk mendeteksi gagal tumbuh (*Faltering Growth*) sebelum tinggi anak absolut jatuh di bawah standar Z-Score WHO.
*   **`Rasio_BB_TB_Akhir`**: Indikator nutrisi akut (*wasting*) pada bulan pemeriksaan terakhir.

### 3. Synthetic Data Generation (Parametric Simulation)
Karena jumlah data mentah sangat minim (hanya ~90 baris), pipeline ini melahirkan 500 profil pasien virtual (250 Normal, 250 Stunting) melalui teknik simulasi parametrik. Setiap anak virtual diikat dengan korelasi klinis yang ketat (Umur, Tinggi, dan Berat mengikuti standar fisik manusia sungguhan). Hal ini memungkinkan mesin belajar dari lautan data yang realistis dan memperkuat kemampuannya mengenali kasus *borderline* (perbatasan).

### 4. Penyeimbangan Kelas dengan SMOTE
Untuk menyempurnakan proporsi kelas agar 50:50 sempurna secara matematis (mencegah bias algoritma), dataset dikalibrasi akhir menggunakan *Synthetic Minority Over-sampling Technique* (SMOTE).

### 5. Proyeksi Ekstrapolasi Masa Depan (Simulasi Prediksi)
Berdasarkan parameter `Umur` dan `Kecepatan_Tumbuh`, arsitektur ini meramalkan status gizi anak di masa depan. Jika kecepatan tumbuh anak lambat, sistem dapat mensimulasikan penambahan umur tanpa penambahan tinggi yang signifikan, lalu secara matematis mengklasifikasikan risiko anak tersebut di bulan-bulan mendatang.

---

## Endpoint API (Backend ML)
Sistem ini telah menyediakan 4 jalur API menggunakan *framework* FastAPI (berada di dalam `main.py` di _root directory_) yang siap diakses oleh Frontend (Web/Android):

1. **`POST /api/predict/single`**: Kalkulator cepat untuk 1 anak (menilai status saat ini secara instan).
2. **`POST /api/predict/future`**: Kalkulator 1 anak dengan tambahan fitur simulasi ekstrapolasi (memprediksi risiko stunting di target bulan masa depan).
3. **`POST /api/predict/bulk`**: Fitur unggah file Excel (Upload Bulk) untuk menilai puluhan/ratusan data riwayat anak sekaligus secara otomatis.
4. **`POST /api/predict/bulk-future`**: Fitur unggah file Excel massal yang dilengkapi simulasi masa depan untuk seluruh anak di dalam file tersebut.
