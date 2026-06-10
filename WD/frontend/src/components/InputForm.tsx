import React, { useState } from 'react';
import { ResultView } from './ResultView';

interface InputFormProps {
  onNavigate: (page: string, data?: any) => void;
  apiUrl: string;
  initialData?: any;
}

export const InputForm: React.FC<InputFormProps> = ({ onNavigate, apiUrl, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(initialData || null);
  
  // Form State
  const [formData, setFormData] = useState({
    nama: initialData?.nama || '',
    umur: initialData?.umur?.toString() || '',
    jenisKelamin: initialData?.jenisKelamin || 'L' as 'L' | 'P',
    berat: initialData?.bbAkhir?.toString() || initialData?.berat?.toString() || '',
    tinggi: initialData?.tbAkhir?.toString() || initialData?.tinggi?.toString() || ''
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  
  // Sync state if initialData changes
  React.useEffect(() => {
    if (initialData) {
      setPredictionResult(initialData);
      setFormData({
        nama: initialData.nama || '',
        umur: initialData.umur?.toString() || '',
        jenisKelamin: initialData.jenisKelamin || 'L',
        berat: initialData.bbAkhir?.toString() || initialData.berat?.toString() || '',
        tinggi: initialData.tbAkhir?.toString() || initialData.tinggi?.toString() || ''
      });
      // Scroll to result section after rendering
      setTimeout(() => {
        document.getElementById('prediction-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // Clear if navigating to empty input
      setPredictionResult(null);
      setFormData({
        nama: '',
        umur: '',
        jenisKelamin: 'L',
        berat: '',
        tinggi: ''
      });
    }
  }, [initialData]);

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
    } else if (!/^[a-zA-Z\s'.]+$/.test(formData.nama.trim())) {
      errors.nama = 'Nama balita hanya boleh berisi huruf (tidak boleh angka atau simbol).';
    }

    const umurVal = parseFloat(formData.umur);
    if (isNaN(umurVal) || umurVal < 0 || umurVal > 60) {
      errors.umur = 'Umur tidak valid. Standar WHO adalah 0 - 60 bulan.';
    }

    const beratVal = parseFloat(formData.berat);
    if (isNaN(beratVal) || beratVal < 1.5 || beratVal > 40) {
      errors.berat = 'Berat badan di luar batas biologis (1.5 - 40 kg).';
    }

    const tinggiVal = parseFloat(formData.tinggi);
    if (isNaN(tinggiVal) || tinggiVal < 35 || tinggiVal > 130) {
      errors.tinggi = 'Tinggi badan di luar batas biologis (35 - 130 cm).';
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
      const payload: any = {
        nama: formData.nama,
        umur: parseFloat(formData.umur),
        jenisKelamin: formData.jenisKelamin,
        berat: parseFloat(formData.berat),
        tinggi: parseFloat(formData.tinggi),
      };

      const res = await fetch(`${apiUrl}/api/predict/calculate`, {
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

  return (
    <div className="fade-in" style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Kalkulator Pertumbuhan Balita</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Deteksi dini status stunting dan gizi balita menggunakan standar WHO.</p>
        </div>
      </div>

      {/* Hint Box — informasi navigasi untuk pengguna */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(91, 164, 230, 0.06)',
        border: '1px solid rgba(91, 164, 230, 0.12)',
        marginBottom: '2rem'
      }}>
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--accent-blue)' }}>Petunjuk:</strong> Kalkulator ini dirancang untuk pengecekan stunting <strong>satu anak</strong> secara cepat.
          Jika Anda adalah Kader Posyandu yang ingin menganalisis puluhan anak sekaligus menggunakan format Excel, silakan buka menu{' '}
          <span
            style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
            onClick={() => onNavigate('predictions')}
          >
            📊 Analisis Kolektif
          </span>{' '}
          di bilah navigasi.
        </p>
      </div>

      {/* Mandiri Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>

          {/* Section: Identitas Anak */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Identitas Anak
          </h3>

          <div className="form-group">
            <label htmlFor="input-nama" className="form-label">Nama Lengkap Balita</label>
            <input 
              id="input-nama" 
              type="text" 
              className="form-input" 
              placeholder="Contoh: Leo Kurniawan" 
              value={formData.nama} 
              onChange={e => handleChange('nama', e.target.value)} 
              required 
            />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
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

      {/* Main Single prediction Result output view */}
      {predictionResult && (
        <div id="prediction-result-section" style={{ marginTop: '3rem', paddingTop: '3rem', borderTop: '2px dashed var(--border-color)' }}>
          <ResultView data={predictionResult} onNavigate={onNavigate} apiUrl={apiUrl} hideCollective={true} />
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
