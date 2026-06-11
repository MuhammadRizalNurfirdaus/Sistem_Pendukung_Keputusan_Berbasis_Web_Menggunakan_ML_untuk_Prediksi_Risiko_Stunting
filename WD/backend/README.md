# 🖥️ Elysia.js Backend Web Server (Bun Runtime)

Backend utama untuk aplikasi **Pantau Stunting** ini dibangun menggunakan **Elysia.js** yang berjalan di atas runtime **Bun**. Server ini bertindak sebagai API gateway untuk frontend, mengelola database pengguna & balita, serta menjadi reverse proxy ke server FastAPI Machine Learning.

---

## 🚀 Fitur Utama

1. **Bun Runtime**: Kecepatan I/O yang sangat tinggi dan manajemen memori yang efisien.
2. **Sistem Autentikasi**:
   * Menangani enkripsi password dengan Bcrypt menggunakan `Bun.password`.
   * Endpoint: `POST /api/auth/login`
3. **Integrasi Database (Supabase)**:
   * Menggunakan helper query terstruktur untuk berkomunikasi dengan database Cloud Supabase guna menyimpan data user, profil balita, dan riwayat pemeriksaan.
4. **Jembatan Prediksi (Proxy Gateway)**:
   * Menerima payload dari frontend, lalu meneruskannya ke kontainer `pijak-backend-ml` (port 8000) untuk evaluasi model Random Forest.
   * Menyimpan hasil prediksi & Z-Score WHO ke database riwayat sebelum dikembalikan ke klien.

---

## 🔑 Endpoint API Backend

### 1. Autentikasi Kader
* **`POST /api/auth/login`**: Masuk akun menggunakan username/email dan password.

### 2. Edukasi
* **`GET /api/education`**: Mengambil daftar tips pencegahan stunting & informasi gizi.

### 3. Data Balita
* **`GET /api/children`**: Mengambil daftar balita terdaftar.
* **`POST /api/children`**: Menambahkan profil balita baru.
* **`DELETE /api/children/:id`**: Menghapus profil balita.

### 4. Riwayat Pemeriksaan & Klasifikasi
* **`GET /api/history`**: Mengambil riwayat pemeriksaan balita berdasarkan `user_id`.
* **`DELETE /api/history/:id`**: Menghapus satu entri riwayat pemeriksaan.

### 5. Penghubung Machine Learning (Forwarding)
* **`POST /api/predict/calculate`**: Kalkulasi Z-Score WHO instan.
* **`POST /api/predict/bulk`**: Proxy untuk import data penimbangan massal via Excel.
* **`POST /api/predict/bulk-future`**: Proxy untuk proyeksi stunting massal beberapa bulan ke depan.
* **`POST /api/predict`**: Proxy untuk deteksi stunting tunggal.

---

## 🛠️ Cara Menjalankan secara Lokal

1. Pastikan Anda telah menginstal **Bun**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Instal dependensi:
   ```bash
   bun install
   ```

3. Jalankan server development:
   ```bash
   bun run dev
   ```
   * Secara default, server akan berjalan di [http://localhost:3010](http://localhost:3010).