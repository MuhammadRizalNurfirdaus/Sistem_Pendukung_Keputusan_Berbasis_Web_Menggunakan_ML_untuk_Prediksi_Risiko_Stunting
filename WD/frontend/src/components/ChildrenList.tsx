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

interface ChildrenListProps {
  onNavigate: (page: string, data?: any) => void;
  apiUrl: string;
}

export const ChildrenList: React.FC<ChildrenListProps> = ({ onNavigate, apiUrl }) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Add child form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildGender, setNewChildGender] = useState<'L' | 'P'>('L');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState<Child | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getUserId = () => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored).id : '';
    } catch {
      return '';
    }
  };

  const fetchChildrenList = async () => {
    const userId = getUserId();
    if (!userId) {
      setError('User tidak terautentikasi.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/children?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setChildren(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Gagal mengambil data balita.');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi saat memuat data balita.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildrenList();
  }, [apiUrl]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const nameClean = newChildName.trim();
    if (!nameClean) {
      setModalError('Nama lengkap balita harus diisi.');
      return;
    }

    const userId = getUserId();
    if (!userId) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/api/children`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          nama: nameClean,
          jenisKelamin: newChildGender
        })
      });

      if (res.ok) {
        setNewChildName('');
        setNewChildGender('L');
        setShowAddModal(false);
        await fetchChildrenList();
      } else {
        const errData = await res.json().catch(() => ({}));
        setModalError(errData.error || 'Gagal menyimpan data balita.');
      }
    } catch (err) {
      console.error(err);
      setModalError('Koneksi bermasalah. Gagal mendaftarkan balita.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!childToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`${apiUrl}/api/children/${childToDelete.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setChildToDelete(null);
        await fetchChildrenList();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Gagal menghapus data balita.');
      }
    } catch (err) {
      console.error(err);
      alert('Koneksi bermasalah. Gagal menghapus balita.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter list based on search query
  const filteredChildren = children.filter(c => 
    c.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Daftar Balita Posyandu 👶
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Kelola data master balita Posyandu sebelum melakukan pemeriksaan tumbuh kembang.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/>
          </svg>
          Daftarkan Balita Baru
        </button>
      </div>

      {/* Search and stats bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="Cari nama balita..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>

        {/* Stats */}
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          Menampilkan {filteredChildren.length} dari {children.length} Balita
        </div>
      </div>

      {/* Main Table Glass Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '200px' }}>
        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Memuat daftar balita...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--accent-coral)' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <p style={{ fontWeight: 600, marginTop: '8px' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchChildrenList} style={{ marginTop: '1rem' }}>Coba Lagi</button>
          </div>
        ) : filteredChildren.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '3rem' }}>🌱</span>
            <p style={{ fontWeight: 600, marginTop: '12px' }}>
              {searchQuery ? 'Tidak ada balita yang cocok dengan pencarian Anda.' : 'Belum ada balita terdaftar. Silakan daftarkan balita Posyandu pertama Anda.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={thStyle}>Nama Balita</th>
                  <th style={thStyle}>L/P</th>
                  <th style={thStyle}>Tanggal Terdaftar</th>
                  <th style={thStyle}>Jml Periksa</th>
                  <th style={thStyle}>Umur Terakhir</th>
                  <th style={thStyle}>Status Terakhir</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredChildren.map(c => {
                  const latest = c.latestMeasurement;
                  const isStunt = latest ? latest.status === 1 : false;

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color var(--transition-fast)' }} className="history-row">
                      <td style={{ padding: '14px 8px', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem' }}>{c.jenisKelamin === 'L' ? '👦' : '👧'}</span>
                          {c.nama}
                        </div>
                      </td>
                      <td style={{ padding: '14px 8px', fontWeight: 600, color: c.jenisKelamin === 'L' ? 'var(--accent-blue)' : 'var(--accent-coral)' }}>
                        {c.jenisKelamin}
                      </td>
                      <td style={{ padding: '14px 8px', color: 'var(--text-secondary)' }}>
                        {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 8px', fontWeight: 700, textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: 'var(--bg-primary)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}>
                          {c.measurementCount}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {latest ? `${latest.umur} Bulan` : '-'}
                      </td>
                      <td style={{ padding: '14px 8px' }}>
                        {latest ? (
                          <span style={{
                            display: 'inline-flex',
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: isStunt ? 'var(--accent-coral-bg)' : 'var(--accent-green-bg)',
                            color: isStunt ? 'var(--accent-coral)' : 'var(--accent-green)'
                          }}>
                            {latest.stuntingLabel === 'Normal' ? 'Normal' : 'Stunting'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Belum diperiksa</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => onNavigate('input', { id: c.id, nama: c.nama, jenisKelamin: c.jenisKelamin })}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            ➕ Periksa
                          </button>
                          {c.measurementCount > 0 && latest && (
                            <button
                              onClick={() => onNavigate('dashboard', latest)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700 }}
                            >
                              Detail
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setChildToDelete(c);
                              setShowDeleteModal(true);
                            }}
                            className="btn"
                            style={{
                              padding: '6px 12px',
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
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Toddler Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Daftarkan Balita Baru</h3>
              <button 
                onClick={() => { setShowAddModal(false); setModalError(null); setNewChildName(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>

            {modalError && (
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--accent-coral-bg)', color: 'var(--accent-coral)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
                ⚠️ {modalError}
              </div>
            )}

            <form onSubmit={handleAddChild} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-child-name">Nama Lengkap Balita</label>
                <input
                  id="new-child-name"
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Alesha Putri"
                  value={newChildName}
                  onChange={e => setNewChildName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <div className="gender-switch" style={{ margin: 0 }}>
                  <div
                    className={`gender-option ${newChildGender === 'L' ? 'selected' : ''}`}
                    onClick={() => setNewChildGender('L')}
                    style={{ padding: '10px' }}
                  >
                    👦 Laki-laki
                  </div>
                  <div
                    className={`gender-option ${newChildGender === 'P' ? 'selected' : ''}`}
                    onClick={() => setNewChildGender('P')}
                    style={{ padding: '10px' }}
                  >
                    👧 Perempuan
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowAddModal(false); setModalError(null); setNewChildName(''); }}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ minWidth: '120px' }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Balita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && childToDelete && (
        <div style={modalOverlayStyle}>
          <div className="glass-panel" style={{ ...modalContentStyle, maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-full)', background: 'var(--accent-coral-bg)', color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                ⚠️
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Hapus Balita?</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tindakan ini permanen</span>
              </div>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Apakah Anda yakin ingin menghapus data balita <strong>{childToDelete.nama}</strong>? Seluruh riwayat pemeriksaan ({childToDelete.measurementCount} riwayat) juga akan ikut terhapus dari sistem.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowDeleteModal(false); setChildToDelete(null); }}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteChild}
                className="btn"
                style={{
                  background: 'var(--accent-coral)',
                  color: '#ffffff',
                  fontWeight: 700
                }}
                disabled={deleting}
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus Semua'}
              </button>
            </div>
          </div>
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

const thStyle: React.CSSProperties = {
  padding: '12px 8px',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  fontWeight: 600
};

const modalOverlayStyle: React.CSSProperties = {
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
};

const modalContentStyle: React.CSSProperties = {
  width: '90%',
  maxWidth: '450px',
  padding: '2rem',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-lg)'
};
