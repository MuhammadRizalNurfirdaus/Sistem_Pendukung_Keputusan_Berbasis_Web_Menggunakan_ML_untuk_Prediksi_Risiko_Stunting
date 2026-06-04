from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

from src.modelling.model import StuntingPredictor
from src.preprocessing.preprocessing import process_excel_template, project_future_growth

app = FastAPI(
    title="Stunting Prediction API",
    description="REST API untuk melayani model Random Forest prediksi stunting.",
    version="1.0.0"
)

# 1. Konfigurasi Keamanan (CORS) - Mengizinkan sembarang Frontend mengakses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Boleh diakses dari React/Next.js/HTML murni (localhost dll)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi Model AI
try:
    predictor = StuntingPredictor()
    predictor.load_model()
except Exception as e:
    print(f"Warning: Gagal memuat model di awal. Pastikan MLflow jalan. Error: {e}")

# 2. Skema Data untuk endpoint Single (JSON Form)
class SingleChildData(BaseModel):
    umur_bulan: int
    jenis_kelamin: int
    bb_awal: float
    tb_awal: float
    bb_akhir: float
    tb_akhir: float
    lama_pantau_bulan: int

class FutureProjectionData(BaseModel):
    umur_bulan: int
    jenis_kelamin: int
    bb_awal: float
    tb_awal: float
    bb_akhir: float
    tb_akhir: float
    lama_pantau_bulan: int
    target_bulan_kedepan: int

# 3. Endpoint 1: Cek Cepat 1 Anak (Kalkulator)
@app.post("/api/predict/single")
def predict_single(data: SingleChildData):
    try:
        data_dict = data.dict()
        hasil = predictor.predict(data_dict)
        return hasil
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Endpoint 2: Bulk Upload Excel
@app.post("/api/predict/bulk")
async def predict_bulk(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="File harus berformat Excel (.xlsx atau .xls)")
        
    try:
        contents = await file.read()
        file_buffer = io.BytesIO(contents)
        
        # Proses menggunakan modul src
        df_fitur, df_raw = process_excel_template(file_buffer)
        
        # Prediksi Massal menggunakan model
        hasil_prediksi = predictor.predict_bulk(df_fitur)
        
        # Gabungkan hasil prediksi dengan data asli untuk dikembalikan ke frontend
        hasil_list = []
        for i, prediksi in enumerate(hasil_prediksi):
            # Coba ambil nama jika ada di raw data
            nama_col = [c for c in df_raw.columns if 'NAMA' in c.upper()]
            nama = df_raw.iloc[i][nama_col[0]] if nama_col else f"Anak {i+1}"
            
            hasil_list.append({
                "nama": str(nama),
                "umur_bulan": int(df_fitur.iloc[i]['Umur (Bulan)']),
                "hasil_prediksi": prediksi
            })
            
        return {
            "pesan": f"Berhasil memprediksi {len(hasil_list)} anak",
            "data": hasil_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses file: {str(e)}")

# 4.5. Endpoint 2B: Bulk Upload Excel + Prediksi Masa Depan
@app.post("/api/predict/bulk-future")
async def predict_bulk_future(
    file: UploadFile = File(...),
    target_bulan_kedepan: int = Form(...)
):
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="File harus berformat Excel (.xlsx atau .xls)")
        
    try:
        contents = await file.read()
        file_buffer = io.BytesIO(contents)
        
        # 1. Proses menggunakan modul src (Data Saat Ini)
        df_current, df_raw = process_excel_template(file_buffer)
        
        # 2. Ekstrapolasi ke masa depan
        df_future = project_future_growth(df_current, target_bulan_kedepan)
        
        # 3. Prediksi Massal menggunakan model
        hasil_prediksi = predictor.predict_bulk(df_future)
        
        # 4. Gabungkan hasil prediksi dengan data asli untuk dikembalikan
        hasil_list = []
        for i, prediksi in enumerate(hasil_prediksi):
            nama_col = [c for c in df_raw.columns if 'NAMA' in c.upper()]
            nama = df_raw.iloc[i][nama_col[0]] if nama_col else f"Anak {i+1}"
            
            hasil_list.append({
                "nama": str(nama),
                "umur_simulasi_bulan": int(df_future.iloc[i]['Umur (Bulan)']),
                "estimasi_tb": round(float(df_future.iloc[i]['TB_Akhir']), 2),
                "hasil_prediksi_masa_depan": prediksi
            })
            
        return {
            "pesan": f"Berhasil mensimulasikan {len(hasil_list)} anak untuk {target_bulan_kedepan} bulan ke depan",
            "data": hasil_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses simulasi file: {str(e)}")

# 5. Endpoint 3: Simulasi Masa Depan (Single)
@app.post("/api/predict/future")
def predict_future(data: FutureProjectionData):
    try:
        data_dict = data.dict()
        target_bulan = data_dict.pop('target_bulan_kedepan')
        
        # Preprocess data saat ini
        from src.preprocessing.preprocessing import preprocess_data_anak
        df_current = preprocess_data_anak(data_dict)
        
        # Ekstrapolasi ke masa depan
        df_future = project_future_growth(df_current, target_bulan)
        
        # Prediksi kondisi di masa depan
        prediksi_kode = int(predictor.model.predict(df_future)[0])
        
        if prediksi_kode == 0:
            status = "NORMAL"
            pesan = f"Simulasi {target_bulan} bulan ke depan: Aman."
        else:
            status = "BERISIKO STUNTING"
            pesan = f"Simulasi {target_bulan} bulan ke depan: BERISIKO STUNTING! Anak butuh intervensi gizi sekarang."
            
        return {
            "umur_simulasi": int(df_future.iloc[0]['Umur (Bulan)']),
            "estimasi_tb_akhir": round(float(df_future.iloc[0]['TB_Akhir']), 2),
            "estimasi_bb_akhir": round(float(df_future.iloc[0]['BB_Akhir']), 2),
            "status_masa_depan": status,
            "pesan": pesan
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Welcome to Stunting ML API. Go to /docs to see the Swagger UI."}
