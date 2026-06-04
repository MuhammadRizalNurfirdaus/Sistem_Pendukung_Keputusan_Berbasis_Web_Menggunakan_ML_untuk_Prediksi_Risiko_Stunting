"""
Modul Monitoring Prometheus untuk Stunting ML API.
Mendefinisikan 5 metrik utama yang dimonitor:
1. Total Request Prediksi (Counter)
2. Durasi Waktu Respon (Histogram)
3. Tingkat Kegagalan / Error Rate (Counter)
4. Distribusi Hasil Prediksi (Counter)
5. Penggunaan CPU & Memori (Gauge)
"""

from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
import psutil
import threading
import time


# =====================================================
# METRIK 1: Total Request Prediksi (Counter)
# =====================================================
# Menghitung berapa kali setiap endpoint prediksi dipanggil.
# Label 'endpoint' untuk membedakan: single, bulk, future, bulk-future
REQUEST_COUNT = Counter(
    'stunting_requests_total',
    'Jumlah total request prediksi yang masuk',
    ['endpoint', 'method']
)

# =====================================================
# METRIK 2: Durasi Waktu Respon / Latency (Histogram)
# =====================================================
# Mengukur berapa detik waktu yang dibutuhkan untuk memproses request.
# Bucket default cocok untuk API ML (dari 5ms sampai 10 detik).
REQUEST_DURATION = Histogram(
    'stunting_request_duration_seconds',
    'Durasi waktu respon tiap request dalam detik',
    ['endpoint'],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# =====================================================
# METRIK 3: Tingkat Kegagalan / Error Rate (Counter)
# =====================================================
# Menghitung jumlah request yang gagal (HTTP status >= 400).
# Label 'endpoint' dan 'status_code' untuk detail.
ERROR_COUNT = Counter(
    'stunting_errors_total',
    'Jumlah total request yang gagal (error)',
    ['endpoint', 'status_code']
)

# =====================================================
# METRIK 4: Distribusi Hasil Prediksi (Counter)
# =====================================================
# Menghitung berapa kali model memprediksi NORMAL vs BERISIKO STUNTING.
# Berguna untuk mendeteksi data drift (jika tiba-tiba 100% stunting).
PREDICTION_OUTCOME = Counter(
    'stunting_prediction_outcomes_total',
    'Distribusi hasil prediksi model (NORMAL vs BERISIKO STUNTING)',
    ['hasil']
)

# =====================================================
# METRIK 5: Penggunaan CPU & Memori (Gauge)
# =====================================================
# Memantau resource server secara real-time.
CPU_USAGE = Gauge(
    'stunting_system_cpu_percent',
    'Persentase penggunaan CPU server saat ini'
)

MEMORY_USAGE = Gauge(
    'stunting_system_memory_bytes',
    'Penggunaan memori (RAM) server dalam bytes'
)

MEMORY_PERCENT = Gauge(
    'stunting_system_memory_percent',
    'Persentase penggunaan memori server saat ini'
)


def update_system_metrics():
    """Mengupdate metrik CPU dan RAM secara berkala."""
    CPU_USAGE.set(psutil.cpu_percent(interval=None))
    mem = psutil.virtual_memory()
    MEMORY_USAGE.set(mem.used)
    MEMORY_PERCENT.set(mem.percent)


def start_system_metrics_collector(interval_seconds=5):
    """
    Menjalankan background thread yang mengupdate metrik
    CPU & RAM setiap N detik.
    """
    def _collect_loop():
        while True:
            update_system_metrics()
            time.sleep(interval_seconds)

    thread = threading.Thread(target=_collect_loop, daemon=True)
    thread.start()


def get_metrics():
    """Menghasilkan output metrik dalam format Prometheus text."""
    # Update resource metrics saat diminta
    update_system_metrics()
    return generate_latest()


def get_content_type():
    """Mengembalikan content type yang benar untuk Prometheus."""
    return CONTENT_TYPE_LATEST


# === Helper Functions untuk dipanggil dari main.py ===

def record_request(endpoint: str, method: str = "POST"):
    """Mencatat satu request masuk."""
    REQUEST_COUNT.labels(endpoint=endpoint, method=method).inc()


def record_error(endpoint: str, status_code: int):
    """Mencatat satu error."""
    ERROR_COUNT.labels(endpoint=endpoint, status_code=str(status_code)).inc()


def record_prediction(hasil: str):
    """Mencatat satu hasil prediksi (NORMAL atau BERISIKO STUNTING)."""
    PREDICTION_OUTCOME.labels(hasil=hasil).inc()


def record_bulk_predictions(hasil_list: list):
    """Mencatat banyak hasil prediksi sekaligus (dari bulk upload)."""
    for hasil in hasil_list:
        PREDICTION_OUTCOME.labels(hasil=hasil).inc()


def observe_duration(endpoint: str):
    """Mengembalikan timer context manager untuk mengukur durasi."""
    return REQUEST_DURATION.labels(endpoint=endpoint).time()
