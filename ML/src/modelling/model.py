import os
import mlflow
import mlflow.pyfunc
import mlflow.sklearn
import pandas as pd
from ..preprocessing.preprocessing import preprocess_data_anak

class StuntingPredictor:
    def __init__(self):
            self.model = None
            self.experiment_id = "569065162946818888" # Pastikan baris ini ada
            mlflow.set_tracking_uri("file:///app/mlruns")
            
    def get_latest_run_id(self):
        path = f"/app/mlruns/{self.experiment_id}"
        if not os.path.exists(path):
            raise FileNotFoundError(f"Folder mlruns tidak ditemukan di {path}")
            
        # Tambahkan filter: ambil folder yang hanya berisi angka (bukan .trash atau models)
        subdirs = [os.path.join(path, d) for d in os.listdir(path) 
                   if os.path.isdir(os.path.join(path, d)) 
                   and d.isdigit()] # <--- KUNCI PERBAIKAN: Hanya ambil folder dengan nama angka
        
        if not subdirs:
            raise FileNotFoundError("Tidak ada Run ditemukan di folder eksperimen")
            
        latest_dir = max(subdirs, key=os.path.getmtime)
        return os.path.basename(latest_dir)

    def load_model(self):
        if self.model is None:
            try:
                models_path = f"/app/mlruns/{self.experiment_id}/models"
                subdirs = [os.path.join(models_path, d) for d in os.listdir(models_path) 
                           if os.path.isdir(os.path.join(models_path, d))]
                
                # Saring subdirektori model yang memiliki 11 fitur (mendukung Z_Score_Akhir)
                valid_subdirs = []
                for d in subdirs:
                    try:
                        temp_model = mlflow.sklearn.load_model(f"file://{d}/artifacts")
                        if len(temp_model.feature_names_in_) == 11 and 'Z_Score_Akhir' in temp_model.feature_names_in_:
                            valid_subdirs.append(d)
                    except Exception:
                        continue
                
                if not valid_subdirs:
                    print("⚠️ Warning: Tidak ditemukan model dengan 11 fitur (Z_Score_Akhir). Menggunakan fallback.")
                    valid_subdirs = subdirs
                
                # Ambil folder model terbaru berdasarkan waktu modifikasi
                latest_model_dir = max(valid_subdirs, key=os.path.getmtime)
                
                # Path MLflow untuk memuat model dari folder artifacts
                model_uri = f"file://{latest_model_dir}/artifacts"
                
                print(f"[MLflow] Memuat model dari: {model_uri}")
                self.model = mlflow.sklearn.load_model(model_uri)
                print(f"🎉 BERHASIL DIMUAT! Fitur model: {self.model.feature_names_in_}")
            except Exception as e:
                print(f"❌ Gagal memuat model: {e}")
                raise e
        return self.model

    def predict(self, data_mentah: dict) -> dict:
        self.load_model() # Pastikan model siap
        df_input = preprocess_data_anak(data_mentah)
        prediksi_kode = int(self.model.predict(df_input)[0])
        
        if prediksi_kode == 0:
            return {"status_kode": 0, "status_teks": "NORMAL", "pesan": "Pertumbuhan anak normal."}
        else:
            return {"status_kode": 1, "status_teks": "BERISIKO STUNTING", "pesan": "PERINGATAN: Pertumbuhan terdeteksi melambat."}
            
    def predict_bulk(self, df):
        self.load_model() # Pastikan model siap
        
        # 1. Pastikan kolom yang dibutuhkan ada (Sesuaikan dengan fitur saat training)
        required_features = [
            'Umur (Bulan)', 'Jenis Kelamin', 'BB_Awal', 'TB_Awal', 'BB_Akhir', 
            'TB_Akhir', 'Lama_Pantau_Bulan', 'Kecepatan_Tumbuh_BB', 
            'Kecepatan_Tumbuh_TB', 'Rasio_BB_TB_Akhir', 'Z_Score_Akhir'
        ]
        
        # Lengkapi kolom yang hilang jika ada dengan nilai default
        for col in required_features:
            if col not in df.columns:
                df[col] = 0.0
            
        # 2. Pastikan urutan kolom SAMA PERSIS dengan saat training
        # Penting: model scikit-learn sangat sensitif dengan urutan kolom
        df_input = df[required_features]
        
        # 3. Lakukan prediksi kelas
        preds = self.model.predict(df_input)
        
        # 4. Ambil probabilitas stunting jika model mendukung predict_proba
        try:
            probs = self.model.predict_proba(df_input)[:, 1]
        except Exception:
            probs = [0.99 if p == 1 else 0.01 for p in preds]
            
        # Kembalikan list of dicts agar konsisten
        results = []
        for p, prob in zip(preds, probs):
            label_str = "NORMAL" if int(p) == 0 else "BERISIKO STUNTING"
            results.append({
                "label": label_str,
                "probability": float(prob)
            })
        return results