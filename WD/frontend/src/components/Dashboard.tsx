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
  tipe?: string;
  createdAt: string;
}

interface DashboardProps {
  history: Prediction[];
  activeChild: Prediction | null;
  onNavigate: (page: string, data?: any) => void;
  onDeleteHistory: (id: string) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ history, activeChild, onNavigate, onDeleteHistory }) => {
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = React.useState<string | null>(null);
  const [selectedNameToDelete, setSelectedNameToDelete] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Use activeChild if available, otherwise fallback to latest in history or a default template
  const defaultLeo: Prediction = {
    id: 'default-leo',
    nama: 'Leo Kurniawan',
    umur: 24,
    jenisKelamin: 'L',
    bbAwal: 9.0,
    tbAwal: 80.0,
    bbAkhir: 9.6,
    tbAkhir: 84.5,
    lamaPantau: 5,
    kecepatanBB: 0.15,
    kecepatanTB: 1.125,
    rasioBBTBAkhir: 0.114,
    status: 0, // Normal
    probability: 0.12,
    createdAt: new Date().toISOString()
  };

  const child = activeChild || (history.length > 0 ? history[0] : defaultLeo);
  const isStunting = child.status === 1;

  // Render Growth Chart SVG
  // Let's generate a beautiful customized path for baby height
  const months = ['12 Bln', '15 Bln', '18 Bln', '21 Bln', '24 Bln'];
  
  // Heights for standard normal curve vs this baby
  const babyHeights = [
    child.tbAwal,
    child.tbAwal + (child.tbAkhir - child.tbAwal) * 0.25,
    child.tbAwal + (child.tbAkhir - child.tbAwal) * 0.5,
    child.tbAwal + (child.tbAkhir - child.tbAwal) * 0.75,
    child.tbAkhir
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
            Selamat Pagi, Bunda! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Berikut adalah rangkuman tumbuh kembang si kecil secara dinamis.
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

      {/* Grid Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* Child Info Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: child.jenisKelamin === 'L' ? 'rgba(91, 164, 230, 0.15)' : 'rgba(231, 111, 81, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: child.jenisKelamin === 'L' ? 'var(--accent-blue)' : 'var(--accent-coral)'
          }}>
            {child.nama ? child.nama.charAt(0).toUpperCase() : 'B'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.15rem' }}>{child.nama}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
              <span>{child.umur} Bulan</span>
              <span>•</span>
              <span>{child.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
            </p>
          </div>
        </div>

        {/* Height Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tinggi Badan</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{child.tbAkhir}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>cm</span>
          </div>
        </div>

        {/* Weight Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Berat Badan</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800 }}>{child.bbAkhir}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>kg</span>
          </div>
        </div>

        {/* Status Card */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderLeft: `5px solid ${isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'}`
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kondisi Nutrisi</span>
          <div style={{ margin: '0.5rem 0' }}>
            <span style={{
              display: 'inline-flex',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '1rem',
              fontWeight: 800,
              background: isStunting ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
              color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'
            }}>
              {isStunting ? 'RISIKO STUNTING' : 'NORMAL (SEHAT)'}
            </span>
          </div>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Probabilitas: {(child.probability * 100).toFixed(0)}%
          </span>
        </div>

      </div>

      {/* Main Analytics Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* Interactive Curve Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Kurva Tumbuh Kembang Si Kecil</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Membandingkan tinggi badan anak ({child.nama}) dengan standar normal WHO (Z-Score Normal).
            </p>
          </div>

          {/* SVG Custom Premium Chart */}
          <div style={{ position: 'relative', width: '100%', height: '240px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '1rem 2rem 2.5rem 2.5rem' }}>
            <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" style={{ overflow: 'hidden' }}>
              {/* Grid Lines */}
              <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />

              {/* WHO Normal Reference Area (Green Zone) */}
              {/* Drawn as a filled polygon between normal line and some bottom bounds */}
              <polygon
                points="0,170 100,150 200,130 300,110 400,90 400,200 0,200"
                fill="rgba(118, 200, 147, 0.08)"
              />
              {/* WHO Standard Line */}
              <path
                d="M 0,170 Q 100,150 200,130 T 400,90"
                fill="none"
                stroke="var(--accent-green)"
                strokeWidth="3"
                strokeDasharray="4"
              />

              {/* Baby Height Line */}
              {/* Adjust Y dynamically based on heights scaled dynamically */}
              {(() => {
                const validHeights = babyHeights.filter(h => typeof h === 'number' && !isNaN(h));
                const minH = Math.min(50, validHeights.length > 0 ? Math.min(...validHeights) - 5 : 50);
                const maxH = Math.max(110, validHeights.length > 0 ? Math.max(...validHeights) + 5 : 110);

                const scaleHeight = (h: number) => {
                  return 200 - ((h - minH) / (maxH - minH)) * 200;
                };

                const points = babyHeights.map((h, i) => `${i * 100},${scaleHeight(h)}`).join(' ');
                
                return (
                  <>
                    <path
                      d={`M ${points}`}
                      fill="none"
                      stroke="var(--accent-blue)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    {/* Data Nodes */}
                    {babyHeights.map((h, i) => (
                      <g key={i} style={{ cursor: 'pointer' }}>
                        <circle
                          cx={i * 100}
                          cy={scaleHeight(h)}
                          r="6"
                          fill="var(--bg-secondary)"
                          stroke="var(--accent-blue)"
                          strokeWidth="3"
                        />
                        <text
                          x={i * 100}
                          y={scaleHeight(h) - 12}
                          fontSize="8"
                          fontWeight="700"
                          textAnchor="middle"
                          fill="var(--text-primary)"
                        >
                          {h.toFixed(1)} cm
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* X Axis Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: '8px', left: '2.25rem', right: '1.75rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {months.map((m, i) => <span key={i}>{m}</span>)}
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', position: 'absolute', top: '12px', right: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '3px', background: 'var(--accent-green)', display: 'inline-block' }}></span> Standar WHO
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '3px', background: 'var(--accent-blue)', display: 'inline-block' }}></span> {child.nama}
              </span>
            </div>
          </div>
        </div>

        {/* Growth Velocity & Warning Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Warning Box Placeholder for Spacing or Removed if preferred - we can just keep the action box below */}

          {/* Action / Warning Box */}
          <div className="glass-panel" style={{
            padding: '1.5rem',
            background: isStunting ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
            borderColor: isStunting ? 'rgba(231, 111, 81, 0.15)' : 'rgba(118, 200, 147, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            justifyContent: 'center'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isStunting ? (
                  <>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </>
                ) : (
                  <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </>
                )}
              </svg>
              {isStunting ? 'Peringatan Dini Gagal Tumbuh' : 'Tumbuh Kembang Optimal'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
              {isStunting ? (
                'Tinggi badan anak terindikasi tertinggal di bawah kurva standar normal WHO. Segera lakukan pencegahan dengan meningkatkan asupan zat gizi protein hewani tinggi dan konsultasikan ke posyandu terdekat.'
              ) : (
                'Hebat! Tumbuh kembang anak berada di kurva hijau standard WHO. Pertahankan pola pemberian makan gizi seimbang dan penuhi asupan protein hewani harian.'
              )}
            </p>
            <button 
              onClick={() => onNavigate('education')}
              className="btn btn-outline" 
              style={{
                alignSelf: 'flex-start',
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderColor: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)',
                color: isStunting ? 'var(--accent-coral)' : 'var(--accent-green)'
              }}
            >
              Baca Tips Nutrisi
            </button>
          </div>

        </div>

      </div>

      {/* History table / Recent checks list */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Riwayat Pemeriksaan Terakhir</h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>Belum ada riwayat pemeriksaan. Silakan tambahkan data balita baru.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nama Balita</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Umur</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tinggi Badan</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status Deteksi</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Probabilitas</th>
                  <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color var(--transition-fast)' }} className="history-row">
                    <td style={{ padding: '14px 8px', fontWeight: 600 }}>{h.nama}</td>
                    <td style={{ padding: '14px 8px' }}>{h.umur} Bulan</td>
                    <td style={{ padding: '14px 8px' }}>{h.tbAkhir} cm</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: h.status === 1 ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
                        color: h.status === 1 ? 'var(--accent-coral)' : 'var(--accent-green)'
                      }}>
                        {h.status === 1 ? 'Risiko Stunting' : 'Normal'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>{(h.probability * 100).toFixed(0)}%</td>
                    <td style={{ padding: '14px 8px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button 
                        onClick={() => {
                          if (h.tipe === 'kolektif') {
                            onNavigate('predictions', h);
                          } else {
                            onNavigate('input', h);
                          }
                        }}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        Detail
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedIdToDelete(h.id);
                          setSelectedNameToDelete(h.nama);
                          setShowConfirmModal(true);
                        }}
                        className="btn" 
                        style={{ 
                          padding: '6px 14px', 
                          fontSize: '0.8rem', 
                          fontWeight: 700,
                          background: 'var(--accent-coral-bg)',
                          color: 'var(--accent-coral)',
                          border: '1px solid rgba(231, 111, 81, 0.15)',
                          transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--accent-coral)';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.borderColor = 'var(--accent-coral)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--accent-coral-bg)';
                          e.currentTarget.style.color = 'var(--accent-coral)';
                          e.currentTarget.style.borderColor = 'rgba(231, 111, 81, 0.15)';
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(9, 12, 19, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn var(--transition-fast)'
        }}>
          <div 
            className="glass-panel" 
            style={{
              width: '90%',
              maxWidth: '420px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'scaleIn var(--transition-fast)'
            }}
          >
            {/* Modal Icon & Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-coral-bg)',
                color: 'var(--accent-coral)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0
              }}>
                ⚠️
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Hapus Riwayat?
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tindakan ini tidak dapat dibatalkan</span>
              </div>
            </div>

            {/* Modal Body */}
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Apakah Bunda yakin ingin menghapus data riwayat pemeriksaan untuk <strong>{selectedNameToDelete}</strong>? Data ini akan terhapus secara permanen dari sistem.
            </p>

            {/* Modal Footer / Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedIdToDelete(null);
                  setSelectedNameToDelete(null);
                }}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                disabled={isDeleting}
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  if (selectedIdToDelete) {
                    setIsDeleting(true);
                    try {
                      await onDeleteHistory(selectedIdToDelete);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsDeleting(false);
                      setShowConfirmModal(false);
                      setSelectedIdToDelete(null);
                      setSelectedNameToDelete(null);
                    }
                  }
                }}
                className="btn"
                style={{ 
                  padding: '10px 18px', 
                  fontSize: '0.9rem',
                  background: 'var(--accent-coral)',
                  color: '#ffffff',
                  fontWeight: 700,
                  transition: 'all var(--transition-fast)'
                }}
                disabled={isDeleting}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-coral-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent-coral)';
                }}
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
