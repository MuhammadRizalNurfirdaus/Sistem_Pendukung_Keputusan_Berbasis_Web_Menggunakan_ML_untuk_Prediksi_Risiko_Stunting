# Proyek Prediksi Stunting Berbasis Machine Learning (Random Forest)

Tujuan utama dari modul Machine Learning ini adalah membangun sebuah sistem klasifikasi cerdas dan Sistem Peringatan Dini (*Early Warning System*) menggunakan algoritma Random Forest. Sistem ini dirancang untuk mendeteksi risiko *Faltering Growth* (Gagal Tumbuh) dan memprediksi status Stunting berdasarkan rekam jejak pertumbuhan fisik balita.

Berbeda dengan sistem deteksi statis, arsitektur ML pada proyek ini bersifat dinamis karena menggunakan fitur kecepatan tumbuh (*Growth Velocity*), memungkinkan deteksi pada berbagai durasi pemantauan.

---

## Struktur Direktori

*   **`data/`**: Direktori penyimpanan dataset utama.
    *   `raw/`: Tempat menyimpan file Excel mentah asli dari Posyandu (`dataset_posyandu.xlsx`). Data di dalam folder ini dijaga keasliannya dan merupakan representasi langsung dari *ground truth* lapangan.
    *   `processed/`: Tempat menyimpan dataset final (`dataset_final_training.csv`) yang telah melalui tahap pembersihan, ekstraksi fitur, dan penyeimbangan (*balancing*). File ini adalah sumber utama untuk pelatihan model.
*   **`notebooks/`**: Ruang eksperimen utama
    *   `generate_dummy_data.ipynb`: Tahap pembersihan data, ekstraksi fitur (*Feature Engineering*), dan augmentasi (*Balancing*) menggunakan SMOTE.
    *   `modelling_experiment.ipynb`: Tahap pelatihan algoritma Random Forest, evaluasi akurasi metrik, identifikasi *Feature Importance*, dan pendaftaran model ke dalam *registry* MLflow.
    *   `uji_coba_data_baru.ipynb`: Lingkungan simulasi untuk menguji hasil *inference* (prediksi) model terhadap data fiktif baru.
*   **`src/`**: Direktori yang dipersiapkan untuk menyimpan *source code* Python berstruktur *modular* yang akan diintegrasikan dengan *backend* Aplikasi Web di tahap selanjutnya.
*   **`mlruns/`**: Direktori otomatis yang dikelola oleh *framework* MLflow untuk menyimpan versi model, riwayat pelatihan, dan metrik akurasi dari setiap eksperimen.

---

## Arsitektur Data & Strategi Machine Learning

Untuk memastikan model mencapai akurasi tinggi dan relevansi medis yang valid, pipeline ML ini menerapkan beberapa strategi:

### 1. Ekstraksi Fitur Dinamis (Feature Engineering)
Model tidak mengandalkan pencatatan statis berbasis bulan kalender (misal: Tinggi Bulan Januari), melainkan mengekstrak metrik performa pertumbuhan:
*   **`Kecepatan_Tumbuh_TB` & `Kecepatan_Tumbuh_BB`**: Laju pertumbuhan rata-rata (*Average Growth Velocity*) yang dihitung murni secara matematis berdasarkan selisih pengukuran akhir dan awal, dibagi lama pantauan. Fitur rekayasa (*Feature Engineering*) ini memungkinkan model bertindak sebagai *Early Warning System* untuk mendeteksi *Faltering Growth*, jauh sebelum tinggi anak secara absolut benar-benar jatuh di bawah standar Z-Score WHO.
*   **`Rasio_BB_TB_Akhir`**: Indikator nutrisi akut (*wasting*) pada bulan pemeriksaan terakhir.

### 2. Penanganan Bias Demografi (Injeksi Profil Klinis)
Dikarenakan data mentah Posyandu tidak memiliki riwayat balita stunting di bawah usia 23 bulan, model rentan mengalami "Kebutaan Demografi" (menganggap semua bayi pendek adalah normal). Hal ini diatasi dengan cara menyuntikkan profil medis fiktif berupa bayi usia 6-22 bulan dengan parameter klinis stunting berat (kecepatan tumbuh mendekati 0 cm/bulan).

### 3. Penyeimbangan Kelas dengan SMOTE
Untuk mencegah bias dominansi mayoritas kelas Normal, dataset dibalancing menggunakan *Synthetic Minority Over-sampling Technique* (SMOTE). SMOTE mempelajari pola medis dari data stunting asli beserta profil klinis hasil injeksi untuk menciptakan representasi data sintetis yang sangat masuk akal secara medis, menghasilkan dataset final yang seimbang 50:50.

### 4. Proyeksi Ekstrapolasi Masa Depan
Berdasarkan parameter `Umur` dan `Kecepatan_Tumbuh`, arsitektur ini memungkinkan aplikasi tingkat lanjut untuk meramalkan status gizi anak di masa depan. Jika kecepatan tumbuh anak bernilai nol (0 cm/bulan), sistem dapat mensimulasikan penambahan umur tanpa penambahan tinggi, secara matematis mengklasifikasikan anak tersebut ke dalam kategori Stunting di bulan-bulan mendatang.
