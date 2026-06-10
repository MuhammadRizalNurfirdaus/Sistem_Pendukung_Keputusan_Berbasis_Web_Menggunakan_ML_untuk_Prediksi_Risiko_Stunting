import pandas as pd
import numpy as np

WHO_LMS_GIRLS = [
  [1,49.1477,0.03795],[1,53.6872,0.04169],[1,57.1481,0.04259],[1,59.7820,0.04289],[1,62.0899,0.04288],[1,64.0329,0.04273],[1,65.7332,0.04254],[1,67.2882,0.04234],[1,68.7454,0.04213],[1,70.1345,0.04192],[1,71.4756,0.04173],[1,72.7836,0.04154],[1,74.0682,0.04135],[1,75.3361,0.04118],[1,76.5913,0.04101],[1,77.8368,0.04085],[1,79.0748,0.04069],[1,80.3069,0.04054],[1,81.5342,0.04040],[1,82.7573,0.04026],[1,83.9767,0.04012],[1,85.1925,0.03999],[1,86.4047,0.03986],[1,87.6133,0.03973],[1,88.8183,0.03960],
  [1,86.9991,0.03973],[1,87.5249,0.03996],[1,88.0563,0.04019],[1,88.5939,0.04043],[1,89.1385,0.04066],[1,89.6903,0.04090],[1,90.2490,0.04114],[1,90.8148,0.04138],[1,91.3882,0.04163],[1,91.9687,0.04187],[1,92.5570,0.04212],[1,93.1530,0.04237],[1,93.7561,0.04262],[1,94.3665,0.04287],[1,94.9847,0.04312],[1,95.6101,0.04337],[1,96.2426,0.04362],[1,96.8824,0.04388],[1,97.5293,0.04413],[1,98.1827,0.04438],[1,98.8425,0.04464],[1,99.5082,0.04489],[1,100.1791,0.04514],[1,100.8551,0.04540],[1,101.5349,0.04565],[1,102.2183,0.04590],[1,102.9048,0.04615],[1,103.5933,0.04640],[1,104.2842,0.04665],[1,104.9762,0.04690],[1,105.6688,0.04714],[1,106.3625,0.04739],[1,107.0559,0.04763],[1,107.7488,0.04787],[1,108.4403,0.04811],[1,109.1313,0.04835]
]
WHO_LMS_BOYS = [
  [1,49.8842,0.03819],[1,54.7244,0.04052],[1,58.4249,0.04132],[1,61.4292,0.04164],[1,63.8860,0.04167],[1,65.9016,0.04154],[1,67.6105,0.04132],[1,69.1554,0.04106],[1,70.5937,0.04079],[1,71.9472,0.04053],[1,73.2323,0.04029],[1,74.4589,0.04006],[1,75.6358,0.03984],[1,76.7701,0.03964],[1,77.8680,0.03945],[1,78.9348,0.03928],[1,79.9748,0.03912],[1,80.9918,0.03896],[1,81.9888,0.03882],[1,82.9685,0.03869],[1,83.9332,0.03856],[1,84.8845,0.03844],[1,85.8239,0.03833],[1,86.7523,0.03822],[1,87.6712,0.03811],
  [1,87.9818,0.03881],[1,88.5866,0.03901],[1,89.1979,0.03921],[1,89.8153,0.03941],[1,90.4385,0.03960],[1,91.0673,0.03980],[1,91.7011,0.04000],[1,92.3396,0.04019],[1,92.9824,0.04039],[1,93.6293,0.04058],[1,94.2798,0.04078],[1,94.9338,0.04098],[1,95.5910,0.04117],[1,96.2512,0.04137],[1,96.9142,0.04156],[1,97.5796,0.04176],[1,98.2474,0.04196],[1,98.9172,0.04215],[1,99.5890,0.04235],[1,100.2625,0.04255],[1,100.9376,0.04275],[1,101.6142,0.04294],[1,102.2921,0.04314],[1,102.9712,0.04334],[1,103.6514,0.04354],[1,104.3326,0.04374],[1,105.0147,0.04394],[1,105.6976,0.04414],[1,106.3813,0.04434],[1,107.0658,0.04454],[1,107.7508,0.04474],[1,108.4364,0.04494],[1,109.1225,0.04514],[1,109.8091,0.04535],[1,110.4962,0.04555],[1,111.1837,0.04576]
]

def get_zscore(age, sex, tb):
    if pd.isna(age) or pd.isna(sex) or pd.isna(tb): return 0.0
    table = WHO_LMS_BOYS if int(sex) == 1 else WHO_LMS_GIRLS
    c_age = max(0, min(60, int(age)))
    L, M, S = table[c_age]
    if L == 0:
        return np.log(tb / M) / S
    return (np.power(tb / M, L) - 1) / (L * S)



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
    
    # Calculate Z-Score
    z_score_akhir = get_zscore(data_raw.get('umur_bulan', 0), data_raw.get('jenis_kelamin', 0), tb_akhir)
    
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
        'Rasio_BB_TB_Akhir': rasio_bb_tb_akhir,
        'Z_Score_Akhir': z_score_akhir
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
    
    # 2.5 Hapus baris kosong di mana kolom nama tidak valid
    nama_cols = [c for c in df_raw.columns if 'NAMA' in c.upper()]
    if nama_cols:
        df_raw = df_raw.dropna(subset=[nama_cols[0]])
        df_raw = df_raw[df_raw[nama_cols[0]].astype(str).str.strip().str.lower() != 'nan']
        df_raw = df_raw[df_raw[nama_cols[0]].astype(str).str.strip() != '']
        # Reset index agar index iterable cocok dengan length
        df_raw = df_raw.reset_index(drop=True)

    
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
    
    # Add Z-Score for ML
    df_raw['Z_Score_Akhir'] = [get_zscore(row['Umur (Bulan)'], row['Jenis Kelamin'], row['TB_Akhir']) for idx, row in df_raw.iterrows()]
    
    # 8. Filter hanya kolom fitur (Training features)
    final_features = [
        'Umur (Bulan)', 'Jenis Kelamin', 'BB_Awal', 'TB_Awal', 'BB_Akhir', 
        'TB_Akhir', 'Lama_Pantau_Bulan', 'Kecepatan_Tumbuh_BB', 
        'Kecepatan_Tumbuh_TB', 'Rasio_BB_TB_Akhir', 'Z_Score_Akhir'
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
    
    # Recalculate Z-Score
    df_future['Z_Score_Akhir'] = [get_zscore(row['Umur (Bulan)'], row['Jenis Kelamin'], row['TB_Akhir']) for idx, row in df_future.iterrows()]
    
    return df_future
