# Sistem Pendukung Keputusan Berbasis Web Menggunakan Machine Learning untuk Prediksi Risiko Stunting pada Anak di Posyandu Mawar Manis Desa Sidaraja Kecamatan Ciawigebang Kabupaten Kuningan

Sistem Pendukung Keputusan (SPK) ini dirancang khusus untuk mendeteksi dini risiko stunting dan status gizi buruk pada balita secara *real-time*. Proyek ini merupakan bagian dari inisiatif Capstone Project kelompok **PJK-GM039** untuk memberikan solusi teknologi berbasis data kesehatan posyandu.

---

## 👥 Tim Pengembang (PJK-GM039)

| No | Cohort ID | Nama | Email | Peran |
| :--- | :--- | :--- | :--- | :--- |
| 1 | APC246D6Y0250 | Muhammad Rizal Nurfirdaus | APC246D6Y0250@student.devacademy.id | Web Developer |
| 2 | APC246D6Y0385 | Muhammad Abshar Hakim | APC246D6Y0385@student.devacademy.id | Data Engineer |
| 3 | APC246D6Y0386 | Bayu Imantoro | APC246D6Y0386@student.devacademy.id | Machine Learning |
| 4 | APC246D6Y0387 | Muhamad Hafizh Albar | APC246D6Y0387@student.devacademy.id | Web Developer |
| 5 | APC246D6Y0398 | Rian Putra Pratama | APC246D6Y0398@student.devacademy.id | Machine Learning |

---

## 📖 Latar Belakang & Masalah yang Diangkat

Stunting merupakan ancaman utama bagi masa depan generasi muda di Indonesia. Stunting ditandai dengan tinggi atau panjang badan anak yang berada di bawah standar usianya akibat kekurangan gizi kronis, infeksi berulang, serta stimulasi psikososial yang tidak memadai terutama pada 1.000 Hari Pertama Kehidupan (HPK). 

Di **Posyandu Mawar Manis Desa Sidaraja, Kecamatan Ciawigebang, Kabupaten Kuningan**, terdapat beberapa kendala mendasar yang dihadapi dalam penanganan stunting:
1. **Metode Pencatatan Manual & Risiko Kehilangan Data**: Pencatatan data fisik anak (Tinggi Badan, Berat Badan, Lingkar Kepala) masih menggunakan buku register fisik atau KIA. Hal ini rentan terhadap kesalahan pencatatan (*human error*), kerusakan fisik buku, serta lambannya proses pencarian riwayat tumbuh kembang balita dari bulan-bulan sebelumnya.
2. **Deteksi Dini yang Terlambat (Sifatnya Reaktif)**: Kader posyandu kesulitan melakukan kalkulasi Z-score secara cepat menggunakan tabel referensi WHO yang tebal. Hal ini berakibat pada keterlambatan deteksi kondisi *growth faltering* (penurunan kecepatan pertumbuhan). Sering kali, stunting baru terdeteksi setelah kondisi balita berada dalam fase stunting kronis (Z-score < -2 SD), di mana proses pemulihannya menjadi jauh lebih sulit, mahal, dan membutuhkan waktu lama.
3. **Ketiadaan Analisis Proyeksi Pertumbuhan**: Pengukuran bulanan saat ini bersifat statis (hanya menilai kondisi gizi pada hari penimbangan tersebut). Tidak ada sistem cerdas yang mampu memproyeksikan tren pertumbuhan anak ke beberapa bulan ke depan berdasarkan pola kecepatan pertumbuhan (`growth velocity`) historis anak tersebut untuk mendeteksi risiko stunting preventif.

---

## 🎯 Tujuan Utama Proyek

