# 🎨 Frontend Web Application (React + Vite + TypeScript)

Aplikasi klien **Pantau Stunting** ini dibangun menggunakan **React**, **TypeScript**, dan **Vite** sebagai *build tool* utama. Antarmuka dirancang dengan estetika modern (*glassmorphism*, *glowing components*, dan *micro-animations*) serta mendukung mode gelap (*dark/light mode*).

---

## 🌟 Fitur Utama

1. **Dashboard Pertumbuhan**: Visualisasi tren Z-Score WHO balita secara instan, lengkap dengan indikator batas stunting (-3 SD, -2 SD, Median).
2. **Input Gizi Akurat**: Form pengisian yang interaktif dengan validasi desimal ketat untuk mencegah salah ketik.
3. **Analisis Kolektif (Excel)**: Fitur impor massal data posyandu menggunakan file Excel template untuk deteksi risiko stunting massal.
4. **Dynamic API Endpoint**: Mendeteksi secara dinamis apakah aplikasi diakses via localhost, Cloudflare Tunnel (`stunting.rizalnurfirdaus.tech`), atau VS Code Dev Tunnel, lalu mengarahkan request API ke URL backend yang sesuai secara otomatis.
5. **Tema Dinamis**: Floating action button yang dapat berpendar (*glowing theme switch*) untuk beralih antara tema gelap dan terang.
6. **Manajemen Sesi Lokal**: Menyimpan sesi kader secara lokal di browser (`localStorage`) sehingga sesi tetap terjaga meski halaman dimuat ulang.

---

## 📂 Komponen Utama & Halaman

Semua kode komponen berada di bawah folder `src/components/`:
* **`App.tsx`**: Pengendali state utama, manajemen sesi user, inisialisasi tema, dan routing halaman.
* **`AuthPage.tsx`**: Halaman masuk akun (login) kader posyandu yang dilengkapi animasi dekorasi latar belakang.
* **`Dashboard.tsx`**: Halaman utama berisi ringkasan statistik (jumlah balita, kasus berisiko) serta riwayat pemeriksaan terbaru.
* **`ChildrenList.tsx`**: Daftar profil lengkap balita posyandu dengan fitur pencarian dan registrasi balita baru.
* **`ChildDetail.tsx`**: Halaman rekam medis individu anak, menampilkan riwayat pertumbuhan historis dan grafik WHO secara visual.
* **`InputForm.tsx`**: Formulir pencatatan pemeriksaan bulanan (berat badan, tinggi badan, dll).
* **`ResultView.tsx`**: Halaman visualisasi analisis stunting massal dari file Excel yang diunggah.
* **`Education.tsx`**: Pusat edukasi gizi dan panduan intervensi stunting bagi kader & orang tua.

---

## 🛠️ Cara Menjalankan secara Lokal

1. Pindah ke direktori frontend:
   ```bash
   cd WD/frontend
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Jalankan server development:
   ```bash
   npm run dev
   ```
   * Aplikasi akan berjalan dan dapat diakses pada alamat [http://localhost:5173](http://localhost:5173).
