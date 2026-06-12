import React, { useEffect, useState } from 'react';

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  readTime: string;
  image: string;
}

interface EducationProps {
  apiUrl: string;
  onNavigate: (page: string) => void;
}

export const Education: React.FC<EducationProps> = ({ apiUrl, onNavigate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/education`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data);
        }
      } catch (err) {
        console.error('Failed to fetch education data:', err);
        // Fallback articles
        setArticles([
          {
            id: '1',
            title: 'Mengenal Stunting dan Pencegahannya sejak 1000 HPK',
            category: 'Dasar Kesehatan',
            summary: 'Stunting adalah gangguan pertumbuhan kronis pada anak. Pencegahan paling efektif harus dimulai sejak 1000 Hari Pertama Kehidupan (HPK).',
            content: 'Stunting ditandai dengan tinggi badan anak yang berada di bawah standar pertumbuhan WHO untuk usianya akibat kekurangan gizi kronis, infeksi berulang, dan stimulasi psikososial yang kurang.',
            author: 'Kementerian Kesehatan RI',
            readTime: '5 menit',
            image: ''
          },
          {
            id: '2',
            title: 'Peran Protein Hewani sebagai Booster Tinggi Badan Anak',
            category: 'Nutrisi & Gizi',
            summary: 'Mengapa telur, susu, dan ikan sangat efektif mencegah stunting?',
            content: 'Protein hewani mengandung asam amino esensial lengkap dan rasio kecernaan yang tinggi.',
            author: 'PERSAGI',
            readTime: '4 menit',
            image: ''
          },
          {
            id: '3',
            title: 'Panduan Standard WHO untuk Pengukuran Tinggi Badan Balita di Rumah',
            category: 'Pedoman Pengukuran',
            summary: 'Pengukuran tinggi yang salah menyebabkan hasil deteksi bias.',
            content: 'Untuk anak usia di bawah 2 tahun, pengukuran dilakukan dengan cara berbaring.',
            author: 'World Health Organization (WHO)',
            readTime: '6 menit',
            image: ''
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [apiUrl]);

  const categoryColors: Record<string, string> = {
    'Dasar Kesehatan': 'var(--accent-blue)',
    'Nutrisi & Gizi': 'var(--accent-green)',
    'Pedoman Pengukuran': 'var(--accent-coral)',
  };

  // Measurement steps data for the interactive guide section
  const measurementSteps = [
    { step: 1, title: 'Persiapan Alat', desc: 'Siapkan microtoise (staturemeter) atau papan ukur (length board) untuk balita di bawah 2 tahun. Pastikan alat terkalibrasi.', icon: '📏' },
    { step: 2, title: 'Lepas Perlengkapan', desc: 'Lepaskan sepatu, kaus kaki tebal, topi, kuncir rambut tebal, dan popok tebal agar hasil akurat.', icon: '👟' },
    { step: 3, title: 'Posisikan Anak', desc: 'Anak > 2 tahun: berdiri tegak, 5 titik menempel dinding (kepala, punggung, pantat, betis, tumit). Anak < 2 tahun: berbaring di papan ukur.', icon: '🧒' },
    { step: 4, title: 'Pandangan Lurus', desc: 'Pastikan mata anak menatap lurus ke depan (Frankfort Plane), telinga dan mata sejajar horizontal.', icon: '👁️' },
    { step: 5, title: 'Catat Hasil', desc: 'Turunkan batas ukur perlahan hingga menyentuh puncak kepala anak. Catat angka dengan ketelitian 0,1 cm.', icon: '📝' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>Edukasi & Tips Nutrisi</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Pelajari cara mencegah stunting dan memastikan tumbuh kembang anak optimal berdasarkan pedoman WHO.
        </p>
      </div>

      {/* Quick Tips Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, var(--accent-blue-bg), var(--accent-green-bg))',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '3rem' }}>🥚🐟🥛</div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>3 Superfood Pencegah Stunting</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            <strong>Telur</strong> (1 butir/hari), <strong>Ikan Laut</strong> (kembung, lele, gabus), dan <strong>Susu</strong> adalah sumber protein hewani
            dengan kandungan asam amino esensial tertinggi yang terbukti secara klinis merangsang hormon pertumbuhan IGF-1.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="pulse" style={{ fontSize: '2rem' }}>⏳</div>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Memuat artikel edukasi...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {articles.map(article => {
            const isExpanded = expandedId === article.id;
            const catColor = categoryColors[article.category] || 'var(--accent-blue)';

            return (
              <div key={article.id} className="glass-panel" style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)'
              }}
                onClick={() => setExpandedId(isExpanded ? null : article.id)}
              >
                {/* Article Image */}
                {article.image && (
                  <div style={{
                    width: '100%',
                    height: '180px',
                    background: `url(${article.image}) center/cover no-repeat`,
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0'
                  }} />
                )}

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {/* Category Badge */}
                  <span style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: `${catColor}15`,
                    color: catColor
                  }}>
                    {article.category}
                  </span>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.35 }}>{article.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{article.summary}</p>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="fade-in" style={{
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '1rem',
                      marginTop: '0.5rem'
                    }}>
                      <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{article.content}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{article.author}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🕐 {article.readTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive: Measurement Steps */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📏 Panduan Mengukur Tinggi Badan Balita di Rumah
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Ikuti 5 langkah berikut sesuai standar WHO untuk mendapatkan hasil pengukuran presisi tinggi.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {measurementSteps.map(s => (
            <div key={s.step} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.25rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              transition: 'transform var(--transition-fast)',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-blue-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '2px' }}>Langkah {s.step}</div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>{s.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="action-buttons" style={{ justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={() => onNavigate('dashboard')}>← Kembali ke Dashboard</button>
        <button className="btn btn-primary" onClick={() => onNavigate('input')}>🩺 Periksa Balita Sekarang</button>
      </div>
    </div>
  );
};
