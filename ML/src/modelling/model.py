import os
import mlflow.sklearn
import pandas as pd
from ..preprocessing.preprocessing import preprocess_data_anak

# Coba melacak path root ML (untuk menemukan mlruns)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MLRUNS_DIR = os.path.join(BASE_DIR, "mlruns")

class StuntingPredictor:
    def __init__(self):
        self.model = None
        # Set tracking URI agar mlflow tahu dimana mengambil datanya
        mlflow.set_tracking_uri(f"file:{MLRUNS_DIR}")
        
    def load_model(self):
        """Memuat model terbaru dan terbaik dari eksperimen MLflow."""
        if self.model is None:
            try:
                # Mengambil eksperimen
                experiment = mlflow.get_experiment_by_name('Stunting_Model_Experiment')
                if not experiment:
                    raise Exception("Eksperimen 'Stunting_Model_Experiment' tidak ditemukan. Pastikan mlruns tersedia.")
                
                # Mengambil run terbaru
                runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id], order_by=['start_time DESC'])
                if runs.empty:
                    raise Exception("Tidak ada history run di eksperimen tersebut.")
                    
                latest_run_id = runs.iloc[0].run_id
                model_uri = f"runs:/{latest_run_id}/dynamic_rf_model"
                
                # Memuat model scikit-learn
                self.model = mlflow.sklearn.load_model(model_uri)
                print(f"Model berhasil dimuat dari Run ID: {latest_run_id}")
            except Exception as e:
                print(f"Gagal memuat model: {e}")
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
