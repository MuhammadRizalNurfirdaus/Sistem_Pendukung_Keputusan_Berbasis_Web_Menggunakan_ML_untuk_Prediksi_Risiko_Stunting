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

## 📖 Deskripsi Proyek secara Detail

Stunting merupakan ancaman utama bagi masa depan anak-anak di Indonesia, ditandai dengan tinggi badan anak yang berada di bawah standar usianya akibat kekurangan gizi kronis. Proyek ini diimplementasikan di **Posyandu Mawar Manis Desa Sidaraja, Kecamatan Ciawigebang, Kabupaten Kuningan** dengan mengintegrasikan sistem pencatatan posyandu digital berbasis web dan model prediksi berbasis Machine Learning.

Sistem ini memfasilitasi kader posyandu dalam melakukan pencatatan fisik balita, menghitung indeks Z-score secara akurat sesuai standar pertumbuhan anak dari WHO (World Health Organization), dan memprediksi tren pertumbuhan anak di masa depan untuk mendeteksi apakah anak tersebut berisiko stunting di bulan-bulan mendatang.

---

## 🛠️ Arsitektur Teknologi & Komponen Sistem

Sistem ini terbagi menjadi dua bagian utama (diatur secara mandiri menggunakan Git Worktrees):

```
├── WD/ (Web Development - Frontend & Backend Web)
│   ├── frontend/ (React.js + Vite + TypeScript)
│   └── backend/  (Elysia.js + Bun + TypeScript)
│
└── ML/ (Machine Learning - Fast API, Model RF & Monitoring)
    ├── main.py (FastAPI Server)
    ├── mlruns/ (Penyimpanan Model MLflow)
    ├── monitoring/ (Konfigurasi Prometheus & Dashboard Grafana)
    └── src/ (Modul Pemrosesan & ML)
```

### 1. Web Development (WD)
* **Frontend (React + Vite + TypeScript)**: Menyajikan UI modern yang interaktif, visualisasi grafik Z-Score WHO dengan kurva referensi lengkap (-3 SD, -2 SD, Median WHO), serta form input gizi anak yang responsif dan mendukung input desimal presisi.
* **Backend Web (Elysia.js + Bun)**: Menangani API untuk web, autentikasi, serta pencatatan log riwayat penimbangan anak ke penyimpanan berkas lokal terstruktur.

### 2. Machine Learning & Monitoring (ML)
* **API Prediksi (FastAPI + Python)**: Endpoint API berlatensi rendah untuk kalkulasi model Machine Learning.
* **Model MLflow (Random Forest Classifier)**: Model prediksi risiko stunting (Faltering Growth) berbasis Random Forest yang dilacak menggunakan MLflow.
* **Sistem Pemantauan (Prometheus & Grafana)**:
  * Mengumpulkan metrik request count, error rate, request latency, status gizi terprediksi, dan status penggunaan resource server (CPU & RAM).
  * Dashboard visualisasi Grafana untuk melacak performa sistem kecerdasan buatan secara langsung.

---

## 🎨 Fitur Utama Aplikasi

1. **Kalkulator Stunting & Gizi Instan (Z-Score & BMI)**:
   * Menghitung **Z-Score (HAZ)** tinggi badan anak terhadap median WHO secara presisi menggunakan rumus pertumbuhan WHO (LMS/SD).
   * Menganalisis **Status Gizi (BMI/Nutritional Status)** untuk mendeteksi kasus gizi buruk/kurang, normal, atau obesitas.
2. **Prediksi Risiko Stunting Masa Depan**:
   * Melakukan ekstrapolasi tinggi badan dan berat badan anak beberapa bulan ke depan berdasarkan tren pertumbuhan saat ini.
   * Memberikan ramalan apakah anak tersebut akan tergolong stunting/tidak stunting di masa mendatang.
3. **Simulasi Massal (Bulk Upload Excel)**:
   * Fitur unggah file Excel template data posyandu langsung.
   * Melakukan prediksi risiko stunting masa kini maupun simulasi masa depan secara massal untuk seluruh anak di posyandu dalam sekali klik.
4. **Visualisasi Kurva Pertumbuhan WHO**:
   * Kurva pertumbuhan visual membandingkan perkembangan anak dengan garis referensi median WHO, -2 SD, dan -3 SD.
5. **Riwayat Pemeriksaan Lokal**:
   * Riwayat log pemeriksaan tersimpan aman dalam format JSON lokal terstruktur.
6. **Desain Premium Modern**:
   * Antarmuka responsif dengan tombol toggle Dark/Light Mode mengambang bercahaya premium di sudut kanan bawah.

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

1. Pindah ke folder kerja ML (Gunakan path folder kerja `ml` Anda):
   ```bash
   cd ML
   ```
2. Buat & aktifkan virtual environment Python:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Untuk Linux/macOS
   # venv\Scripts\activate   # Untuk Windows
   ```
3. Instalasi seluruh modul dependensi ML (mlflow, fastapi, uvicorn, scikit-learn, prometheus-client, pandas, openpyxl, dll.):
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan REST API Server FastAPI:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   * Swagger dokumentasi interaktif dapat diakses di [http://localhost:8000/docs](http://localhost:8000/docs).