Proyek ini dikembangkan dengan tujuan untuk mengatasi kendala-kendala tersebut melalui inovasi digital:
* **Mendigitalisasi Administrasi Posyandu**: Menyediakan platform rekam medis posyandu berbasis web yang aman, terpusat, dan mudah dioperasikan oleh kader posyandu tingkat desa.
* **Otomatisasi Kalkulasi Medis Instan**: Menghitung skor deviasi standar pertumbuhan (Z-score) Height-for-Age (HAZ) anak secara otomatis berdasarkan model matematika WHO Child Growth Standards (metode LMS).
* **Prediksi Risiko Preventif Berbasis AI**: Menerapkan algoritma Machine Learning untuk mendeteksi risiko stunting di masa mendatang, sehingga intervensi gizi (pemberian makanan tambahan, edukasi ibu hamil/menyusui) dapat diberikan **sebelum** anak tersebut benar-benar jatuh ke dalam kategori stunting.
* **Pemantauan Performa Sistem Kesehatan Terpadu**: Mengintegrasikan sistem monitoring (Prometheus + Grafana) guna memantau metrik prediksi (sebaran status normal vs berisiko) serta kesehatan server API.

---

## 🧠 Detail Model Machine Learning

### 1. Algoritma Prediksi: Random Forest Classifier
Model prediksi risiko stunting ini dibangun menggunakan algoritma **Random Forest Classifier** (dari pustaka `scikit-learn`). Algoritma ensemble berbasis pohon keputusan (*decision trees*) ini dipilih karena:
* Memiliki akurasi yang sangat baik pada data tabular medis.
* Stabil dan tidak mudah mengalami *overfitting* berkat mekanisme bagging (bootstrapping & sub-sampling fitur).
* Mampu memberikan probabilitas prediksi (skor persentase risiko) yang digunakan untuk indikator tingkat kerawanan stunting balita.

### 2. Fitur Input Model (Features)
Model dilatih menggunakan data pertumbuhan historis dengan fitur-fitur kunci sebagai berikut:
* `Umur (Bulan)`: Usia anak saat ini untuk menyesuaikan fase perkembangan fisik.
* `Jenis Kelamin`: Variabel biner (1 = Laki-laki, 0 = Perempuan) karena standar pertumbuhan anak laki-laki dan perempuan memiliki ambang batas WHO yang berbeda.
* `BB_Awal` & `TB_Awal`: Berat badan (kg) dan tinggi badan (cm) balita pada awal periode pemantauan gizi.
* `BB_Akhir` & `TB_Akhir`: Berat badan (kg) dan tinggi badan (cm) balita pada pengukuran terakhir.
* `Lama_Pantau_Bulan`: Jeda waktu pemantauan dalam satuan bulan.
* *Feature Engineering (Kecepatan Tumbuh)*: Sistem secara otomatis menghitung *Growth Velocity* (kecepatan pertumbuhan tinggi badan per bulan dan berat badan per bulan) untuk mengidentifikasi adanya gejala *growth faltering* (pertumbuhan melambat).

### 3. Eksperimen & Manajemen Model (MLflow)
* Pelatihan model dikelola dan dilacak melalui **MLflow Tracking System** di bawah eksperimen bernama `Stunting_Model_Experiment`.
* MLflow mencatat seluruh parameter pelatihan (seperti `n_estimators`, `max_depth`, `random_state`) beserta metrik kinerjanya (Akurasi, F1-Score, Precision, dan Recall).
* Model terbaik yang berhasil dievaluasi disimpan dan diregistrasi secara aman di dalam folder `mlruns/`, yang kemudian dimuat secara otomatis oleh server FastAPI saat startup.

---

## 💻 Detail Aplikasi Web (Architecture & Components)

Aplikasi web dirancang dengan arsitektur modern, tangguh, dan berkinerja tinggi:

