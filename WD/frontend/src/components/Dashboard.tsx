import React, { useState, useEffect } from 'react';

interface Child {
  id: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  createdAt: string;
  measurementCount: number;
  latestMeasurement: {
    id: string;
    umur: number;
    bbAkhir: number;
    tbAkhir: number;
    stuntingLabel: string;
    status: number;
    probability: number;
    createdAt: string;
  } | null;
}

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void;
  apiUrl: string;
}

const WHO_REFERENCE_DATA = [
  { umur: 0, tbL: '46.1 cm', tbP: '45.4 cm', bbL: '2.5 kg', bbP: '2.4 kg' },
  { umur: 6, tbL: '63.3 cm', tbP: '61.2 cm', bbL: '6.4 kg', bbP: '5.7 kg' },
  { umur: 12, tbL: '71.0 cm', tbP: '68.9 cm', bbL: '7.9 kg', bbP: '7.0 kg' },
  { umur: 24, tbL: '81.0 cm', tbP: '80.0 cm', bbL: '10.2 kg', bbP: '9.0 kg' },
  { umur: 36, tbL: '88.7 cm', tbP: '87.4 cm', bbL: '11.8 kg', bbP: '11.0 kg' },
  { umur: 48, tbL: '94.9 cm', tbP: '94.1 cm', bbL: '13.0 kg', bbP: '12.3 kg' },
  { umur: 60, tbL: '100.7 cm', tbP: '99.9 cm', bbL: '14.1 kg', bbP: '13.7 kg' },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, apiUrl }) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored).id : '';
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const fetchChildren = async () => {
      const userId = getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/api/children?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setChildren(data);
        }
      } catch (err) {
        console.error('Failed to fetch children:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [apiUrl]);

  // Compute statistics
  const totalChildren = children.length;
  const stuntingCount = children.filter(
    c => c.latestMeasurement?.stuntingLabel === 'Berisiko Stunting'
  ).length;
  const normalCount = children.filter(
    c => c.latestMeasurement && c.latestMeasurement.stuntingLabel !== 'Berisiko Stunting'
  ).length;
  const totalMeasurements = children.reduce((sum, c) => sum + c.measurementCount, 0);

  // Donut chart calculations
  const donutTotal = stuntingCount + normalCount;
  const normalRatio = donutTotal > 0 ? normalCount / donutTotal : 0;
  const stuntingRatio = donutTotal > 0 ? stuntingCount / donutTotal : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const normalArc = normalRatio * circumference;
  const stuntingArc = stuntingRatio * circumference;

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const statCards = [
    { emoji: '👶', label: 'Total Balita', value: totalChildren, color: 'var(--accent-blue)', bg: 'var(--accent-blue-bg)' },
    { emoji: '✅', label: 'Status Normal', value: normalCount, color: 'var(--accent-green)', bg: 'var(--accent-green-bg)' },
    { emoji: '⚠️', label: 'Berisiko Stunting', value: stuntingCount, color: 'var(--accent-coral)', bg: 'var(--accent-coral-bg)' },
    { emoji: '📊', label: 'Total Pemeriksaan', value: totalMeasurements, color: 'var(--accent-blue)', bg: 'var(--accent-blue-bg)' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            {getGreeting()}, Kader! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Ringkasan data balita dan informasi edukasi stunting.
          </p>
        </div>
        <button
          onClick={() => onNavigate('input')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Periksa Balita Baru
        </button>
      </div>

      {/* Stat Cards Grid */}
      {loading ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Memuat data...</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {statCards.map((card, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'center',
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <span style={{ fontSize: '2rem' }}>{card.emoji}</span>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: card.color, lineHeight: 1 }}>
                  {card.value}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {card.label}
                </span>
              </div>
            ))}
          </div>

          {/* Donut Chart + Quick Actions */}
          <div className="dashboard-chart-grid">
            {/* Donut Chart */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, alignSelf: 'flex-start' }}>Rasio Status Balita</h3>
              {donutTotal === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '2.5rem' }}>📋</span>
                  <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>Belum ada data pemeriksaan</p>
                </div>
              ) : (
                <>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    {/* Background circle */}
                    <circle
                      cx="80" cy="80" r={radius}
                      fill="none"
                      stroke="var(--border-color)"
                      strokeWidth="20"
                    />
                    {/* Normal arc */}
                    <circle
                      cx="80" cy="80" r={radius}
                      fill="none"
                      stroke="var(--accent-green)"
                      strokeWidth="20"
                      strokeDasharray={`${normalArc} ${circumference - normalArc}`}
                      strokeDashoffset={circumference * 0.25}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                    {/* Stunting arc */}
                    <circle
                      cx="80" cy="80" r={radius}
                      fill="none"
                      stroke="var(--accent-coral)"
                      strokeWidth="20"
                      strokeDasharray={`${stuntingArc} ${circumference - stuntingArc}`}
                      strokeDashoffset={circumference * 0.25 - normalArc}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                    {/* Center text */}
                    <text x="80" y="75" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text-primary)">
                      {donutTotal}
                    </text>
                    <text x="80" y="95" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-secondary)">
                      Balita Diperiksa
                    </text>
                  </svg>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }}></span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Normal ({normalCount})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-coral)', display: 'inline-block' }}></span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Stunting ({stuntingCount})</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions / Warning Signs */}
            <div className="glass-panel" style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: 'var(--accent-coral-bg)',
              borderColor: 'rgba(231, 111, 81, 0.15)'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Tanda-Tanda Peringatan Stunting
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Tinggi badan anak di bawah standar WHO untuk usianya',
                  'Berat badan tidak naik selama 2 bulan berturut-turut',
                  'Anak mudah sakit dan daya tahan tubuh lemah',
                  'Perkembangan motorik dan kognitif terlambat',
                  'Nafsu makan menurun secara signifikan'
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'var(--accent-coral)',
                      color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 800, flexShrink: 0, marginTop: '1px'
                    }}>
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Educational Content */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📖 Apa Itu Stunting?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <strong>Stunting</strong> adalah kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis, terutama pada 1.000 hari pertama kehidupan. Anak dikatakan stunting jika tinggi badannya berada di bawah <strong>-2 standar deviasi (SD)</strong> dari median standar pertumbuhan WHO. Stunting berdampak pada perkembangan otak, daya tahan tubuh, dan produktivitas di masa depan.
            </p>
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-blue-bg)',
              border: '1px solid rgba(91, 164, 230, 0.12)',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>💡</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--accent-blue)' }}>Tahukah Anda?</strong> Periode emas pencegahan stunting adalah sejak kehamilan hingga anak berusia 2 tahun (1.000 Hari Pertama Kehidupan). Pemberian ASI eksklusif dan MPASI kaya protein hewani sangat penting di periode ini.
              </p>
            </div>
          </div>

          {/* WHO Reference Table */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📏 Standar Tinggi & Berat Badan Normal WHO
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Tabel berikut menunjukkan batas minimal tinggi badan dan berat badan normal berdasarkan standar WHO untuk anak laki-laki (L) dan perempuan (P) pada berbagai usia.
            </p>
            <div className="who-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={thStyle}>Umur (Bulan)</th>
                    <th style={thStyle}>TB Normal Min (L)</th>
                    <th style={thStyle}>TB Normal Min (P)</th>
                    <th style={thStyle}>BB Normal Min (L)</th>
                    <th style={thStyle}>BB Normal Min (P)</th>
                  </tr>
                </thead>
                <tbody>
                  {WHO_REFERENCE_DATA.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }} className="history-row">
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          background: 'var(--accent-blue-bg)',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          color: 'var(--accent-blue)',
                          fontSize: '0.85rem'
                        }}>
                          {row.umur}
                        </span>
                      </td>
                      <td style={tdStyle}>{row.tbL}</td>
                      <td style={tdStyle}>{row.tbP}</td>
                      <td style={tdStyle}>{row.bbL}</td>
                      <td style={tdStyle}>{row.bbP}</td>
                    </tr>
                  ))}
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
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.03em'
};

const tdStyle: React.CSSProperties = {
  padding: '12px 8px',
  fontSize: '0.9rem',
  fontWeight: 600
};