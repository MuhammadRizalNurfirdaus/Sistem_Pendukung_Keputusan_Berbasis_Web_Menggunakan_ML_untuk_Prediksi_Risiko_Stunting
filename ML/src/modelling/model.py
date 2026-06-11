import os
import mlflow
import mlflow.pyfunc
import mlflow.sklearn
import pandas as pd
from ..preprocessing.preprocessing import preprocess_data_anak

# Coba melacak path root ML (untuk menemukan mlruns)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MLRUNS_DIR = os.path.join(BASE_DIR, "mlruns")

class StuntingPredictor:
    def __init__(self):
        self.model = None
        
    def load_model(self):
        if self.model is None:
            try:
                # 1. Pastikan tracking URI di-set dengan benar
                mlflow.set_tracking_uri("file:///app/mlruns/569065162946818888")
                
                # 2. Run ID yang sudah kita temukan
                VALID_RUN_ID = "972f343d73184ee9acb25330a41ca33e"
                
                # 3. Load model
                model_uri = f"runs:/{VALID_RUN_ID}/dynamic_rf_model"
                print(f"[MLflow] Mencoba memuat dari: {model_uri}")
                
                self.model = mlflow.pyfunc.load_model(model_uri)
                print("🎉 BERHASIL DIMUAT!")
                
            except Exception as e:
                print(f"Eror saat memuat model: {e}")
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
        Mengembalikan list of dict: [{"label": "NORMAL", "probability": 0.15}, ...].
        """
        if self.model is None:
            self.load_model()
            
        prediksi_array = self.model.predict(df_input)
        
        # Coba ambil probabilitas jika didukung oleh model
        try:
            prob_array = self.model.predict_proba(df_input)
            # prob_array biasanya [[prob_0, prob_1], ...]
            # Kita ambil probabilitas kelas 1 (Stunting) sebagai probability
            probs = prob_array[:, 1]
        except Exception:
            # Fallback jika model tidak mendukung predict_proba
            probs = [1.0 if p == 1 else 0.0 for p in prediksi_array]

        hasil = []
        for p, prob in zip(prediksi_array, probs):
            label = "NORMAL" if p == 0 else "BERISIKO STUNTING"
            hasil.append({
                "label": label,
                "probability": float(prob)
            })
            
        return hasil
