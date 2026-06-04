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

def process_excel_template(file_path_or_buffer) -> pd.DataFrame:
    """
    Membaca dan memproses file Excel unggahan kader Posyandu (Bulk Processing).
    Menangani format MultiIndex dan melakukan Feature Engineering secara massal.
    """
    # 1. Baca dengan header ganda
    df_raw = pd.read_excel(file_path_or_buffer, header=[0, 1])
    
    # 2. Ratakan nama kolom (hilangkan 'Unnamed')
    df_raw.columns = [f'{col[0]}_{col[1]}' if 'Unnamed' not in col[1] else col[0] for col in df_raw.columns]
    
    # 3. Encoding Jenis Kelamin
    if 'Jenis Kelamin' in df_raw.columns:
        # Hati-hati dengan spasi dan format tidak konsisten
        df_raw['Jenis Kelamin'] = df_raw['Jenis Kelamin'].astype(str).str.strip().str.upper().map({'L': 1, 'P': 0})
        # Isi NaN dengan nilai default 1 (Laki-laki) jika kosong
        df_raw['Jenis Kelamin'] = df_raw['Jenis Kelamin'].fillna(1)
    
    # 4. Filter kolom yang relevan (BB dan TB)
    bb_cols = [c for c in df_raw.columns if 'BB' in c.upper() or 'BERAT' in c.upper()]
    tb_cols = [c for c in df_raw.columns if 'TB' in c.upper() or 'TINGGI' in c.upper()]
    
    if len(bb_cols) == 0 or len(tb_cols) == 0:
        raise ValueError("Format Excel tidak valid. Tidak ada kolom BB atau TB.")
        
    # 5. Ekstrak nilai awal, akhir, dan interval secara dinamis per baris (Menangani Bolong)
    bb_awal_list, bb_akhir_list = [], []
    tb_awal_list, tb_akhir_list = [], []
    interval_list = []
    
    for idx, row in df_raw.iterrows():
        # Ambil data yang tidak NaN (kosong) saja
        bb_row = row[bb_cols].dropna()
        tb_row = row[tb_cols].dropna()
        
        if len(bb_row) == 0 or len(tb_row) == 0:
            bb_awal_list.append(0); bb_akhir_list.append(0)
            tb_awal_list.append(0); tb_akhir_list.append(0)
            interval_list.append(1)
            continue
            
        # Cari posisi urutan bulan pertama dan terakhir yang ada datanya
        bb_valid_indices = [bb_cols.index(col) for col in bb_row.index]
        idx_pertama = bb_valid_indices[0]
        idx_terakhir = bb_valid_indices[-1]
        
        bb_awal_list.append(bb_row.iloc[0])
        bb_akhir_list.append(bb_row.iloc[-1])
        tb_awal_list.append(tb_row.iloc[0])
        tb_akhir_list.append(tb_row.iloc[-1])
        
        # Interval adalah selisih bulan (misal April ke Feb = 3 - 1 = 2 bulan)
        jarak_bulan = idx_terakhir - idx_pertama
        if jarak_bulan < 1:
            jarak_bulan = 1 # Hindari pembagian nol
            
        interval_list.append(jarak_bulan)
        
    df_raw['BB_Awal'] = bb_awal_list
    df_raw['TB_Awal'] = tb_awal_list
    df_raw['BB_Akhir'] = bb_akhir_list
    df_raw['TB_Akhir'] = tb_akhir_list
    df_raw['Lama_Pantau_Bulan'] = interval_list
    
    # 7. Kalkulasi Feature Engineering (Kecepatan Tumbuh)
    df_raw['Kecepatan_Tumbuh_BB'] = (df_raw['BB_Akhir'] - df_raw['BB_Awal']) / df_raw['Lama_Pantau_Bulan']
    df_raw['Kecepatan_Tumbuh_TB'] = (df_raw['TB_Akhir'] - df_raw['TB_Awal']) / df_raw['Lama_Pantau_Bulan']
    df_raw['Rasio_BB_TB_Akhir'] = df_raw['BB_Akhir'] / (df_raw['TB_Akhir'] + 0.001)
    
    # 8. Filter hanya kolom fitur (Training features)
    final_features = [
        'Umur (Bulan)', 'Jenis Kelamin', 'BB_Awal', 'TB_Awal', 'BB_Akhir', 
        'TB_Akhir', 'Lama_Pantau_Bulan', 'Kecepatan_Tumbuh_BB', 
        'Kecepatan_Tumbuh_TB', 'Rasio_BB_TB_Akhir'
    ]
    
    # Jika ada target kolom 'Status' (label), buang karena ini data inference
    
    # Tangani potensi kolom 'Umur' yang dinamai lain di template
    if 'Umur (Bulan)' not in df_raw.columns:
        umur_col = [c for c in df_raw.columns if 'UMUR' in c.upper()]
        if umur_col:
            df_raw['Umur (Bulan)'] = df_raw[umur_col[0]]
        else:
            df_raw['Umur (Bulan)'] = 0 # Default jika tidak ada
            
    df_fitur = df_raw[final_features]
    
    # Jika web butuh mengembalikan data original untuk ditampilkan (misal nama anak), 
    # kita bisa mengembalikan dua DF. Namun untuk sederhana, kembalikan DF yang bersih.
    # Kita sertakan original dataframe agar di web bisa dimunculkan namanya.
    return df_fitur, df_raw

def project_future_growth(df_current: pd.DataFrame, target_bulan_kedepan: int) -> pd.DataFrame:
    """
    Mesin Waktu (Simulasi Ekstrapolasi).
    Menambahkan N bulan ke depan, dengan asumsi Kecepatan Tumbuh konstan.
    Digunakan untuk memprediksi risiko stunting di masa depan.
    """
    df_future = df_current.copy()
    
    # Tambahkan umur
    df_future['Umur (Bulan)'] = df_future['Umur (Bulan)'] + target_bulan_kedepan
    
    # Asumsikan nilai Akhir sekarang menjadi nilai Awal baru (opsional, tapi untuk model kita cukup mengubah Akhir)
    # Model Random Forest kita belajar dari TB_Akhir dan Kecepatan_Tumbuh. 
    # Logika ekstrapolasi linear:
    df_future['BB_Akhir'] = df_future['BB_Akhir'] + (df_future['Kecepatan_Tumbuh_BB'] * target_bulan_kedepan)
    df_future['TB_Akhir'] = df_future['TB_Akhir'] + (df_future['Kecepatan_Tumbuh_TB'] * target_bulan_kedepan)
    
    # Rasio ikut berubah
    df_future['Rasio_BB_TB_Akhir'] = df_future['BB_Akhir'] / (df_future['TB_Akhir'] + 0.001)
    
    return df_future
