import os
import joblib
import pandas as pd
from ..preprocessing.preprocessing import preprocess_data_anak

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

class StuntingPredictor:
    def __init__(self):
        self.model = None
        
    def load_model(self):
        """Memuat model terbaik dari file PKL (Tanpa MLflow)."""
        if self.model is None:
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file tidak ditemukan di {MODEL_PATH}. Pastikan Anda sudah mengekstrak modelnya.")
            try:
                self.model = joblib.load(MODEL_PATH)
                print("Model berhasil dimuat dari file PKL.")
            except Exception as e:
                print(f"Gagal memuat model PKL: {e}")
                raise e
        return self.model

    def predict(self, data_mentah: dict) -> dict:
        """
        Menerima data mentah, mengubah formatnya, lalu memprediksi status.
        """
        # 1. Pastikan model sudah dimuat
        if self.model is None:
            self.load_model()
            
        # 2. Preprocessing Data
        df_input = preprocess_data_anak(data_mentah)
        
        # 3. Eksekusi Prediksi
        prediksi_kode = int(self.model.predict(df_input)[0])
        
        # 4. Format Hasil Keluaran
        if prediksi_kode == 0:
            status_teks = "NORMAL"
            pesan = "Pertumbuhan anak berada dalam batas wajar. Lanjutkan pola asuh dan gizi yang baik."
        else:
            status_teks = "BERISIKO STUNTING"
            pesan = "PERINGATAN: Pertumbuhan terdeteksi melambat (Faltering Growth). Disarankan untuk segera konsultasi ke ahli gizi atau Puskesmas terdekat."
            
        return {
            "status_kode": prediksi_kode,
            "status_teks": status_teks,
            "pesan": pesan
        }

    def predict_bulk(self, df_input: pd.DataFrame) -> list:
        """
        Menerima DataFrame hasil dari process_excel_template (Banyak Anak),
        lalu memprediksi semuanya sekaligus (Batch Prediction).
        Mengembalikan list of string ["NORMAL", "BERISIKO STUNTING", ...].
        """
        if self.model is None:
            self.load_model()
            
        prediksi_array = self.model.predict(df_input)
        hasil_teks = ["NORMAL" if p == 0 else "BERISIKO STUNTING" for p in prediksi_array]
        
        return hasil_teks
