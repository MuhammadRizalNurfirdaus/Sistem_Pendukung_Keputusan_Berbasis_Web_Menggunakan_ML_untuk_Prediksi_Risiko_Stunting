# 🌱 Pantau Stunting Balita — Sistem Pendukung Keputusan (SPK)

Aplikasi Web SPK untuk deteksi dini risiko stunting dan status gizi balita berdasarkan standar **WHO Child Growth Standards** menggunakan **React (Vite + TypeScript)** untuk frontend dan **Elysia.js (TypeScript)** ditenagai oleh runtime **Bun** untuk backend.

---

## 📋 Prasyarat Sistem
Sebelum memulai, pastikan komputer Anda telah menginstal runtime berikut:

1. **Node.js** (rekomendasi versi LTS terbaru) — untuk menjalankan dan mengelola modul Frontend.
2. **Bun** (v1.0.0 atau yang lebih baru) — runtime JavaScript cepat untuk menjalankan server Backend Elysia.js.
   - Cara instal Bun di macOS/Linux:
     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```
   - Cara instal Bun di Windows (via PowerShell):
     ```powershell
     powershell -c "irm bun.sh/install.ps1 | iex"
     ```

---

## 🚀 Panduan Memulai (Setup Awal)

Ikuti langkah-langkah di bawah ini setelah melakukan `git pull` atau `git clone` pada cabang `wd`:

### 1. Masuk ke Folder Proyek Web (`WD`)
Semua berkas aplikasi web berada di dalam folder `WD`.
```bash
cd WD
```

### 2. Instalasi Dependensi Frontend
Masuk ke folder `frontend` dan instal dependensi menggunakan `npm`:
```bash
cd frontend
npm install
cd ..
```

### 3. Instalasi Dependensi Backend
Masuk ke folder `backend` dan instal dependensi menggunakan `bun`:
```bash
cd backend
bun install
cd ..
```

---

## 💻 Cara Menjalankan Aplikasi

Anda dapat menjalankan kedua server (Frontend & Backend) secara bersamaan dengan satu perintah mudah di dalam folder **`WD/`**:

```bash
npm run dev:all
```

*Perintah di atas akan menggunakan `concurrently` untuk mengaktifkan:*
- **Backend Elysia.js** di alamat `http://localhost:3010`
- **Frontend React (Vite)** di alamat `http://localhost:5173`

### Menjalankan Server secara Terpisah
Jika ingin menjalankan server di jendela terminal yang terpisah, Anda dapat menggunakan perintah berikut dari dalam folder **`WD/`**:

- **Menjalankan Backend saja**:
  ```bash
  npm run dev:backend
  ```
- **Menjalankan Frontend saja**:
  ```bash
  npm run dev:frontend
  ```

---

## 🎨 Fitur Utama Aplikasi
1. **Kalkulator Stunting & Gizi Instan**:
   - Menghitung **Z-Score (HAZ)** tinggi badan anak terhadap median WHO secara presisi (metode LMS).
   - Menghitung **Status Gizi (BMI/Nutritional Status)** anak untuk mendeteksi kasus gizi buruk/kurang atau obesitas (seperti contoh berat ekstrem 900 kg).
2. **Visualisasi Dinamis**:
   - Grafik lingkar persentase probabilitas stunting.
   - Kurva garis pertumbuhan tinggi badan anak dibanding garis referensi -2 SD, -3 SD, dan Median WHO.
3. **Riwayat Pemeriksaan**: Tabel riwayat log pemeriksaan terakhir yang disimpan di berkas JSON lokal.
4. **Dark/Light Mode**: Menggunakan tombol toggle mengambang bercahaya premium di **sudut kanan bawah**.
5. **Dukungan Desimal**: Semua form pengukuran fisik balita mendukung input desimal (*floating point*) presisi.

---

## 👥 Kontributor & Kerja Sama
Untuk mulai bekerja bersama:
1. Pastikan Anda berada di branch `wd` (`git checkout wd`).
2. Tarik kode terbaru: `git pull origin wd`.
3. Buat perubahan kode, lalu tambahkan file: `git add .`
4. Lakukan commit: `git commit -m "Deskripsi perubahan Anda"`
5. Unggah perubahan ke GitHub: `git push origin wd`.
