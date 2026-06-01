import React, { useState, useRef } from 'react';
import { ResultView } from './ResultView';
import * as XLSX from 'xlsx';

interface InputFormProps {
  onNavigate: (page: string, data?: any) => void;
  apiUrl: string;
}

export const InputForm: React.FC<InputFormProps> = ({ onNavigate, apiUrl }) => {
  const [activeTab, setActiveTab] = useState<'mandiri' | 'kolektif'>('mandiri');
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  
  // Tab 1: Mandiri Form State
  const [formData, setFormData] = useState({
    nama: '',
    umur: '',
    jenisKelamin: 'L' as 'L' | 'P',
    berat: '',
    tinggi: '',
    lingkarKepala: '',
    lingkarLengan: ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Tab 2: Kolektif (Excel) State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Bulk processing state
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    setFormError(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    setFormError(null);

    if (!formData.nama.trim()) {
      errors.nama = 'Nama lengkap balita harus diisi';
    }

    const umurVal = parseFloat(formData.umur);
    if (isNaN(umurVal) || umurVal < 0) {
      errors.umur = 'Umur harus berupa angka positif';
    }

    const beratVal = parseFloat(formData.berat);
    if (isNaN(beratVal) || beratVal <= 0) {
      errors.berat = 'Berat badan harus berupa angka lebih besar dari 0';
    }

    const tinggiVal = parseFloat(formData.tinggi);
    if (isNaN(tinggiVal) || tinggiVal <= 0) {
      errors.tinggi = 'Tinggi badan harus berupa angka lebih besar dari 0';
    }

    if (formData.lingkarKepala) {
      const lkVal = parseFloat(formData.lingkarKepala);
      if (isNaN(lkVal) || lkVal <= 0) {
        errors.lingkarKepala = 'Lingkar kepala harus berupa angka positif';
      }
    }

    if (formData.lingkarLengan) {
      const llVal = parseFloat(formData.lingkarLengan);
      if (isNaN(llVal) || llVal <= 0) {
        errors.lingkarLengan = 'Lingkar lengan harus berupa angka positif';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormError('Mohon periksa kembali input Anda. Beberapa nilai tidak sesuai batas wajar.');
      return;
    }

    setLoading(true);
    setPredictionResult(null);

    try {
      const payload = {
        nama: formData.nama,
        umur: parseFloat(formData.umur),
        jenisKelamin: formData.jenisKelamin,
        berat: parseFloat(formData.berat),
        tinggi: parseFloat(formData.tinggi),
        lingkarKepala: formData.lingkarKepala ? parseFloat(formData.lingkarKepala) : undefined,
        lingkarLengan: formData.lingkarLengan ? parseFloat(formData.lingkarLengan) : undefined
      };

      const res = await fetch(`${apiUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal mengirim data');
      }
      const result = await res.json();
      setPredictionResult(result);
      
      // Scroll to result section after render
      setTimeout(() => {
        document.getElementById('prediction-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat mengirim data. Pastikan backend berjalan.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tab 2: Excel Handlers
  const parseExcelFile = (file: File) => {
    setExcelFile(file);
    setExcelError(null);
    setExcelData([]);
    setBulkResults([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawRows.length < 2) {
          setExcelError('Berkas Excel tidak memiliki baris data yang cukup.');
          return;
        }

        // Parse headers (row 0) and look for columns
        const headers = rawRows[0].map((h: any) => String(h || '').trim().toLowerCase());

        const findColIndex = (aliases: string[]) => {
          return headers.findIndex((h: string) => aliases.some(alias => h.includes(alias)));
        };

        const idxNama = findColIndex(['nama', 'name', 'lengkap']);
        const idxUmur = findColIndex(['umur', 'usia', 'bulan', 'age']);
        const idxJK = findColIndex(['jenis kelamin', 'jk', 'kelamin', 'sex', 'gender']);
        const idxBerat = findColIndex(['berat', 'bb', 'weight']);
        const idxTinggi = findColIndex(['tinggi', 'tb', 'height', 'panjang']);
        const idxLK = findColIndex(['lingkar kepala', 'lk', 'head']);
        const idxLL = findColIndex(['lingkar lengan', 'lila', 'lengan', 'arm']);

        if (idxNama === -1 || idxUmur === -1 || idxJK === -1 || idxBerat === -1 || idxTinggi === -1) {
          setExcelError('Struktur kolom Excel tidak cocok. Pastikan Excel minimal memiliki kolom: Nama, Umur (Bulan), Jenis Kelamin (L/P), Berat Badan (kg), dan Tinggi Badan (cm).');
          return;
        }

        const parsedRows: any[] = [];
        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0 || !row[idxNama]) continue;

          const jkRaw = String(row[idxJK] || '').trim().toUpperCase();
          const jenisKelamin = (jkRaw.startsWith('L') || jkRaw.includes('LAKI') || jkRaw.includes('BOY')) ? 'L' : 'P';

          parsedRows.push({
            id: i,
            nama: String(row[idxNama]).trim(),
            umur: parseFloat(row[idxUmur]),
            jenisKelamin,
            berat: parseFloat(row[idxBerat]),
            tinggi: parseFloat(row[idxTinggi]),
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
    reader.readAsBinaryString(file);
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
  };

  const handleBulkSubmit = async () => {
    if (excelData.length === 0) return;

    setBulkLoading(true);
    setBulkError(null);
    setBulkResults([]);

    try {
      const promises = excelData.map(async (item) => {
        try {
          const res = await fetch(`${apiUrl}/api/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nama: item.nama,
              umur: item.umur,
              jenisKelamin: item.jenisKelamin,
              berat: item.berat,
              tinggi: item.tinggi,
              lingkarKepala: item.lingkarKepala,
              lingkarLengan: item.lingkarLengan
            })
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            return {
              ...item,
              error: errData.error || `HTTP ${res.status}`
            };
          }

          const result = await res.json();
          return {
            ...item,
            success: true,
            result
          };
        } catch (err: any) {
          return {
            ...item,
            error: err.message || 'Gagal menghubungi server'
          };
        }
      });

      const results = await Promise.all(promises);
      setBulkResults(results);

      // Scroll to bulk results section
      setTimeout(() => {
        document.getElementById('bulk-results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setBulkError('Terjadi kesalahan sistem saat memproses data kolektif.');
      console.error(err);
    } finally {
      setBulkLoading(false);
    }
  };

  const exportToCSV = () => {
    if (bulkResults.length === 0) return;
    const headers = ['Nama Balita', 'Umur (Bulan)', 'Jenis Kelamin', 'Berat Badan (kg)', 'Tinggi Badan (cm)', 'Z-Score (HAZ)', 'Status Tinggi (WHO)', 'Status Gizi (WHO)', 'Rasio BB/TB'];
    const rows = bulkResults.map((r: any) => {
      if (r.error) {
        return [r.nama, r.umur, r.jenisKelamin, r.berat, r.tinggi, 'Error', r.error, '', ''];
      }
      const res = r.result;
      const genderLabel = res.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan';
      const stuntingLabel = res.severity >= 2 ? 'Sangat Pendek' : res.status === 1 ? 'Pendek' : 'Normal';
      return [
        res.nama,
        res.umur,
        genderLabel,
        res.bbAkhir,
        res.tbAkhir,
        res.zScore,
        stuntingLabel,
        res.nutritionalLabel,
        res.rasioBBTBAkhir
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" // Add BOM for Excel compatibility
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Analisis_Posyandu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inline Styles
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

  return (
    <div className="fade-in" style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Kalkulator Pertumbuhan Balita</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Deteksi dini status stunting dan gizi balita menggunakan standar WHO.</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('mandiri'); setPredictionResult(null); }}
          style={activeTab === 'mandiri' ? activeTabStyle : inactiveTabStyle}
        >
          👤 Input Mandiri (Satu Anak)
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('kolektif'); }}
          style={activeTab === 'kolektif' ? activeTabStyle : inactiveTabStyle}
        >
          📋 Input Kolektif (Excel)
        </button>
      </div>

      {/* TAB 1: INPUT MANDIRI */}
      {activeTab === 'mandiri' && (
        <form onSubmit={handleSubmit}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>

            {/* Section: Identitas Anak */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Identitas Anak
            </h3>

            <div className="form-group">
              <label htmlFor="input-nama" className="form-label">Nama Lengkap Balita</label>
              <input id="input-nama" type="text" className="form-input" placeholder="Contoh: Leo Kurniawan" value={formData.nama} onChange={e => handleChange('nama', e.target.value)} required />
              {validationErrors.nama && <span style={{ color: 'var(--accent-coral)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>{validationErrors.nama}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="input-umur" className="form-label">Umur (Bulan)</label>
                <input id="input-umur" type="number" step="any" className="form-input" placeholder="Contoh: 24" min="0" value={formData.umur} onChange={e => handleChange('umur', e.target.value)} required />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rentang wajar: 0 - 60 bulan</span>
                {validationErrors.umur && <span style={{ color: 'var(--accent-coral)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>{validationErrors.umur}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <div className="gender-switch">
                  <div
                    className={`gender-option ${formData.jenisKelamin === 'L' ? 'selected' : ''}`}
                    onClick={() => handleChange('jenisKelamin', 'L')}
                    id="gender-l"
                  >
                    👦 Laki-laki
                  </div>
                  <div
                    className={`gender-option ${formData.jenisKelamin === 'P' ? 'selected' : ''}`}
                    onClick={() => handleChange('jenisKelamin', 'P')}
                    id="gender-p"
                  >
                    👧 Perempuan
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

            {/* Section: Data Pengukuran */}
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Data Pengukuran
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label htmlFor="input-berat" className="form-label">Berat Badan (kg)</label>
                <input id="input-berat" type="number" step="any" className="form-input" placeholder="Contoh: 9.0" min="0.01" value={formData.berat} onChange={e => handleChange('berat', e.target.value)} required />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rentang wajar: 1.5 - 40 kg</span>
                {validationErrors.berat && <span style={{ color: 'var(--accent-coral)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>{validationErrors.berat}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="input-tinggi" className="form-label">Tinggi Badan (cm)</label>
                <input id="input-tinggi" type="number" step="any" className="form-input" placeholder="Contoh: 80.0" min="0.1" value={formData.tinggi} onChange={e => handleChange('tinggi', e.target.value)} required />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rentang wajar: 40 - 130 cm</span>
                {validationErrors.tinggi && <span style={{ color: 'var(--accent-coral)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>{validationErrors.tinggi}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="input-lingkar-kepala" className="form-label">Lingkar Kepala (cm)</label>
                <input id="input-lingkar-kepala" type="number" step="any" className="form-input" placeholder="Contoh: 46.5" min="0.1" value={formData.lingkarKepala} onChange={e => handleChange('lingkarKepala', e.target.value)} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rentang wajar: 30 - 60 cm (opsional)</span>
                {validationErrors.lingkarKepala && <span style={{ color: 'var(--accent-coral)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>{validationErrors.lingkarKepala}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="input-lingkar-lengan" className="form-label">Lingkar Lengan (cm)</label>
                <input id="input-lingkar-lengan" type="number" step="any" className="form-input" placeholder="Contoh: 14.2" min="0.1" value={formData.lingkarLengan} onChange={e => handleChange('lingkarLengan', e.target.value)} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rentang wajar: 5 - 25 cm (opsional)</span>
                {validationErrors.lingkarLengan && <span style={{ color: 'var(--accent-coral)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>{validationErrors.lingkarLengan}</span>}
              </div>
            </div>

            {/* Info Box */}
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-blue-bg)',
              border: '1px solid rgba(91, 164, 230, 0.12)',
              marginTop: '0.5rem'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--accent-blue)' }}>Penting:</strong> Pastikan data berat badan dan tinggi badan diukur sesuai <strong>standar WHO</strong>. Anak di bawah 2 tahun diukur berbaring, di atas 2 tahun diukur berdiri.
              </p>
            </div>

          </div>

          {/* Submit Button Area */}
          {formError && (
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-coral-bg)',
              border: '1px solid rgba(231, 111, 81, 0.15)',
              color: 'var(--accent-coral)',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span> {formError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>
              Kembali
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-predict-btn" style={{ minWidth: '180px' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  Menganalisis...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Analisis Stunting
                </span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: INPUT KOLEKTIF (EXCEL) */}
      {activeTab === 'kolektif' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Download & Banner Row */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(135deg, var(--bg-secondary), rgba(91,164,230,0.05))' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                📂 Unduh Template Excel Resmi
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Unduh template resmi pengisian data Posyandu terlebih dahulu untuk memastikan nama-nama kolom sesuai dan dapat diproses otomatis oleh sistem.
              </p>
            </div>
            <a 
              href="https://drive.google.com/drive/folders/1TMsvQ3nUHkdBqkZqS278Je7DX_mbhIEz?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', fontWeight: 700, padding: '12px 20px' }}
            >
              📥 Unduh Template di Google Drive
            </a>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '3rem 2rem',
              borderRadius: 'var(--radius-lg)',
              border: `2px dashed ${isDragOver ? 'var(--accent-blue)' : 'var(--border-color)'}`,
              background: isDragOver ? 'var(--accent-blue-bg)' : 'var(--bg-secondary)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
            <span style={{ fontSize: '3rem' }}>📊</span>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {excelFile ? excelFile.name : 'Tarik & Lepas Berkas Excel di Sini'}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {excelFile ? `${(excelFile.size / 1024).toFixed(1)} KB` : 'Atau klik untuk memilih berkas (.xlsx, .xls) dari penyimpanan Anda'}
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
                      <th style={{ padding: '10px 8px' }}>LK (cm)</th>
                      <th style={{ padding: '10px 8px' }}>LiLA (cm)</th>
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
                        <td style={{ padding: '10px 8px', color: row.lingkarKepala ? 'inherit' : 'var(--text-muted)' }}>
                          {row.lingkarKepala ?? '-'}
                        </td>
                        <td style={{ padding: '10px 8px', color: row.lingkarLengan ? 'inherit' : 'var(--text-muted)' }}>
                          {row.lingkarLengan ?? '-'}
                        </td>
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
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>Backend sedang menghitung Z-Score dan Status Gizi WHO untuk {excelData.length} data.</p>
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
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Analisis medis Z-Score stunting dan status gizi balita telah selesai.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-outline" onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                    📥 Ekspor ke CSV (.csv)
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => { setExcelFile(null); setExcelData([]); setBulkResults([]); }}>
                    ⚙️ Periksa Berkas Lain
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '12px 8px' }}>Nama</th>
                      <th style={{ padding: '12px 8px' }}>Umur</th>
                      <th style={{ padding: '12px 8px' }}>JK</th>
                      <th style={{ padding: '12px 8px' }}>BB/TB</th>
                      <th style={{ padding: '12px 8px' }}>Z-Score (HAZ)</th>
                      <th style={{ padding: '12px 8px' }}>Status Tinggi (WHO)</th>
                      <th style={{ padding: '12px 8px' }}>Status Gizi (WHO)</th>
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
                              className="btn"
                              onClick={() => {
                                setPredictionResult(res);
                                setTimeout(() => {
                                  document.getElementById('prediction-result-section')?.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                              }}
                              style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
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
      )}

      {/* Main Single prediction Result output view */}
      {predictionResult && (
        <div id="prediction-result-section" style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '2px dashed var(--border-color)' }}>
          <ResultView data={predictionResult} onNavigate={onNavigate} />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
