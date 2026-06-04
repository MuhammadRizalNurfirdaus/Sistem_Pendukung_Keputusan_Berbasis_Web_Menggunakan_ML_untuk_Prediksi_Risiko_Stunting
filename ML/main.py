from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import time

from src.modelling.model import StuntingPredictor
from src.preprocessing.preprocessing import process_excel_template, project_future_growth
from src.monitoring.metrics import (
    record_request,
    record_error,
    record_prediction,
    record_bulk_predictions,
    observe_duration,
    get_metrics,
    get_content_type,
    start_system_metrics_collector,
)

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


# =====================================================
# MIDDLEWARE MONITORING: Pencatat Otomatis untuk Setiap Request
# =====================================================
@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    """
    Middleware yang otomatis mencatat:
    - Jumlah request per endpoint (Metrik 1)
    - Durasi/latency per request (Metrik 2)
    - Error rate jika status >= 400 (Metrik 3)
    """
    # Abaikan endpoint /metrics dan /docs agar tidak mencemari data
    path = request.url.path
    if path in ("/metrics", "/docs", "/openapi.json", "/redoc", "/favicon.ico"):
        response = await call_next(request)
        return response

    # Catat request masuk (Metrik 1)
    endpoint_label = path.replace("/api/predict/", "").replace("/", "_") or "root"
    record_request(endpoint=endpoint_label, method=request.method)

    # Ukur durasi (Metrik 2)
    start_time = time.time()
    try:
        response = await call_next(request)
    except Exception:
        # Catat error 500 jika ada exception tak tertangkap (Metrik 3)
        record_error(endpoint=endpoint_label, status_code=500)
        raise

    duration = time.time() - start_time
    from src.monitoring.metrics import REQUEST_DURATION
    REQUEST_DURATION.labels(endpoint=endpoint_label).observe(duration)

    # Catat error jika status >= 400 (Metrik 3)
    if response.status_code >= 400:
        record_error(endpoint=endpoint_label, status_code=response.status_code)

    return response


# =====================================================
# STARTUP EVENT: Jalankan Collector CPU/RAM di Background
# =====================================================
@app.on_event("startup")
def on_startup():
    """Memulai background thread untuk monitoring CPU & RAM (Metrik 5)."""
    start_system_metrics_collector(interval_seconds=5)
    print("[Monitoring] Background collector CPU/RAM sudah berjalan (interval: 5 detik).")


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


# =====================================================
# ENDPOINT /metrics — Prometheus Scrape Target
# =====================================================
@app.get("/metrics")
def metrics_endpoint():
    """Endpoint yang di-scrape oleh Prometheus untuk mengambil semua metrik."""
    return Response(
        content=get_metrics(),
        media_type=get_content_type()
    )


# 3. Endpoint 1: Cek Cepat 1 Anak (Kalkulator)
@app.post("/api/predict/single")
def predict_single(data: SingleChildData):
    try:
        data_dict = data.dict()
        hasil = predictor.predict(data_dict)

        # Catat hasil prediksi ke Prometheus (Metrik 4)
        record_prediction(hasil["status_teks"])

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

        # Catat semua hasil prediksi ke Prometheus (Metrik 4)
        record_bulk_predictions(hasil_prediksi)
        
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

        # Catat semua hasil prediksi ke Prometheus (Metrik 4)
        record_bulk_predictions(hasil_prediksi)
        
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

        # Catat hasil prediksi ke Prometheus (Metrik 4)
        record_prediction(status)
            
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
