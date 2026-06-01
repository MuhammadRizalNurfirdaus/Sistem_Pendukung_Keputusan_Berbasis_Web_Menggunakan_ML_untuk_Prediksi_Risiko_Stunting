import pandas as pd

def preprocess_data_anak(data_raw: dict) -> pd.DataFrame:
    """
    Mengolah data mentah pasien dari input form (Web) menjadi
    format fitur-fitur yang siap dicerna oleh model Machine Learning.
    
    Expected keys di data_raw:
    - 'umur_bulan': int/float
    - 'jenis_kelamin': int (1: Laki-laki, 0: Perempuan)
    - 'bb_awal': float
    - 'tb_awal': float
    - 'bb_akhir': float
    - 'tb_akhir': float
    - 'lama_pantau_bulan': int/float
    
    Returns:
        pd.DataFrame dengan urutan kolom yang sama persis 
        seperti saat pelatihan model (Random Forest).
    """
    
    # Mencegah division by zero jika jarak pantau diisi 0
    interval = data_raw.get('lama_pantau_bulan', 1)
    if interval < 1:
        interval = 1
        
    bb_awal = data_raw.get('bb_awal', 0)
    tb_awal = data_raw.get('tb_awal', 0)
    bb_akhir = data_raw.get('bb_akhir', 0)
    tb_akhir = data_raw.get('tb_akhir', 0)
    
    # 1. Hitung Kecepatan Tumbuh (Feature Engineering)
    kecepatan_tumbuh_bb = (bb_akhir - bb_awal) / interval
    kecepatan_tumbuh_tb = (tb_akhir - tb_awal) / interval
    
    # 2. Hitung Rasio Berat dan Tinggi Akhir
    rasio_bb_tb_akhir = bb_akhir / tb_akhir if tb_akhir > 0 else 0
    
    # 3. Bentuk DataFrame sesuai urutan fitur pelatihan
    fitur_dict = {
        'Umur (Bulan)': data_raw.get('umur_bulan', 0),
        'Jenis Kelamin': data_raw.get('jenis_kelamin', 0),
        'BB_Awal': bb_awal,
        'TB_Awal': tb_awal,
        'BB_Akhir': bb_akhir,
        'TB_Akhir': tb_akhir,
        'Lama_Pantau_Bulan': interval,
        'Kecepatan_Tumbuh_BB': kecepatan_tumbuh_bb,
        'Kecepatan_Tumbuh_TB': kecepatan_tumbuh_tb,
        'Rasio_BB_TB_Akhir': rasio_bb_tb_akhir
    }
    
    df_processed = pd.DataFrame([fitur_dict])
    return df_processed
