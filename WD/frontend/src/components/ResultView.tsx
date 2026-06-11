import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

interface Prediction {
  id: string;
  nama: string;
  umur: number;
  jenisKelamin: 'L' | 'P';
  bbAwal: number;
  tbAwal: number;
  bbAkhir: number;
  tbAkhir: number;
  lamaPantau: number;
  kecepatanBB: number;
  kecepatanTB: number;
  rasioBBTBAkhir: number;
  lingkarKepala?: number;
  lingkarLengan?: number;
  zScore?: number;
  medianWHO?: number;
  minus2SD?: number;
  minus3SD?: number;
  stuntingLabel?: string;
  severity?: number;
  nutritionalStatus?: number;
  nutritionalLabel?: string;
  status: number;
  probability: number;
  tipe?: string;
  createdAt: string;
}

interface ResultViewProps {
  data: Prediction | null;
  onNavigate: (page: string, data?: any) => void;
  apiUrl: string;
  hideCollective?: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onNavigate, apiUrl, hideCollective = false }) => {
  const [viewMode, setViewMode] = useState<'kolektif' | 'detail'>('kolektif');

  // Tab 2: Kolektif (Excel) State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Bulk processing state
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  
  // Selected child prediction for detail view
  const [selectedChildData, setSelectedChildData] = useState<Prediction | null>(null);
  
  // Future projection states for bulk upload
  const [aktifkanProyeksi, setAktifkanProyeksi] = useState(false);
  const [targetBulanExcel, setTargetBulanExcel] = useState('3');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync mode with props (e.g. if arriving from individual form submit)
  useEffect(() => {
    if (hideCollective || data?.tipe === 'kolektif') {
      setViewMode('detail');
    } else if (data) {
      setViewMode('detail');
      setSelectedChildData(null); // Clear selected child data if prop changes
    } else {
      // Default to collective view if no prop data is available
      setViewMode('kolektif');
    }
  }, [data, hideCollective]);

  // Determine active data to show in detail panel
  const activeData = selectedChildData || data;

  // Excel Parsing Handlers
  const parseExcelFile = (file: File) => {
    // Validasi ukuran file maksimal 10 MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB dalam bytes
    if (file.size > MAX_FILE_SIZE) {
      setExcelError(`Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal yang diperbolehkan adalah 10 MB.`);
      setExcelFile(null);
      setExcelData([]);
      setBulkResults([]);
      return;
    }

    setExcelFile(file);
    setExcelError(null);
    setExcelData([]);
    setBulkResults([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawRows.length < 2) {
          setExcelError('Berkas Excel tidak memiliki baris data yang cukup.');
          return;
        }

        // Parse headers. Handle both single-row headers and multi-row Posyandu month-headers
        const row0 = Array.from(rawRows[0] || []).map(x => String(x || '').trim());
        const row1 = Array.from(rawRows[1] || []).map(x => String(x || '').trim());

        const isHeaderRow1 = row1.some(x => {
          const lower = x.toLowerCase();
          return lower.includes('bb') || lower.includes('tb') || lower.includes('kg') || lower.includes('cm') || lower.includes('berat') || lower.includes('tinggi');
        });

        const combinedHeaders: string[] = [];
        let dataStartRow = 1;

        if (isHeaderRow1) {
          dataStartRow = 2;
          const maxLen = Math.max(row0.length, row1.length);
          for (let i = 0; i < maxLen; i++) {
            const col0 = row0[i] || '';
            const col1 = row1[i] || '';
            if (col0 && col1) {
              combinedHeaders.push(`${col0}_${col1}`.toLowerCase());
            } else if (col0) {
              combinedHeaders.push(col0.toLowerCase());
            } else if (col1) {
              combinedHeaders.push(col1.toLowerCase());
            } else {
              combinedHeaders.push('');
            }
          }
        } else {
          dataStartRow = 1;
          row0.forEach(col => combinedHeaders.push(col.toLowerCase()));
        }

        const findColIndex = (aliases: string[]) => {
          return combinedHeaders.findIndex((h) => aliases.some(alias => h.includes(alias)));
        };

        const idxNama = findColIndex(['nama', 'name', 'lengkap']);
        const idxUmur = findColIndex(['umur', 'usia', 'bulan', 'age']);
        const idxJK = findColIndex(['jenis kelamin', 'jk', 'kelamin', 'sex', 'gender']);
        const idxLK = findColIndex(['lingkar kepala', 'lk', 'head']);
        const idxLL = findColIndex(['lingkar lengan', 'lila', 'lengan', 'arm']);

        // Find all weight and height columns to capture multi-month Posyandu sheets
        const bbColIndices: number[] = [];
        const tbColIndices: number[] = [];

        combinedHeaders.forEach((h, idx) => {
          if (h.includes('bb') || h.includes('berat') || h.includes('weight')) {
            bbColIndices.push(idx);
          }
          if (h.includes('tb') || h.includes('tinggi') || h.includes('height') || h.includes('panjang')) {
            tbColIndices.push(idx);
          }
        });

        if (idxNama === -1 || idxUmur === -1 || idxJK === -1 || bbColIndices.length === 0 || tbColIndices.length === 0) {
          setExcelError('Struktur kolom Excel tidak cocok. Pastikan Excel minimal memiliki kolom: Nama, Umur (Bulan), Jenis Kelamin, serta kolom BB dan TB.');
          return;
        }

        const parsedRows: any[] = [];
        for (let i = dataStartRow; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0 || !row[idxNama]) continue;

          const jkRaw = String(row[idxJK] || '').trim().toUpperCase();
          const jenisKelamin = (jkRaw.startsWith('L') || jkRaw.includes('LAKI') || jkRaw.includes('BOY') || jkRaw === '1') ? 'L' : 'P';

          // Extract the latest non-null values for weight (BB) and height (TB)
          let berat = 0;
          let tinggi = 0;

          for (let j = bbColIndices.length - 1; j >= 0; j--) {
            const val = parseFloat(row[bbColIndices[j]]);
            if (val && !isNaN(val)) {
              berat = val;
              break;
            }
          }

          for (let j = tbColIndices.length - 1; j >= 0; j--) {
            const val = parseFloat(row[tbColIndices[j]]);
            if (val && !isNaN(val)) {
              tinggi = val;
              break;
            }
          }

          if (!berat || !tinggi) continue;

          parsedRows.push({
            id: i,
            nama: String(row[idxNama]).trim(),
            umur: parseFloat(row[idxUmur]),
            jenisKelamin,
            berat,
            tinggi,
            lingkarKepala: idxLK !== -1 && row[idxLK] ? parseFloat(row[idxLK]) : undefined,
            lingkarLengan: idxLL !== -1 && row[idxLL] ? parseFloat(row[idxLL]) : undefined
          });
        }

        if (parsedRows.length === 0) {
          setExcelError('Tidak ada data balita yang valid ditemukan di dalam berkas Excel.');
          return;
        }

        setExcelData(parsedRows);
      } catch (err: any) {
        setExcelError('Gagal memproses berkas Excel. Pastikan format berkas valid.');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      parseExcelFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseExcelFile(file);
    }
    // Reset file input value so that selection of the same file triggers change event again
    e.target.value = '';
  };

  const handleBulkSubmit = async () => {
    if (!excelFile) return;

    if (aktifkanProyeksi) {
      const targetVal = parseFloat(targetBulanExcel);
      if (isNaN(targetVal) || targetVal < 1 || targetVal > 3) {
        setBulkError('Target proyeksi harus antara 1 sampai 3 bulan');
        return;
      }
    }

    setBulkLoading(true);
    setBulkError(null);
    setBulkResults([]);

    try {
      // Get user_id from session
      const authData = localStorage.getItem('auth_user');
      const userId = authData ? JSON.parse(authData).id : '';

      const formData = new FormData();
      formData.append("file", excelFile);
      formData.append("user_id", userId);

      if (aktifkanProyeksi) {
        formData.append("target_bulan_kedepan", targetBulanExcel);
      }

      const endpoint = aktifkanProyeksi ? "/api/predict/bulk-future" : "/api/predict/bulk";
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const resultData = await res.json();
      const mapped = (resultData.data || []).map((item: any) => ({
        id: item.id,
        nama: item.nama,
        success: true,
        result: item
      }));

      setBulkResults(mapped);

      // Scroll to bulk results section
      setTimeout(() => {
        document.getElementById('bulk-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setBulkError(err.message || 'Terjadi kesalahan sistem saat memproses data kolektif.');
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  const exportToExcel = () => {
    if (bulkResults.length === 0) return;
    const headers = ['Nama Balita', 'Jenis Kelamin', 'Umur (Bulan)', 'Berat Badan (kg)', 'Tinggi Badan (cm)', 'Status Gizi (BMI)', 'Skor Z-Score (HAZ)', 'Kategori Medis', 'Kesimpulan AI (Stunting)'];
    
    const rows = bulkResults.map((r: any) => {
      if (r.error) {
        return [r.nama, '', '', '', '', '', '', '', r.error];
      }
      const res = r.result;
      const genderLabel = res.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan';
      const stuntingStatus = res.status === 1 ? 'Berisiko Stunting' : 'Normal';
      const stuntingCategory = res.severity >= 2 ? 'Sangat Pendek' : res.status === 1 ? 'Pendek' : 'Normal';
      
      return [
        res.nama,
        genderLabel,
        res.umur,
        res.bbAkhir,
        res.tbAkhir,
        res.nutritionalLabel,
        res.zScore,
        stuntingCategory,
        stuntingStatus
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Posyandu");
    
    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 25 }, // Nama
      { wch: 15 }, // JK
      { wch: 15 }, // Umur
      { wch: 18 }, // BB
      { wch: 18 }, // TB
      { wch: 25 }, // Gizi
      { wch: 20 }, // Z-Score
      { wch: 20 }, // Kategori
      { wch: 25 }, // Kesimpulan AI
    ];

    XLSX.writeFile(workbook, `Laporan_Analisis_Posyandu_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Tab Switcher Styles
  const activeTabStyle: React.CSSProperties = {
    background: 'var(--accent-blue-bg)',
    color: 'var(--accent-blue)',
    border: '1px solid rgba(91, 164, 230, 0.25)',
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  };

  const inactiveTabStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid transparent',
    color: 'var(--text-secondary)',
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)'
  };

  // Render Single Detail Results View
  const renderDetailView = () => {
    if (!activeData) {
      return (
        <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Belum Ada Hasil Terpilih</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Silakan unggah data kolektif atau pilih data anak dari daftar hasil terlebih dahulu.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setViewMode('kolektif')}>
              📊 Buka Unggah Kolektif
            </button>
            <button className="btn btn-primary" onClick={() => onNavigate('input')}>
              Input Data Mandiri
            </button>
          </div>
        </div>
      );
    }

    const isStunting = activeData.status === 1;
    const isSevere = (activeData.severity ?? 0) >= 2;
    const pct = Math.round(activeData.probability * 100);
    const circumference = 2 * Math.PI * 70;
    const offset = circumference - (activeData.probability * circumference);
    const zScore = activeData.zScore ?? 0;

    // BMI calculation for Nutritional Status
    const hM = activeData.tbAkhir / 100;
    const bmi = hM > 0 ? (activeData.bbAkhir / (hM * hM)) : 0;
    const nutStatus = activeData.nutritionalStatus ?? 0;
    const nutLabel = activeData.nutritionalLabel ?? "Normal (Gizi Baik)";

    // Dynamic styling based on nutritional status
    let nutBadgeColor = 'var(--accent-green)';
    let nutBgColor = 'var(--accent-green-bg)';
    let nutBorderColor = 'var(--accent-green)';
    let nutText = '';

    if (nutStatus === 2) { // Obesitas
      nutBadgeColor = 'var(--accent-coral)';
      nutBgColor = 'var(--accent-coral-bg)';
      nutBorderColor = 'var(--accent-coral)';
      nutText = `Berdasarkan rasio berat terhadap tinggi badan (BMI: ${bmi.toFixed(1)}), berat badan anak (${activeData.bbAkhir} kg) tergolong sangat berlebih (obesitas) dibanding tinggi badannya yang ${activeData.tbAkhir} cm. Disarankan untuk membatasi asupan manis/berlemak dan mengonsultasikan menu gizi anak dengan dokter spesialis anak.`;
    } else if (nutStatus === 1) { // Gizi Lebih
      nutBadgeColor = '#e67e22';
      nutBgColor = 'rgba(230, 126, 34, 0.1)';
      nutBorderColor = '#e67e22';
      nutText = `Berdasarkan rasio berat terhadap tinggi badan (BMI: ${bmi.toFixed(1)}), anak tergolong kelebihan berat badan (overweight). Jaga pola makan dengan nutrisi seimbang, perbanyak aktivitas fisik aktif, dan hindari camilan berkalori kosong.`;
    } else if (nutStatus === -1) { // Gizi Kurang
      nutBadgeColor = '#e67e22';
      nutBgColor = 'rgba(230, 126, 34, 0.1)';
      nutBorderColor = '#e67e22';
      nutText = `Berdasarkan rasio berat terhadap tinggi badan (BMI: ${bmi.toFixed(1)}), anak menunjukkan indikasi gizi kurang (wasted). Tambahkan asupan kalori padat gizi, utamakan protein hewani berkadar lemak sehat (seperti ikan kembung, telur, ayam), dan pantau kenaikan berat badannya setiap bulan.`;
    } else if (nutStatus === -2) { // Gizi Buruk
      nutBadgeColor = 'var(--accent-coral)';
      nutBgColor = 'var(--accent-coral-bg)';
      nutBorderColor = 'var(--accent-coral)';
      nutText = `Perhatian serius! Berdasarkan rasio berat terhadap tinggi badan (BMI: ${bmi.toFixed(1)}), anak terindikasi mengalami gizi buruk (severely wasted). Segera bawa anak ke fasilitas pelayanan kesehatan terdekat (Puskesmas/Rumah Sakit) untuk mendapatkan penanganan medis dan formula gizi terapeutik.`;
    } else { // Normal (Gizi Baik)
      nutBadgeColor = 'var(--accent-green)';
      nutBgColor = 'var(--accent-green-bg)';
      nutBorderColor = 'var(--accent-green)';
      nutText = `Sangat baik! Rasio berat terhadap tinggi badan anak berada dalam proporsi yang ideal dan sehat (BMI: ${bmi.toFixed(1)}). Pertahankan pemberian makanan bergizi seimbang yang kaya akan protein hewani.`;
    }

    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Back Link to collective table if there is bulk results */}
        {(bulkResults.length > 0 || selectedChildData) && (
          <div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setViewMode('kolektif');
                setSelectedChildData(null);
                setTimeout(() => {
                  document.getElementById('bulk-results-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
            >
              ← Kembali ke Hasil Kolektif / Impor
            </button>
          </div>
        )}

        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Hasil Analisis Stunting & Gizi</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Hasil deteksi risiko stunting dan gizi untuk <strong>{activeData.nama}</strong>, usia {activeData.umur} bulan.
          </p>
        </div>

        {/* Main Result Card - Stunting */}
        <div className="glass-panel" style={{
          padding: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
          borderLeft: `6px solid ${isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'}`
        }}>
          {/* Donut Chart */}
          <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              {/* Background circle */}
              <circle cx="90" cy="90" r="70" fill="none" stroke="var(--bg-primary)" strokeWidth="14" />
              {/* Animated progress circle */}
              <circle
                cx="90" cy="90" r="70"
                fill="none"
                stroke={isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'}
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 90 90)"
                style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)' }}>
                {pct}%
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>Risiko Stunting</div>
            </div>
          </div>

          {/* Status Info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '1.1rem',
              fontWeight: 800,
              background: isStunting ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
              color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)',
              marginBottom: '1rem'
            }}>
              {isSevere ? '🚨 SANGAT PENDEK (SEVERELY STUNTED)' : isStunting ? '⚠️ PENDEK (STUNTED)' : '✅ TINGGI NORMAL (SEHAT)'}
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {activeData.tipe === 'simulasi_kolektif' ? (
                isStunting ? (
                  // Predicts Stunting in future
                  zScore !== undefined && zScore >= -2 ? (
                    // Future Z-score is >= -2 but AI says Stunting? 
                    // Since we injected Z-score into training, this is rare, but if it happens, it means Velocity is very bad.
                    <><strong>Peringatan Dini!</strong> Berdasarkan <strong>Prediksi AI</strong>, kecepatan tumbuh <strong>{activeData.nama}</strong> terpantau sangat lambat (Tinggi: <strong>{activeData.kecepatanTB > 0 ? '+' : ''}{activeData.kecepatanTB.toFixed(1)} cm/bln</strong>, Berat: <strong>{activeData.kecepatanBB > 0 ? '+' : ''}{activeData.kecepatanBB.toFixed(2)} kg/bln</strong>). Dalam <strong>{activeData.lamaPantau} bulan ke depan</strong> ia diprediksi memiliki probabilitas <strong>{(activeData.probability * 100).toFixed(1)}%</strong> jatuh ke lintasan <strong>Stunting (Faltering Growth)</strong> dengan estimasi tinggi akhir <strong>{activeData.tbAkhir.toFixed(1)} cm</strong>. Segera perbaiki gizi sebelum terlambat!</>
                  ) : (
                    // Future Z-score is < -2 and AI says Stunting
                    <><strong>Perhatian Khusus!</strong> Berdasarkan histori kecepatan tumbuhnya (Tinggi: <strong>{activeData.kecepatanTB > 0 ? '+' : ''}{activeData.kecepatanTB.toFixed(1)} cm/bln</strong>), <strong>Prediksi AI</strong> memproyeksikan lintasan pertumbuhan <strong>{activeData.nama}</strong> dalam <strong>{activeData.lamaPantau} bulan ke depan</strong> akan tetap berada di bawah kurva dengan probabilitas <strong>{(activeData.probability * 100).toFixed(1)}% Berisiko Stunting</strong>. Diperlukan intervensi gizi dan pendampingan medis yang lebih intensif.</>
                  )
                ) : (
                  // Predicts Normal in future
                  zScore !== undefined && zScore < -2 ? (
                    // Future Z-score < -2 but AI says Normal?
                    // This means Catch-up growth is happening!
                    <><strong>Kabar Baik!</strong> <strong>Prediksi AI</strong> menangkap tren kecepatan tumbuh yang luar biasa positif (Tinggi: <strong>+{activeData.kecepatanTB.toFixed(1)} cm/bln</strong>, Berat: <strong>+{activeData.kecepatanBB.toFixed(2)} kg/bln</strong>). Dalam <strong>{activeData.lamaPantau} bulan ke depan</strong>, <strong>{activeData.nama}</strong> memiliki peluang besar (<strong>{((1 - activeData.probability) * 100).toFixed(1)}%</strong>) untuk melakukan <em>Catch-up Growth</em> dan lulus dari kategori stunting. Pertahankan asupan gizinya!</>
                  ) : (
                    // Future Z-score >= -2 and AI says Normal
                    <><strong>Sangat Baik!</strong> Berdasarkan <strong>Prediksi AI</strong>, tren kecepatan tumbuh anak sangat ideal (Tinggi: <strong>+{activeData.kecepatanTB.toFixed(1)} cm/bln</strong>). Dalam <strong>{activeData.lamaPantau} bulan ke depan</strong>, probabilitas ia tetap <strong>Normal (Aman)</strong> mencapai <strong>{((1 - activeData.probability) * 100).toFixed(1)}%</strong> dengan estimasi tinggi mencapai <strong>{activeData.tbAkhir.toFixed(1)} cm</strong>. Lanjutkan pola asuh dan gizi yang sudah baik ini.</>
                  )
                )
              ) : (
                isSevere ? (
                  <>Berdasarkan perhitungan klinis <strong>Z-Score WHO</strong> mutlak, tinggi badan <strong>{activeData.nama}</strong> berada <strong>di bawah -3 SD</strong> (Z-Score: {zScore}). Anak tergolong <strong>sangat pendek (severely stunted)</strong>. Segera konsultasikan ke dokter anak atau puskesmas terdekat untuk penanganan gizi intensif.</>
                ) : isStunting ? (
                  <>Berdasarkan perhitungan klinis <strong>Z-Score WHO</strong> mutlak, tinggi badan <strong>{activeData.nama}</strong> berada <strong>di bawah -2 SD</strong> (Z-Score: {zScore}). Anak tergolong <strong>pendek (stunted)</strong>. Tingkatkan asupan protein hewani dan konsultasikan ke petugas Posyandu atau dokter anak terdekat.</>
                ) : (
                  <>Kabar baik! Berdasarkan perhitungan klinis <strong>Z-Score WHO</strong> mutlak (Z-Score: {zScore}), pertumbuhan <strong>{activeData.nama}</strong> berada dalam kurva <strong>normal WHO</strong> (≥ -2 SD). Terus pantau dan pertahankan pola makan bergizi seimbang.</>
                )
              )}
            </p>
          </div>
        </div>

        {/* Main Result Card - Nutritional Status */}
        <div className="glass-panel" style={{
          padding: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
          borderLeft: `6px solid ${nutBorderColor}`
        }}>
          {/* Indeks Massa Tubuh Representation */}
          <div style={{
            position: 'relative',
            width: '180px',
            height: '180px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '3rem' }}>
              {nutStatus === 2 ? '⚖️' : nutStatus === 1 ? '🍎' : nutStatus === 0 ? '🥗' : nutStatus === -1 ? '🍲' : '🚨'}
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
              BMI: {bmi.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Indeks Massa Tubuh</div>
          </div>

          {/* Status Info */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '1.1rem',
              fontWeight: 800,
              background: nutBgColor,
              color: nutBadgeColor,
              marginBottom: '1rem',
              textTransform: 'uppercase'
            }}>
              Status Gizi: {nutLabel}
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {nutText}
            </p>
          </div>
        </div>

        {/* Detail Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <DetailCard label="Nama Balita" value={activeData.nama} icon="👶" />
          <DetailCard label="Umur" value={`${activeData.umur} Bulan`} icon="📅" />
          <DetailCard label="Jenis Kelamin" value={activeData.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} icon={activeData.jenisKelamin === 'L' ? '👦' : '👧'} />
        </div>

        {/* Measurement Table */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>Detail Pengukuran Saat Ini</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={thStyle}>Parameter</th>
                  <th style={thStyle}>Nilai Pengukuran</th>
                </tr>
              </thead>
              <tbody>
                <tr style={trStyle}>
                  <td style={tdStyle}><strong>Berat Badan</strong></td>
                  <td style={tdStyle}>{activeData.bbAkhir} kg</td>
                </tr>
                <tr style={trStyle}>
                  <td style={tdStyle}><strong>Tinggi Badan</strong></td>
                  <td style={tdStyle}>{activeData.tbAkhir} cm</td>
                </tr>
                <tr style={trStyle}>
                  <td style={tdStyle}><strong>Rasio BB/TB</strong></td>
                  <td style={{ ...tdStyle, fontWeight: 700 }}>{activeData.rasioBBTBAkhir}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* WHO Z-Score Analysis Card */}
        {activeData.zScore !== undefined && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Analisis Z-Score WHO (Height-for-Age)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Skor Anak (Z-Score)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)' }}>{zScore}</div>
              </div>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Target Ideal (Median)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{activeData.medianWHO} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>cm</span></div>
              </div>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Batas Pendek (-2 SD)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-coral)' }}>{activeData.minus2SD} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>cm</span></div>
              </div>
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Sangat Pendek (-3 SD)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c62828' }}>{activeData.minus3SD} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>cm</span></div>
              </div>
            </div>

            {/* Z-Score Visual Bar */}
            <div style={{ position: 'relative', width: '100%', height: '40px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
              {/* Green zone (normal: >= -2) */}
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', background: 'rgba(118, 200, 147, 0.15)' }} />
              {/* Yellow zone (stunted: -3 to -2) */}
              <div style={{ position: 'absolute', right: '40%', top: 0, bottom: 0, width: '20%', background: 'rgba(255, 183, 77, 0.15)' }} />
              {/* Red zone (severely stunted: < -3) */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: 'rgba(231, 111, 81, 0.10)' }} />
              {/* Z-Score marker — map z from -5 to +3 onto 0% to 100% */}
              {(() => {
                const markerPct = Math.max(0, Math.min(100, ((zScore + 5) / 8) * 100));
                return (
                  <div style={{
                    position: 'absolute',
                    left: `${markerPct}%`,
                    top: '4px',
                    bottom: '4px',
                    width: '4px',
                    background: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)',
                    borderRadius: '2px',
                    boxShadow: `0 0 8px ${isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'}`,
                    transform: 'translateX(-50%)'
                  }} />
                );
              })()}
              {/* -3SD marker */}
              <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: '1px', background: 'var(--text-muted)', opacity: 0.3 }} />
              {/* -2SD marker */}
              <div style={{ position: 'absolute', left: '37.5%', top: 0, bottom: 0, width: '1px', background: 'var(--text-muted)', opacity: 0.3 }} />
              {/* 0 (median) marker */}
              <div style={{ position: 'absolute', left: '62.5%', top: 0, bottom: 0, width: '1px', background: 'var(--text-muted)', opacity: 0.3 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span>-5 SD</span>
              <span>-3 SD</span>
              <span>-2 SD</span>
              <span>Median</span>
              <span>+3 SD</span>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-blue-bg)',
              border: '1px solid rgba(91, 164, 230, 0.12)',
              marginTop: '1.25rem'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--accent-blue)' }}>Rumus WHO:</strong> Z-Score dihitung dengan metode <strong>LMS</strong> (Lambda-Mu-Sigma) berdasarkan data <strong>WHO Multicentre Growth Reference Study (MGRS)</strong>. Klasifikasi: <strong>Normal</strong> (HAZ ≥ -2 SD), <strong>Pendek/Stunted</strong> (HAZ {'<'} -2 SD), <strong>Sangat Pendek/Severely Stunted</strong> (HAZ {'<'} -3 SD).
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
            ← Kembali ke Dashboard
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => onNavigate('education')}>
              📚 Tips Nutrisi
            </button>
            <button className="btn btn-primary" onClick={() => onNavigate('input')}>
              + Periksa Balita Lain
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Collective Excel Upload View
  const renderCollectiveView = () => {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Banner: Download Template */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '1.5rem', 
          background: 'linear-gradient(135deg, var(--bg-secondary), rgba(91,164,230,0.05))' 
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              📂 Unduh Template Excel Resmi
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Gunakan template resmi Posyandu ini agar nama-nama kolom cocok dan dapat diproses otomatis oleh sistem kecerdasan buatan.
            </p>
          </div>
          <a 
            href="/template_pengisian_dataset_posyandu.xlsx" 
            download="template_pengisian_dataset_posyandu.xlsx"
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', fontWeight: 700, padding: '12px 20px' }}
          >
            📥 Unduh Template Posyandu
          </a>
        </div>

        {/* Drag & Drop Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '3.5rem 2rem',
            borderRadius: 'var(--radius-lg)',
            border: `2px dashed ${isDragOver ? 'var(--accent-blue)' : 'var(--border-color)'}`,
            background: isDragOver ? 'var(--accent-blue-bg)' : 'var(--bg-secondary)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
          <span style={{ fontSize: '3.5rem' }}>📊</span>
          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {excelFile ? excelFile.name : 'Tarik & Lepas Berkas Excel di Sini'}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {excelFile ? `${(excelFile.size / 1024).toFixed(1)} KB` : 'Atau klik untuk memilih berkas (.xlsx, .xls) dari perangkat Anda'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>
              📎 Maksimal ukuran file: <strong>10 MB</strong>
            </p>
          </div>
        </div>

        {/* Excel Parsing Errors */}
        {excelError && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-coral-bg)',
            border: '1px solid rgba(231, 111, 81, 0.15)',
            color: 'var(--accent-coral)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span> {excelError}
          </div>
        )}

        {/* Preview Table */}
        {excelData.length > 0 && bulkResults.length === 0 && (
          <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Section: Proyeksi Masa Depan Massal */}
            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.25rem' }}>🔮</span>
                  <div>
                    <label htmlFor="input-proyeksi-excel" style={{ fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>Aktifkan Proyeksi Masa Depan Massal</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Simulasikan pertumbuhan seluruh balita di Excel ke beberapa bulan mendatang.</p>
                  </div>
                </div>
                <input 
                  id="input-proyeksi-excel"
                  type="checkbox" 
                  checked={aktifkanProyeksi} 
                  onChange={e => setAktifkanProyeksi(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
                />
              </div>

              {aktifkanProyeksi && (
                <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label htmlFor="input-target-bulan-excel" className="form-label">Target Bulan ke Depan</label>
                    <input 
                      id="input-target-bulan-excel" 
                      type="number" 
                      className="form-input" 
                      placeholder="Contoh: 3" 
                      min="1" 
                      max="3"
                      value={targetBulanExcel} 
                      onChange={e => setTargetBulanExcel(e.target.value)} 
                      required 
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rentang proyeksi: 1 - 3 bulan ke depan</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, paddingLeft: '8px' }}>
                      Sistem akan memproyeksikan tinggi & berat badan masa depan setiap anak di Excel berdasarkan tren kecepatan tumbuh mereka.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Pratinjau Data Impor ({excelData.length} Balita)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '2px' }}>Silakan periksa kembali kecocokan data sebelum menganalisis.</p>
              </div>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleBulkSubmit}
                disabled={bulkLoading}
                style={{ minWidth: '160px' }}
              >
                {bulkLoading ? 'Memproses...' : '🚀 Mulai Analisis Kolektif'}
              </button>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>
                    <th style={{ padding: '10px 8px' }}>Nama</th>
                    <th style={{ padding: '10px 8px' }}>JK</th>
                    <th style={{ padding: '10px 8px' }}>Umur</th>
                    <th style={{ padding: '10px 8px' }}>Berat (kg)</th>
                    <th style={{ padding: '10px 8px' }}>Tinggi (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>{row.nama}</td>
                      <td style={{ padding: '10px 8px' }}>{row.jenisKelamin === 'L' ? 'L' : 'P'}</td>
                      <td style={{ padding: '10px 8px' }}>{row.umur} Bln</td>
                      <td style={{ padding: '10px 8px' }}>{row.berat}</td>
                      <td style={{ padding: '10px 8px' }}>{row.tinggi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bulk Processing Progress Indicator */}
        {bulkLoading && (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Menganalisis Data Balita secara Kolektif...</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Sistem sedang menghitung Z-Score dan status gizi WHO untuk {excelData.length} data.</p>
            </div>
          </div>
        )}

        {bulkError && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-coral-bg)',
            border: '1px solid rgba(231, 111, 81, 0.15)',
            color: 'var(--accent-coral)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span> {bulkError}
          </div>
        )}

        {/* Collective Report / Bulk Results */}
        {bulkResults.length > 0 && (
          <div id="bulk-results-section" className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '6px solid var(--accent-blue)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>📊 Laporan Hasil Deteksi Kolektif</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Analisis stunting dan status gizi balita Posyandu selesai dihitung.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  📥 Unduh Laporan Excel (.xlsx)
                </button>
                <button type="button" className="btn btn-primary" onClick={() => { 
                  setExcelFile(null); 
                  setExcelData([]); 
                  setBulkResults([]); 
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}>
                  Periksa Berkas Lain
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 8px' }}>Nama</th>
                    <th style={{ padding: '12px 8px' }}>{aktifkanProyeksi ? 'Umur Proyeksi' : 'Umur'}</th>
                    <th style={{ padding: '12px 8px' }}>JK</th>
                    <th style={{ padding: '12px 8px' }}>{aktifkanProyeksi ? 'Est. BB/TB' : 'BB/TB'}</th>
                    <th style={{ padding: '12px 8px' }}>Z-Score (HAZ)</th>
                    <th style={{ padding: '12px 8px' }}>{aktifkanProyeksi ? 'Est. Status Tinggi' : 'Status Tinggi (WHO)'}</th>
                    <th style={{ padding: '12px 8px' }}>{aktifkanProyeksi ? 'Est. Status Gizi' : 'Status Gizi (WHO)'}</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((row) => {
                    if (row.error) {
                      return (
                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(231,111,81,0.05)' }}>
                          <td style={{ padding: '12px 8px', fontWeight: 600 }}>{row.nama}</td>
                          <td colSpan={6} style={{ padding: '12px 8px', color: 'var(--accent-coral)', fontWeight: 600 }}>
                            ⚠️ Gagal diproses: {row.error}
                          </td>
                          <td style={{ padding: '12px 8px' }} />
                        </tr>
                      );
                    }

                    const res = row.result;
                    const isStunt = res.status === 1;
                    const isSev = res.severity >= 2;
                    const nutStat = res.nutritionalStatus;

                    // Colors for statuses
                    const stuntBadgeStyle = {
                      display: 'inline-flex',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: isStunt ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
                      color: isStunt ? 'var(--accent-coral)' : 'var(--accent-green)'
                    };

                    const nutBadgeStyle = {
                      display: 'inline-flex',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: (nutStat === 2 || nutStat === -2) ? 'var(--accent-coral-bg)' : (nutStat === 1 || nutStat === -1) ? 'rgba(230, 126, 34, 0.1)' : 'var(--accent-green-bg)',
                      color: (nutStat === 2 || nutStat === -2) ? 'var(--accent-coral)' : (nutStat === 1 || nutStat === -1) ? '#e67e22' : 'var(--accent-green)'
                    };

                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{res.nama}</td>
                        <td style={{ padding: '12px 8px' }}>{res.umur} Bulan</td>
                        <td style={{ padding: '12px 8px' }}>{res.jenisKelamin}</td>
                        <td style={{ padding: '12px 8px' }}>{res.bbAkhir}kg / {res.tbAkhir}cm</td>
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: isStunt ? 'var(--accent-coral)' : 'var(--accent-green)' }}>
                          {res.zScore}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={stuntBadgeStyle}>
                            {isSev ? 'Sangat Pendek' : isStunt ? 'Pendek' : 'Normal'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={nutBadgeStyle}>
                            {res.nutritionalLabel}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setSelectedChildData(res);
                              setViewMode('detail');
                              setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }, 100);
                            }}
                            style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    );
  };

  return (
    <div className="fade-in" style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header (Toggled only if not showing a specific child detail to save space) */}
      {!activeData && (
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Hasil Deteksi & Prediksi</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Halaman khusus Kader Posyandu untuk impor kolektif berkas Excel dan melihat rangkuman status pertumbuhan balita.
          </p>
        </div>
      )}

      {/* Hint Box: Navigation / Info for parents vs kader */}
      {!activeData && (
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(91, 164, 230, 0.06)',
          border: '1px solid rgba(91, 164, 230, 0.12)'
        }}>
          <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent-blue)' }}>Petunjuk Kader:</strong> Unggah file Excel berisi data balita di bawah ini untuk menganalisis Z-Score secara bulk.
            Jika Anda ingin melakukan input pengukuran secara <strong>mandiri untuk satu anak</strong>, silakan buka halaman{' '}
            <span
              style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
              onClick={() => onNavigate('input')}
            >
              📝 Input Data
            </span>.
          </p>
        </div>
      )}

      {/* Tab Switcher - only show if there is an active individual result to switch between tabs */}
      {!hideCollective && data?.tipe !== 'kolektif' && activeData && (
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => { setViewMode('kolektif'); setSelectedChildData(null); }}
            style={viewMode === 'kolektif' ? activeTabStyle : inactiveTabStyle}
          >
            📋 Impor Kolektif (Kader)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('detail')}
            style={viewMode === 'detail' ? activeTabStyle : inactiveTabStyle}
          >
            👤 Detail Hasil Individu
          </button>
        </div>
      )}

      {/* Main Views Switcher */}
      {viewMode === 'detail' ? renderDetailView() : renderCollectiveView()}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Sub-components
const DetailCard: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <span style={{ fontSize: '1.75rem' }}>{icon}</span>
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '2px' }}>{value}</div>
    </div>
  </div>
);

// Shared styles
const thStyle: React.CSSProperties = { padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '14px 8px', fontSize: '0.95rem' };
const trStyle: React.CSSProperties = { borderBottom: '1px solid var(--border-color)' };
