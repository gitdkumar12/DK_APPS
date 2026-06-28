'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LocalDbService } from '@/services/LocalDbService';
import { Building2, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Copy, Check } from 'lucide-react';

// ── Credentials info for the login page ──────────────────────
const CREDENTIALS = [
  { role: 'Admin', name: 'Piyush Raj Verma', email: 'piyush@gtconsultancy.in', password: 'GT@Admin2026', icon: '👑' },
  { role: 'Employee', name: 'Aman Verma', email: 'aman@gtconsultancy.in', password: 'GT@Aman2026', icon: '📐' },
  { role: 'Employee', name: 'Ravi Kumar', email: 'ravi@gtconsultancy.in', password: 'GT@Ravi2026', icon: '🏦' },
  { role: 'Employee', name: 'Sneha Patel', email: 'sneha@gtconsultancy.in', password: 'GT@Sneha2026', icon: '🏗️' },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
        color: copied ? 'var(--accent-emerald)' : 'var(--text-muted)',
        transition: 'color 0.2s', lineHeight: 1,
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

export default function LoginPage() {
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      const { user, error: err } = LocalDbService.login(email, password);
      if (err) {
        setError(err);
      } else if (user) {
        setCurrentUser(user);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'A database or connection error occurred. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (cred: typeof CREDENTIALS[0]) => {
    setError('');
    try {
      const { user } = LocalDbService.login(cred.email, cred.password);
      if (user) setCurrentUser(user);
    } catch (err: any) {
      console.error('Quick login error:', err);
      setError(err?.message || 'A database or connection error occurred. Please check your network.');
    }
  };

  const fillCreds = (cred: typeof CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
  };

  return (
    <div className="login-bg">
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', zIndex: 1, position: 'relative', width: '100%', maxWidth: 900, padding: '0 24px', flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Login Card */}
        <div className="login-card" style={{ flex: '0 0 400px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16, margin: '0 auto 14px',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'Outfit',
              boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
            }}>GT</div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              GT Consultancy Raipur
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>Enterprise Operations Platform — Sign In</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type="email" className="form-input" style={{ paddingLeft: 36 }}
                  placeholder="your@gtconsultancy.in"
                  value={email} onChange={e => setEmail(e.target.value)} required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'} className="form-input"
                  style={{ paddingLeft: 36, paddingRight: 40 }}
                  placeholder="Enter your password"
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: 'var(--accent-rose)' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={14} /></>}
            </button>
          </form>

          {/* Divider and Quick Access (Development only) */}
          {process.env.NODE_ENV !== 'production' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Quick Access</span>
                <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
              </div>

              {/* Quick login buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {CREDENTIALS.map(c => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => handleQuickLogin(c)}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'center', fontSize: 12, padding: '8px 12px', flexDirection: 'column', height: 'auto', gap: 2 }}
                  >
                    <span>{c.icon} {c.name.split(' ')[0]}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{c.role}</span>
                  </button>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setShowCreds(!showCreds)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, color: 'var(--accent-indigo-light)', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <ShieldCheck size={12} />
                  {showCreds ? 'Hide Credentials' : 'View All Credentials'}
                </button>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            <Building2 size={11} style={{ display: 'inline', marginRight: 4 }} />
            GT Consultancy Raipur · Phase 1
          </div>
        </div>

        {/* Credentials Panel */}
        {process.env.NODE_ENV !== 'production' && showCreds && (
          <div style={{
            flex: '0 0 380px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 18, padding: 24,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            animation: 'slideUp 0.25s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={16} style={{ color: 'var(--accent-indigo-light)' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>System Credentials</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click a row to auto-fill the login form</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CREDENTIALS.map(c => (
                <div
                  key={c.email}
                  onClick={() => fillCreds(c)}
                  style={{
                    background: c.role === 'Admin' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${c.role === 'Admin' ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = c.role === 'Admin' ? 'rgba(99,102,241,0.25)' : 'var(--border)')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{c.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
                        <span className={`role-badge ${c.role === 'Admin' ? 'admin' : 'employee'}`} style={{ fontSize: 9 }}>{c.role}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleQuickLogin(c); }}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11, padding: '5px 10px' }}
                    >
                      Login →
                    </button>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 7, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{c.email}</span>
                        <CopyBtn text={c.email} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 12, color: 'var(--accent-indigo-light)', fontFamily: 'monospace', fontWeight: 700 }}>{c.password}</span>
                        <CopyBtn text={c.password} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 11, color: 'var(--accent-amber)', lineHeight: 1.5 }}>
              ⚡ Admin can reset employee passwords from the <strong>Employees</strong> page after logging in.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
