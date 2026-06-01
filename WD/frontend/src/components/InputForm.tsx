import React, { useState } from 'react';
import { ResultView } from './ResultView';

interface InputFormProps {
  onNavigate: (page: string, data?: any) => void;
  apiUrl: string;
}

export const InputForm: React.FC<InputFormProps> = ({ onNavigate, apiUrl }) => {
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
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

  return (
    <div className="fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Input Data Balita</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Masukkan data pengukuran fisik anak untuk deteksi risiko stunting.</p>
        </div>
      </div>

      {/* Form Card */}
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
