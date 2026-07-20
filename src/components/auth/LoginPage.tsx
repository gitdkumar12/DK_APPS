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



          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
            <Building2 size={11} style={{ display: 'inline', marginRight: 4 }} />
            GT Consultancy Raipur · Phase 1
          </div>
        </div>


      </div>
    </div>
  );
}
