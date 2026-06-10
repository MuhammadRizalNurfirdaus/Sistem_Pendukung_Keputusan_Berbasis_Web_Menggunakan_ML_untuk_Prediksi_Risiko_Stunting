import React, { useState, useEffect } from 'react';
import { GrowthBarChart } from './GrowthBarChart';

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
  zScore?: number;
  medianWho?: number;
  stuntingLabel?: string;
  status: number;
  probability: number;
  tipe?: string;
  createdAt: string;
}

interface ChildDetailProps {
  childId: string;
  childName: string;
  childGender: 'L' | 'P';
  onNavigate: (page: string, data?: any) => void;
  apiUrl: string;
}

export const ChildDetail: React.FC<ChildDetailProps> = ({ childId, childName, childGender, onNavigate, apiUrl }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserId = () => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored).id : '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = getUserId();
      if (!userId) {
        setError('User tidak terautentikasi.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/history?user_id=${userId}&child_id=${childId}`);
        if (res.ok) {
          const data = await res.json();
          setPredictions(data);
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || 'Gagal mengambil riwayat pemeriksaan.');
        }
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan koneksi saat memuat riwayat.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [apiUrl, childId]);

  // Sort by umur ascending for the history table
  const sortedByAge = [...predictions].sort((a, b) => a.umur - b.umur);

  // Latest prediction (most recent by createdAt)
  const latest = predictions.length > 0
    ? predictions.reduce((prev, curr) => new Date(curr.createdAt) > new Date(prev.createdAt) ? curr : prev)
    : null;

  // Oldest prediction (earliest by createdAt)
  const oldest = predictions.length > 0
    ? predictions.reduce((prev, curr) => new Date(curr.createdAt) < new Date(prev.createdAt) ? curr : prev)
    : null;

  const isStunting = latest ? latest.status === 1 : false;

  // Build chart child data
  const chartChild = latest && oldest ? {
    nama: childName,
    umur: latest.umur,
    jenisKelamin: childGender,
    tbAwal: predictions.length > 1 ? oldest.tbAkhir : latest.tbAkhir,
    tbAkhir: latest.tbAkhir,
    lamaPantau: predictions.length > 1 ? latest.umur - oldest.umur : 0
  } : null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header with back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onNavigate('children')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700 }}
        >
          ← Kembali ke Data Balita
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            {childName}
          </h1>
          <span style={{
            display: 'inline-flex',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: childGender === 'L' ? 'var(--accent-blue-bg)' : 'var(--accent-coral-bg)',
            color: childGender === 'L' ? 'var(--accent-blue)' : 'var(--accent-coral)'
          }}>
            {childGender === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Memuat riwayat pemeriksaan...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--accent-coral)' }}>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
          <p style={{ fontWeight: 600, marginTop: '8px' }}>{error}</p>
        </div>
      ) : predictions.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem' }}>📋</span>
          <p style={{ fontWeight: 600, marginTop: '12px', fontSize: '1rem' }}>Belum ada riwayat pemeriksaan untuk {childName}.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px', color: 'var(--text-secondary)' }}>
            Silakan lakukan pemeriksaan terlebih dahulu melalui halaman Input Data.
          </p>
          <button
            onClick={() => onNavigate('input')}
            className="btn btn-primary"
            style={{ marginTop: '1.5rem' }}
          >
            Periksa Sekarang
          </button>
        </div>
      ) : (
        <>
          {/* Status Card */}
          {latest && (
            <div className="glass-panel" style={{
              padding: '2rem',
              borderLeft: `5px solid ${isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Terkini</span>
                <div style={{ margin: '0.75rem 0' }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    background: isStunting ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
                    color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'
                  }}>
                    {isStunting ? '⚠️ RISIKO STUNTING' : '✅ NORMAL (SEHAT)'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Umur: <strong>{latest.umur} bulan</strong> • TB: <strong>{latest.tbAkhir} cm</strong> • BB: <strong>{latest.bbAkhir} kg</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {latest.zScore !== undefined && (
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Z-Score</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)' }}>
                      {latest.zScore.toFixed(2)}
                    </div>
                  </div>
                )}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Probabilitas</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)' }}>
                    {(latest.probability * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Growth Chart */}
          {chartChild && (
            <GrowthBarChart
              child={chartChild}
              isStunting={isStunting}
              isSimulated={false}
            />
          )}

          {/* History Table */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Riwayat Pemeriksaan</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={thStyle}>No</th>
                    <th style={thStyle}>Tanggal</th>
                    <th style={thStyle}>Umur (Bulan)</th>
                    <th style={thStyle}>BB (kg)</th>
                    <th style={thStyle}>TB (cm)</th>
                    <th style={thStyle}>Z-Score</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedByAge.map((p, idx) => {
                    const isRisk = p.status === 1;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }} className="history-row">
                        <td style={tdStyle}>{idx + 1}</td>
                        <td style={tdStyle}>
                          {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={tdStyle}>{p.umur}</td>
                        <td style={tdStyle}>{p.bbAkhir}</td>
                        <td style={tdStyle}>{p.tbAkhir}</td>
                        <td style={tdStyle}>{p.zScore !== undefined ? p.zScore.toFixed(2) : '-'}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-flex',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isRisk ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
                            color: isRisk ? 'var(--accent-coral)' : 'var(--accent-green)'
                          }}>
                            {isRisk ? 'Risiko Stunting' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
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

const thStyle: React.CSSProperties = {
  padding: '12px 8px',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  fontWeight: 600
};

const tdStyle: React.CSSProperties = {
  padding: '14px 8px',
  fontWeight: 600
};

export default ChildDetail;