### 1. Frontend Web (React + Vite + TypeScript)
* **Visualisasi Kurva Pertumbuhan WHO**: Menggunakan *charting engine* (Chart.js / Recharts) untuk merender kurva pertumbuhan anak secara visual. Grafik ini menampilkan plot posisi pertumbuhan tinggi badan balita saat ini langsung di atas garis batas referensi WHO (Median, -2 SD untuk batas stunting, dan -3 SD untuk batas stunting parah).
* **Input Desimal & Validasi Gizi**: Form penginputan fisik dirancang interaktif guna mendukung input nilai pecahan desimal (*floating point*) serta dilengkapi validasi otomatis guna menghindari kesalahan masukan data yang ekstrem (misalnya data berat di atas batas normal).
* **Desain UI/UX Premium (Aesthetics)**: Menampilkan antarmuka responsif bernuansa bersih dengan transisi halus, didukung oleh tombol toggle **Dark/Light Mode** mengambang yang memancarkan cahaya (*glowing floating action button*) di sudut kanan bawah halaman.

### 2. Backend Web (Elysia.js + Bun Runtime)
* **Runtime Bun**: Memberikan kecepatan eksekusi JavaScript tingkat tinggi dan efisiensi konsumsi memori.
* **Elysia.js Framework**: Menangani manajemen rute API web, manajemen database lokal terstruktur (berformat JSON lokal), serta bertindak sebagai *reverse proxy* yang meneruskan payload data fisik anak ke FastAPI server untuk diprediksi.

### 3. FastAPI Python Backend
* FastAPI bertindak sebagai jembatan berlatensi rendah antara frontend web dengan model Random Forest.
* Menyediakan endpoint-endpoint krusial:
  * `/api/predict/single` untuk kalkulator gizi cepat per anak.
  * `/api/predict/bulk` untuk pemrosesan massal data posyandu via file Excel template.
  * `/api/predict/future` dan `/api/predict/bulk-future` untuk ekstrapolasi pertumbuhan anak dan prediksi status risiko stunting anak di bulan-bulan mendatang.

---

## 🛠️ Arsitektur Folder Proyek

Proyek ini terbagi menjadi dua workspace independen yang dikelola via **Git Worktree**:

```
├── WD/ (Web Development Workspace - Branch wd)
│   ├── frontend/ (Aplikasi Frontend React)
│   └── backend/  (API Server Elysia.js + Database JSON lokal)
│
└── ML/ (Machine Learning Workspace - Branch ml)
    ├── main.py (REST API FastAPI Server)
    ├── mlruns/ (Manajemen Model MLflow - Eksperimen ID: 485660017095288342)
    ├── monitoring/ (Integrasi Metrik Prometheus & Dasbor Grafana)
    └── src/ (Modul Rekayasa Fitur, Preprocessing Excel, & Load Model)
```

---

## 🚀 Panduan Memulai & Instalasi

