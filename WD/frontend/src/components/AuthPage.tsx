import { useState } from 'react';

interface AuthPageProps {
  onLogin: (user: { id: string; username: string; full_name: string; role: string }) => void;
  apiUrl: string;
}

export function AuthPage({ onLogin, apiUrl }: AuthPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username/email dan password harus diisi.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan.');
        return;
      }

      // Save session
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch {
      setError('Gagal terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated Background Orbs */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      <div className="auth-container fade-in">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="brand-logo-container" style={{ marginBottom: '0.75rem' }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="brand-logo-interactive brand-logo-auth" 
            />
          </div>
          <h1 className="auth-title">Pantau Stunting Balita</h1>
          <p className="auth-subtitle">Sistem Pendukung Keputusan Berbasis Web</p>
        </div>

        {/* Auth Card */}
        <div className="auth-card glass-panel">
          {/* Header */}
          <div className="auth-card-header">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <h2>Masuk ke Akun Anda</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Error Message */}
            {error && (
              <div className="auth-alert auth-alert-error fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            {/* Username / Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-username">Username atau Email</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                </svg>
                <input
                  id="auth-username"
                  className="form-input auth-input"
                  type="text"
                  placeholder="Username atau email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Password</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="auth-password"
                  className="form-input auth-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
              id="auth-submit"
            >
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Memproses...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Masuk
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Badge */}
        <div className="auth-info-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Password dienkripsi dengan bcrypt untuk keamanan data Anda
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          position: relative;
          overflow: hidden;
          padding: 2rem;
        }

        /* Animated Background Orbs */
        .auth-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          pointer-events: none;
        }
        .auth-bg-orb-1 {
          width: 400px;
          height: 400px;
          background: var(--accent-blue);
          top: -100px;
          right: -100px;
          animation: orb-float-1 12s infinite ease-in-out;
        }
        .auth-bg-orb-2 {
          width: 300px;
          height: 300px;
          background: var(--accent-green);
          bottom: -80px;
          left: -60px;
          animation: orb-float-2 15s infinite ease-in-out;
        }
        .auth-bg-orb-3 {
          width: 200px;
          height: 200px;
          background: var(--accent-coral);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orb-float-3 10s infinite ease-in-out;
        }

        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, 40px) scale(1.1); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.15); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.35; }
        }

        .auth-container {
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 1;
        }

        /* Brand */
        .auth-brand {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-logo {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: 0 8px 32px rgba(91, 164, 230, 0.25);
          animation: logo-glow 3s infinite ease-in-out;
        }
        @keyframes logo-glow {
          0%, 100% { box-shadow: 0 8px 32px rgba(91, 164, 230, 0.25); }
          50% { box-shadow: 0 8px 48px rgba(118, 200, 147, 0.35); }
        }
        .auth-logo-icon {
          font-size: 1.75rem;
        }
        .auth-title {
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 4px;
          font-weight: 500;
        }

        /* Card */
        .auth-card {
          padding: 2rem;
        }

        /* Card Header */
        .auth-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }
        .auth-card-header h2 {
          font-size: 1.15rem;
          font-weight: 700;
        }
        .auth-card-header svg {
          color: var(--accent-blue);
        }

        /* Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* Input Wrapper */
        .auth-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-input-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
          transition: color var(--transition-fast);
          z-index: 1;
        }
        .auth-input {
          padding-left: 42px !important;
          padding-right: 42px !important;
        }
        .auth-input:focus + .auth-input-icon,
        .auth-input-wrapper:focus-within .auth-input-icon {
          color: var(--accent-blue);
        }

        /* Eye Button */
        .auth-eye-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color var(--transition-fast);
        }
        .auth-eye-btn:hover {
          color: var(--accent-blue);
        }

        /* Submit Button */
        .auth-submit-btn {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
          margin-top: 0.5rem;
          position: relative;
          overflow: hidden;
        }
        .auth-submit-btn::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          transition: width 0.5s, height 0.5s;
          transform: translate(-50%, -50%);
        }
        .auth-submit-btn:hover::after {
          width: 300px;
          height: 300px;
        }

        /* Spinner */
        .auth-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Alerts */
        .auth-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .auth-alert-error {
          background: var(--accent-coral-bg);
          color: var(--accent-coral);
          border: 1px solid rgba(231, 111, 81, 0.2);
        }

        /* Info Badge */
        .auth-info-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 1.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.8;
        }

        /* Mobile */
        @media (max-width: 480px) {
          .auth-page {
            padding: 1rem;
          }
          .auth-card {
            padding: 1.5rem;
          }
          .auth-title {
            font-size: 1.35rem;
          }
        }
      `}</style>
    </div>
  );
}
