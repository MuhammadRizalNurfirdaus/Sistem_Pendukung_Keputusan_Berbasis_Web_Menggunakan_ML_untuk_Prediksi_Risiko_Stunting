import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { Dashboard } from './components/Dashboard';
import { InputForm } from './components/InputForm';
import { ResultView } from './components/ResultView';
import { Education } from './components/Education';
import { AuthPage } from './components/AuthPage';
import { ChildrenList } from './components/ChildrenList';
import { ChildDetail } from './components/ChildDetail';

const getApiUrl = () => {
  const { hostname } = window.location;

  // 1. Tambahkan kondisi khusus untuk domain Cloudflare Tunnel Anda
  if (hostname === 'stunting.rizalnurfirdaus.tech') {
    return 'https://api-stunting.rizalnurfirdaus.tech';
  }

  // 2. Kondisi untuk VS Code Dev Tunnels (jika masih dipakai pas coding)
  if (hostname.includes('devtunnels.ms')) {
    const backendHostname = hostname.replace(/-5173|-5174|-5175/, '-3010');
    return `https://${backendHostname}`;
  }

  // 3. Fallback default untuk local development biasa
  return 'http://localhost:3010';
};

const API_URL = getApiUrl();

interface AuthUser {
  id: string;
  username: string;
  full_name: string;
  role: string;
}

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

type PageName = 'dashboard' | 'children' | 'input' | 'predictions' | 'education' | 'child-detail';

const navItems: { id: PageName; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
  {
    id: 'children',
    label: 'Data Balita',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    id: 'input',
    label: 'Input Data',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  },
  {
    id: 'predictions',
    label: 'Analisis Kolektif',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  },
  {
    id: 'education',
    label: 'Edukasi & Tips',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  }
];

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [activePage, setActivePage] = useState<PageName>('dashboard');
  const [history, setHistory] = useState<Prediction[]>([]);
  const [activeResult, setActiveResult] = useState<Prediction | null>(null);
  const [selectedChildDetail, setSelectedChildDetail] = useState<{id: string, nama: string, jenisKelamin: 'L' | 'P'} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('auth_user');
    setHistory([]);
    setActiveResult(null);
    setSelectedChildDetail(null);
    setActivePage('dashboard');
  };

  // Fetch history on mount
  useEffect(() => {
    if (authUser) {
      fetchHistory();
    }
  }, [authUser]);


  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchHistory = async () => {
    if (!authUser) return;
    try {
      const res = await fetch(`${API_URL}/api/history?user_id=${authUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/history/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (activeResult && activeResult.id === id) {
          setActiveResult(null);
        }
        await fetchHistory();
      } else {
        const errorData = await res.json();
        console.error('Failed to delete history item:', errorData.error);
        alert(`Gagal menghapus data: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error deleting history item:', err);
      alert('Terjadi kesalahan koneksi saat menghapus data.');
    }
  };

  const handleNavigate = useCallback((page: string, data?: any) => {
    setActivePage(page as PageName);
    if (page === 'child-detail' && data) {
      setSelectedChildDetail(data);
    } else if (page === 'input') {
      if (data) setActiveResult(data);
      else setActiveResult(null);
    } else {
      if (data !== undefined) {
        setActiveResult(data);
      } else {
        setActiveResult(null);
      }
    }
    // Re-fetch history when going to dashboard ONLY if data is not specified
    if (page === 'dashboard' && data === undefined) {
      fetchHistory();
    }
    // Close sidebar on mobile
    setSidebarOpen(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            apiUrl={API_URL} 
          />
        );
      case 'children':
        return (
          <ChildrenList 
            onNavigate={handleNavigate} 
            apiUrl={API_URL} 
          />
        );
      case 'input':
        return <InputForm onNavigate={handleNavigate} apiUrl={API_URL} initialData={activeResult} />;
      case 'predictions':
        return <ResultView data={activeResult} onNavigate={handleNavigate} apiUrl={API_URL} />;
      case 'education':
        return <Education apiUrl={API_URL} onNavigate={handleNavigate} />;
      case 'child-detail':
        return selectedChildDetail ? (
          <ChildDetail
            childId={selectedChildDetail.id}
            childName={selectedChildDetail.nama}
            childGender={selectedChildDetail.jenisKelamin}
            onNavigate={handleNavigate}
            apiUrl={API_URL}
          />
        ) : (
          <Dashboard 
            onNavigate={handleNavigate} 
            apiUrl={API_URL} 
          />
        );
      default:
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            apiUrl={API_URL} 
          />
        );
    }
  };

  // Theme toggle node shared across auth and main app
  const themeToggleNode = (
    <>
      {/* Floating Theme Toggle (glowing icon-only styling) */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="theme-toggle-btn"
        aria-label="Toggle Theme"
      >
        {darkMode ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffb74d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px rgba(255, 183, 77, 0.75))' }}>
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c6bc0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px rgba(92, 107, 192, 0.5))' }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Extra responsive styles for theme toggle */}
      <style>{`
        .theme-toggle-btn {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 999;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
          backdrop-filter: blur(8px);
        }
        .theme-toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--accent-blue);
        }
        @media (max-width: 1024px) {
          .theme-toggle-btn {
            bottom: 80px;
            right: 16px;
            top: auto;
            width: 44px;
            height: 44px;
            z-index: 1001;
            position: fixed;
          }
        }
      `}</style>
    </>
  );

  // If not authenticated, show login/register page
  if (!authUser) {
    return (
      <>
        <AuthPage onLogin={handleLogin} apiUrl={API_URL} />
        {themeToggleNode}
      </>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        {/* Brand Logo */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              color: '#fff',
              fontWeight: 800,
              boxShadow: 'var(--shadow-glow)'
            }}>
              🌱
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Pantau Stunting
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Balita Indonesia</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${activePage === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
              id={`nav-${item.id}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          marginTop: '1rem'
        }}>
          {/* User Greeting */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
            padding: '10px 12px',
            background: 'var(--accent-blue-bg)',
            borderRadius: 'var(--radius-sm)',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-green))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {authUser.full_name?.charAt(0)?.toUpperCase() || authUser.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {authUser.full_name || authUser.username}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>@{authUser.username}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="nav-link"
            id="btn-logout"
            style={{ color: 'var(--accent-coral)', width: '100%' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Keluar</span>
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '12px' }}>
            Sistem Pendukung Keputusan Berbasis Web — Prediksi Risiko Stunting Balita di Posyandu Mawar Manis.
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>v2.3.0 • Kelompok Pijak © 2026</p>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '56px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 150,
        alignItems: 'center',
        padding: '0 1rem',
        justifyContent: 'space-between'
      }} className="mobile-top-bar">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span style={{ fontWeight: 700 }}>🌱 Pantau Stunting</span>
        <div style={{ width: '24px' }} />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav-bar">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activePage === item.id ? 'var(--accent-blue)' : 'var(--text-muted)',
              fontSize: '0.65rem',
              fontWeight: activePage === item.id ? 700 : 500,
              transition: 'color var(--transition-fast)'
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>

      {themeToggleNode}

      {/* Extra responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          .mobile-top-bar {
            display: flex !important;
          }
          .main-content {
            padding-top: calc(56px + 1.5rem) !important;
            padding-bottom: calc(64px + 1.5rem) !important;
          }
        }
        .history-row:hover {
          background: var(--bg-primary);
        }
      `}</style>
    </>
  );
}

export default App;
