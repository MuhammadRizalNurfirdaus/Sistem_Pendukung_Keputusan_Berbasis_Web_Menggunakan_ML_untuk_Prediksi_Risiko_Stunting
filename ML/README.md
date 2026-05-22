# Proyek Prediksi Stunting dengan Random Forest

Tujuan modul ini adalah membangun algoritma cerdas (Random Forest) untuk memprediksi risiko stunting pada anak berdasarkan rekam jejak pertumbuhan fisik (BB, TB, LL, LK) selama 5 bulan berturut-turut.

## Struktur Direktori

Modul ML ini menggunakan standar arsitektur profesional yang memisahkan antara data, area eksperimen, dan kode produksi (otomatisasi):

*   **`data/`**: Brankas penyimpanan dataset.
    *   `raw/`: Tempat menyimpan file Excel mentah asli dari Posyandu: `dataset_posyandu.xlsx`. Data di folder ini **tidak boleh diedit secara manual**.
    *   `processed/`: Tempat menyimpan file CSV hasil pembersihan dan penambahan data *dummy*: `dataset_final_training.csv`. File inilah yang akan digunakan untuk training model.
*   **`notebooks/`**: "Laboratorium" tempat bereksperimen. Berisi file Jupyter Notebook (`.ipynb`) untuk menganalisis data, mencoba rumus *Feature Engineering*, dan menciptakan sintesis data (*dummy generation*) sebelum kodenya dipatenkan.
*   **`src/`**: Jantung mesin (*Source Code* Python utama) yang akan berjalan otomatis di *server*/web.
    *   `preprocessing/`: Skrip Python berisi logika pembersihan data yang akan dipanggil secara otomatis oleh aplikasi Web saat ada *user* yang mengunggah CSV baru.
    *   `modelling/`: Skrip Python untuk melatih Random Forest, mencari parameter terbaik, dan merekam performa model menggunakan MLflow.

## 🛠️ Strategi Preprocessing & Feature Engineering Data

Berdasarkan format Excel mentah Posyandu, berikut adalah strategi manipulasi data yang kita lakukan agar algoritma Random Forest dapat cerdas secara maksimal:

### 1. Penanganan Format Excel & Tipe Data
*   **MultiIndex Header**: File Excel memiliki judul bertumpuk (Bulan di baris 1, Metrik di baris 2). Pandas dikonfigurasi membaca indeks baris 0 dan 1 sebagai `header`. Judul ini diratakan menjadi satu nama yang tegas (contoh: `January_BB(kg)`).
*   **Pembersihan Karakter Asing (Type Coercion)**: Kader sering mengetik setrip (`-`) atau spasi kosong pada Excel. Seluruh kolom akan **dipaksa menjadi angka murni** menggunakan fungsi *coerce* sehingga teks nyasar otomatis berubah menjadi data kosong (`NaN`) yang aman untuk perhitungan matematis.

### 2. Penghapusan Kolom Identitas (Drop)
Kolom-kolom berikut dibuang karena tidak memiliki nilai prediktif (hanya membuat model bias) dan demi menjaga privasi pasien:
*   `No`, `Nama`, `OrangTua`, `Alamat (Dusun)`

### 3. Feature Engineering (Penciptaan Fitur Medis)
Alih-alih membiarkan model menebak angka-angka mentah yang terpisah, kita langsung menyuapi model dengan rumus medis:
*   **`Delta_BB(kg)` & `Delta_TB(cm)`**: Pertumbuhan (selisih) angka dari Bulan 1 ke Bulan 5. Angka yang kecil atau minus mengindikasikan kelainan/stagnasi tumbuh kembang.
*   **`Rasio_BB_TB_Akhir`**: Berat badan dibagi tinggi badan di bulan pengukuran terakhir. Sesuai standar WHO, indikator (Z-score) untuk malnutrisi sangat bergantung pada rasio Berat terhadap Tinggi (*wasting*).

### 4. Generasi Data Dummy (Synthetic Data)
Karena data riil Posyandu hanya 80 baris, model sangat rentan gagal (*overfitting*). Kita menanggulanginya dengan membangkitkan (generate) lebih dari 900 baris data *dummy* baru. 
*Dummy* ini **TIDAK** dibuat secara acak buta, melainkan dengan meniru persis Distribusi Normal (Rata-rata & Simpangan Baku) dari data aslinya, dipisah berdasarkan kelas Normal dan Stunting. Dengan demikian, data sintesis yang dihasilkan 100% masuk akal secara medis.