### Prasyarat Awal
Pastikan Anda sudah menginstal:
* [Node.js](https://nodejs.org) (LTS)
* [Bun Runtime](https://bun.sh)
* [Python 3.10+](https://www.python.org/) & `virtualenv`

---

### A. Menjalankan Bagian Web (WD)

1. Masuk ke folder proyek Web:
   ```bash
   cd WD
   ```
2. Instalasi dependensi untuk Frontend:
   ```bash
   cd frontend
   # Menginstal library React, Chart.js, Tailwind, dll.
   npm install
   cd ..
   ```
3. Instalasi dependensi untuk Backend Web:
   ```bash
   cd backend
   # Menginstal framework Elysia.js
   bun install
   cd ..
   ```
4. Jalankan Frontend & Backend secara bersamaan:
   ```bash
   npm run dev:all
   ```
   * Aplikasi web dapat diakses pada alamat [http://localhost:5173](http://localhost:5173).

---

### B. Menjalankan Bagian Machine Learning (ML)

1. Pindah ke folder kerja ML Anda:
   ```bash
   cd /home/rizal/MyProject/Pijak/Sistem_Pendukung_Keputusan_ML
   ```
2. Buat & aktifkan virtual environment Python:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Untuk Linux/macOS
   # venv\Scripts\activate   # Untuk Windows
   ```
3. Instalasi seluruh modul dependensi ML (mlflow, fastapi, uvicorn, scikit-learn, prometheus-client, pandas, openpyxl, dll.):
   ```bash
   pip install -r ML/requirements.txt
   ```
4. Jalankan REST API Server FastAPI:
   ```bash
   cd ML
   uvicorn main:app --reload --port 8000
   ```
   * Swagger dokumentasi interaktif dapat diakses di [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 📅 Riwayat Versi & Log Perubahan (Changelog)

### v2.3.0 (Juni 2026) — Rilis Stabilitas & Peningkatan DevTunnel [Terbaru]
- **Resolusi DevTunnel Dinamis**: Menambahkan deteksi otomatis dan resolusi URL API backend secara dinamis berdasarkan hostname DevTunnel yang digunakan untuk pengujian remote/seluler.
- **Pembersihan Repositori**: Restrukturisasi branch kerja git (`wd` dan `ml`) menggunakan mekanisme git worktree/ignore terpisah untuk menghindari konflik pelacakan file.
- **Stabilitas**: Perbaikan *glitch* minor pada visualisasi kurva pertumbuhan dan penanganan response API.

### v2.2.0 (Juni 2026) — Autentikasi Pengguna & Keamanan Data
- **Sistem Autentikasi Kader**: Implementasi fitur pendaftaran dan masuk log (login/register) berbasis sesi untuk para kader posyandu.
- **Relasi Riwayat**: Setiap riwayat prediksi stunting dan status gizi kini disimpan secara terintegrasi dan berasosiasi langsung dengan data kader yang terautentikasi.

### v2.1.0 (Juni 2026) — Pemantauan Sistem & Kecerdasan Buatan Tingkat Lanjut
- **Observability (Prometheus + Grafana)**: Integrasi monitoring server dengan melacak 5 metrik utama: jumlah permintaan (request count), latensi API, tingkat error (error rate), distribusi prediksi status, dan penggunaan memori/CPU.
- **Generasi Data Sintetis**: Penambahan modul generator data sintetis berbasis aturan (*rule-based synthetic data generator*) dan pembersihan label gizi mentah.
- **Endpoint Masa Depan Massal**: Implementasi endpoint `/api/predict/bulk-future` untuk proyeksi stunting secara massal berbasis data time-series.

### v2.0.0 (Juni 2026) — Arsitektur Full-Stack & Dasbor Interaktif
- **Dasbor Web Interaktif**: Inisialisasi struktur frontend React dengan visualisasi grafik pertumbuhan WHO berbasis garis referensi standar deviasi (-3 SD, -2 SD, Median).
- **Backend Elysia.js + Bun**: Migrasi backend utama web ke Elysia.js yang berjalan di atas runtime Bun dengan database JSON lokal yang cepat.
- **Pemulihan Data**: Fitur restorasi input otomatis berdasarkan data riwayat penimbangan sebelumnya.

### v1.2.0 (Juni 2026) — Integrasi Import/Export Excel & Ekstrapolasi
- **Bulk Excel Processing**: Penambahan fungsionalitas unduh template Excel dan impor data massal untuk mempermudah tugas kader Posyandu.
- **Simulasi Ekstrapolasi Masa Depan**: Penambahan algoritma simulasi proyeksi pertumbuhan tinggi/berat badan balita beberapa bulan ke depan berdasarkan parameter *Growth Velocity*.

### v1.1.0 (Mei 2026) — Pipeline Modelling & REST API FastAPI
- **FastAPI Production Serving**: Inisialisasi server API FastAPI Python untuk serving model machine learning secara real-time.
- **Feature Engineering & Preprocessing**: Penyelesaian modul visualisasi EDA (Exploratory Data Analysis), modul prapemrosesan data, serta modul modelling terstruktur di dalam folder `src/`.

### v1.0.0 (Mei 2026) — Inisialisasi Eksperimen & Baseline Model
- **Random Forest Classifier**: Pengembangan model prediksi stunting awal menggunakan algoritma Random Forest Classifier.
- **Integrasi MLflow**: Pelacakan siklus eksperimen, metrik akurasi/recall, dan parameter model menggunakan MLflow Tracking System.
- **Inisialisasi Repositori**: Setup awal repositori, pembersihan anomali data awal, dan unggahan dataset mentah.
