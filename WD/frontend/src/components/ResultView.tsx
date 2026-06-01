import React from 'react';

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
  createdAt: string;
}

interface ResultViewProps {
  data: Prediction | null;
  onNavigate: (page: string, data?: any) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, onNavigate }) => {
  if (!data) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Belum Ada Hasil</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Silakan input data balita terlebih dahulu.</p>
        <button className="btn btn-primary" onClick={() => onNavigate('input')}>Input Data Balita</button>
      </div>
    );
  }

  const isStunting = data.status === 1;
  const isSevere = (data.severity ?? 0) >= 2;
  const pct = Math.round(data.probability * 100);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (data.probability * circumference);
  const zScore = data.zScore ?? 0;

  // BMI calculation for Nutritional Status
  const hM = data.tbAkhir / 100;
  const bmi = hM > 0 ? (data.bbAkhir / (hM * hM)) : 0;
  const nutStatus = data.nutritionalStatus ?? 0;
  const nutLabel = data.nutritionalLabel ?? "Normal (Gizi Baik)";

  // Dynamic styling based on nutritional status
  let nutBadgeColor = 'var(--accent-green)';
  let nutBgColor = 'var(--accent-green-bg)';
  let nutBorderColor = 'var(--accent-green)';
  let nutText = '';

  if (nutStatus === 2) { // Obesitas
    nutBadgeColor = 'var(--accent-coral)';
    nutBgColor = 'var(--accent-coral-bg)';
    nutBorderColor = 'var(--accent-coral)';
    nutText = `Berdasarkan rasio berat terhadap tinggi badan (BMI: ${bmi.toFixed(1)}), berat badan anak (${data.bbAkhir} kg) tergolong sangat berlebih (obesitas) dibanding tinggi badannya yang ${data.tbAkhir} cm. Disarankan untuk membatasi asupan manis/berlemak dan mengonsultasikan menu gizi anak dengan dokter spesialis anak.`;
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
    <div className="fade-in" style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Hasil Analisis Stunting & Gizi</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Hasil deteksi risiko stunting dan gizi untuk <strong>{data.nama}</strong>, usia {data.umur} bulan.
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
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Probabilitas</div>
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
            {isSevere ? (
              <>Berdasarkan perhitungan <strong>Z-Score WHO</strong>, tinggi badan <strong>{data.nama}</strong> berada <strong>di bawah -3 SD</strong> (Z-Score: {zScore}). Anak tergolong <strong>sangat pendek (severely stunted)</strong>. Segera konsultasikan ke dokter anak atau puskesmas terdekat untuk penanganan gizi intensif.</>
            ) : isStunting ? (
              <>Berdasarkan perhitungan <strong>Z-Score WHO</strong>, tinggi badan <strong>{data.nama}</strong> berada <strong>di bawah -2 SD</strong> (Z-Score: {zScore}). Anak tergolong <strong>pendek (stunted)</strong>. Tingkatkan asupan protein hewani dan konsultasikan ke petugas Posyandu atau dokter anak terdekat.</>
            ) : (
              <>Kabar baik! Berdasarkan perhitungan <strong>Z-Score WHO</strong> (Z-Score: {zScore}), pertumbuhan <strong>{data.nama}</strong> berada dalam kurva <strong>normal WHO</strong> (≥ -2 SD). Terus pantau dan pertahankan pola makan bergizi seimbang.</>
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
        <DetailCard label="Nama Balita" value={data.nama} icon="👶" />
        <DetailCard label="Umur" value={`${data.umur} Bulan`} icon="📅" />
        <DetailCard label="Jenis Kelamin" value={data.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} icon={data.jenisKelamin === 'L' ? '👦' : '👧'} />
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
                <td style={tdStyle}>{data.bbAkhir} kg</td>
              </tr>
              <tr style={trStyle}>
                <td style={tdStyle}><strong>Tinggi Badan</strong></td>
                <td style={tdStyle}>{data.tbAkhir} cm</td>
              </tr>
              {data.lingkarKepala ? (
              <tr style={trStyle}>
                <td style={tdStyle}><strong>Lingkar Kepala</strong></td>
                <td style={tdStyle}>{data.lingkarKepala} cm</td>
              </tr>
              ) : null}
              {data.lingkarLengan ? (
              <tr style={trStyle}>
                <td style={tdStyle}><strong>Lingkar Lengan</strong></td>
                <td style={tdStyle}>{data.lingkarLengan} cm</td>
              </tr>
              ) : null}
              <tr style={trStyle}>
                <td style={tdStyle}><strong>Rasio BB/TB</strong></td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{data.rasioBBTBAkhir}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* WHO Z-Score Analysis Card */}
      {data.zScore !== undefined && (
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Analisis Z-Score WHO (Height-for-Age)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Z-Score (HAZ)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)' }}>{zScore}</div>
          </div>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Median WHO</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{data.medianWHO} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>cm</span></div>
          </div>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Batas -2 SD</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-coral)' }}>{data.minus2SD} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>cm</span></div>
          </div>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Batas -3 SD</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c62828' }}>{data.minus3SD} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>cm</span></div>
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
