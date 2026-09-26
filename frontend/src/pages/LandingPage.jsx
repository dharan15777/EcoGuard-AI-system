import React, { useState } from 'react';
import {
  Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft,
  UserPlus, LogIn, Droplets, Flame, Wind, Mountain,
  Loader2, CheckCircle2, AlertCircle, User
} from 'lucide-react';
import { authService } from '../services/authService';

/* ── Google icon (inline SVG, no extra deps) ─────────────────────── */
const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
);

/* ── Live sensor strips shown on left panel ──────────────────────── */
const LIVE_STATS = [
  { icon: Droplets, color: '#4a8fa8', label: 'River Stage',   value: '2.8 m',  status: 'NOMINAL',  statusColor: '#627060', statusBg: 'rgba(98,112,96,0.12)',   statusBorder: 'rgba(98,112,96,0.2)' },
  { icon: Flame,    color: '#c84040', label: 'Fire Index',    value: '94.2%',  status: 'ELEVATED', statusColor: '#c84040', statusBg: 'rgba(200,64,64,0.12)',  statusBorder: 'rgba(200,64,64,0.3)' },
  { icon: Wind,     color: '#9a7ec8', label: 'Air Quality',   value: 'AQI 38', status: 'GOOD',     statusColor: '#82b460', statusBg: 'rgba(90,138,74,0.12)', statusBorder: 'rgba(90,138,74,0.3)'  },
  { icon: Mountain, color: '#c47e35', label: 'Soil Moisture', value: '44%',    status: 'NOMINAL',  statusColor: '#627060', statusBg: 'rgba(98,112,96,0.12)',   statusBorder: 'rgba(98,112,96,0.2)' },
];

/* ── Shared style objects ─────────────────────────────────────────── */
const inputBase = {
  width: '100%',
  padding: '11px 14px 11px 40px',
  borderRadius: '7px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(139,163,130,0.2)',
  color: '#e8ede6',
  fontSize: '0.88rem',
  fontFamily: "'Space Grotesk', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelSt = {
  fontSize: '0.62rem',
  color: '#627060',
  fontFamily: "'Space Mono', monospace",
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: '7px',
};

/* ── Icon inside input ────────────────────────────────────────────── */
const InputIcon = ({ children }) => (
  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#4a6040', pointerEvents: 'none', display: 'flex' }}>
    {children}
  </span>
);

/* ── Error / Success banners ─────────────────────────────────────── */
const ErrorBanner = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(200,64,64,0.1)', border: '1px solid rgba(200,64,64,0.3)', fontSize: '0.8rem', color: '#e05050', lineHeight: 1.4 }}>
    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} /> {msg}
  </div>
);

const SuccessBanner = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(90,138,74,0.12)', border: '1px solid rgba(90,138,74,0.3)', fontSize: '0.8rem', color: '#82b460' }}>
    <CheckCircle2 size={15} style={{ flexShrink: 0 }} /> {msg}
  </div>
);

const Spinner = () => <Loader2 size={17} style={{ animation: 'spin 0.9s linear infinite', flexShrink: 0 }} />;

/* ═══════════════════════════════════════════════════════════════════
   SCREEN: Sign In
═══════════════════════════════════════════════════════════════════ */
const SignInScreen = ({ onLogin, onGoogleLogin, onForgotPassword, onSwitchToRegister }) => {
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [gLoading,setGLoading]= useState(false);

  /* Field-level error highlighting */
  const emailErr = error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('account'));
  const pwErr    = error && error.toLowerCase().includes('password');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim())   { setError('Please enter your email address.'); return; }
    if (!password)       { setError('Please enter your password.'); return; }
    setLoading(true);
    const res = await onLogin(email.trim(), password);
    setLoading(false);
    if (!res.success) setError(res.error);
  };

  const handleGoogle = async () => {
    setGLoading(true);
    await onGoogleLogin();
    setGLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#e8ede6', letterSpacing: '-0.02em' }}>Welcome back</h2>
        <p style={{ fontSize: '0.8rem', color: '#627060', marginTop: '4px' }}>
          Sign in to your EcoGuard account.{' '}
          <button onClick={onSwitchToRegister} style={{ color: '#5a8a4a', fontWeight: '600', textDecoration: 'underline', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
            Create account
          </button>
        </p>
      </div>

      {/* Google */}
      <button onClick={handleGoogle} disabled={gLoading} style={{ width: '100%', padding: '10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,163,130,0.2)', color: '#e8ede6', fontWeight: '600', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', cursor: gLoading ? 'not-allowed' : 'pointer', opacity: gLoading ? 0.7 : 1, fontFamily: "'Space Grotesk', sans-serif" }}>
        {gLoading ? <Spinner /> : <GoogleIcon />}
        {gLoading ? 'Connecting…' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(139,163,130,0.12)' }} />
        <span style={{ fontSize: '0.6rem', color: '#3a5030', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(139,163,130,0.12)' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
        {/* Email */}
        <div>
          <label style={labelSt}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <InputIcon><Mail size={15} /></InputIcon>
            <input
              id="signin-email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={e => { setEmail(e.target.value); setError(''); }}
              style={{ ...inputBase, borderColor: emailErr ? 'rgba(200,64,64,0.6)' : 'rgba(139,163,130,0.2)' }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
            <label style={{ ...labelSt, marginBottom: 0 }}>Password</label>
            <button type="button" onClick={onForgotPassword} style={{ fontSize: '0.7rem', color: '#5a8a4a', fontWeight: '600', textDecoration: 'underline', background: 'none', cursor: 'pointer' }}>
              Forgot password?
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <InputIcon><Lock size={15} /></InputIcon>
            <input
              id="signin-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              autoComplete="current-password"
              placeholder="Enter your password"
              onChange={e => { setPassword(e.target.value); setError(''); }}
              style={{ ...inputBase, paddingRight: '42px', borderColor: pwErr ? 'rgba(200,64,64,0.6)' : 'rgba(139,163,130,0.2)' }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: '#4a6040', padding: '4px', background: 'none' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {error && <ErrorBanner msg={error} />}

        <button
          id="signin-submit"
          type="submit"
          disabled={loading}
          style={{ marginTop: '2px', padding: '11px', borderRadius: '7px', background: loading ? 'rgba(90,138,74,0.35)' : 'linear-gradient(135deg, #5a8a4a 0%, #3d6232 100%)', border: '1px solid rgba(90,138,74,0.4)', color: '#e8ede6', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 0 16px rgba(90,138,74,0.2)', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {loading ? <Spinner /> : <LogIn size={16} />}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SCREEN: Create Account
═══════════════════════════════════════════════════════════════════ */
const RegisterScreen = ({ onRegister, onGoogleLogin, onSwitchToLogin }) => {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim())               { setError('Please enter your full name.'); return; }
    if (!email.trim())              { setError('Please enter your email address.'); return; }
    if (password.length < 6)        { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw)     { setError('Passwords do not match.'); return; }
    setLoading(true);
    const res = await onRegister(name.trim(), email.trim(), password);
    setLoading(false);
    if (!res.success) setError(res.error);
    // on success, useAuth hook sets user → App auto-navigates to dashboard
  };

  const handleGoogle = async () => {
    setGLoading(true);
    await onGoogleLogin();
    setGLoading(false);
  };

  /* Password strength */
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#c84040', '#c47e35', '#82b460'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#e8ede6', letterSpacing: '-0.02em' }}>Create Account</h2>
        <p style={{ fontSize: '0.8rem', color: '#627060', marginTop: '4px' }}>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} style={{ color: '#5a8a4a', fontWeight: '600', textDecoration: 'underline', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
            Sign in
          </button>
        </p>
      </div>

      {/* Google */}
      <button onClick={handleGoogle} disabled={gLoading} style={{ width: '100%', padding: '10px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,163,130,0.2)', color: '#e8ede6', fontWeight: '600', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', cursor: gLoading ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
        {gLoading ? <Spinner /> : <GoogleIcon />}
        {gLoading ? 'Connecting…' : 'Sign up with Google'}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(139,163,130,0.12)' }} />
        <span style={{ fontSize: '0.6rem', color: '#3a5030', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em' }}>OR REGISTER WITH EMAIL</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(139,163,130,0.12)' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Full name */}
        <div>
          <label style={labelSt}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <InputIcon><User size={15} /></InputIcon>
            <input
              id="reg-name"
              type="text"
              value={name}
              autoComplete="name"
              placeholder="Dr. Jane Smith"
              onChange={e => { setName(e.target.value); setError(''); }}
              style={inputBase}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label style={labelSt}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <InputIcon><Mail size={15} /></InputIcon>
            <input
              id="reg-email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={e => { setEmail(e.target.value); setError(''); }}
              style={{ ...inputBase, borderColor: error && error.includes('email') ? 'rgba(200,64,64,0.6)' : 'rgba(139,163,130,0.2)' }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={labelSt}>Password</label>
          <div style={{ position: 'relative' }}>
            <InputIcon><Lock size={15} /></InputIcon>
            <input
              id="reg-password"
              type={showPw ? 'text' : 'password'}
              value={password}
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              onChange={e => { setPassword(e.target.value); setError(''); }}
              style={{ ...inputBase, paddingRight: '42px' }}
            />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: '#4a6040', padding: '4px', background: 'none' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {/* Strength bar */}
          {password.length > 0 && (
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(strength / 3) * 100}%`, background: strengthColor[strength], transition: 'width 0.3s, background 0.3s', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '0.62rem', fontFamily: "'Space Mono', monospace", color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label style={labelSt}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <InputIcon><Lock size={15} /></InputIcon>
            <input
              id="reg-confirm"
              type={showPw ? 'text' : 'password'}
              value={confirmPw}
              autoComplete="new-password"
              placeholder="Re-enter password"
              onChange={e => { setConfirmPw(e.target.value); setError(''); }}
              style={{ ...inputBase, borderColor: confirmPw && confirmPw !== password ? 'rgba(200,64,64,0.6)' : 'rgba(139,163,130,0.2)' }}
            />
          </div>
          {confirmPw && confirmPw !== password && (
            <p style={{ fontSize: '0.68rem', color: '#c84040', marginTop: '4px', fontFamily: "'Space Mono', monospace" }}>Passwords do not match</p>
          )}
        </div>

        {error && <ErrorBanner msg={error} />}

        <button
          id="reg-submit"
          type="submit"
          disabled={loading}
          style={{ marginTop: '2px', padding: '11px', borderRadius: '7px', background: loading ? 'rgba(90,138,74,0.35)' : 'linear-gradient(135deg, #5a8a4a 0%, #3d6232 100%)', border: '1px solid rgba(90,138,74,0.4)', color: '#e8ede6', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 0 16px rgba(90,138,74,0.2)', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {loading ? <Spinner /> : <UserPlus size={16} />}
          {loading ? 'Creating account…' : 'Create Account & Sign In'}
        </button>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SCREEN: Forgot Password — Request PIN
═══════════════════════════════════════════════════════════════════ */
const ForgotScreen = ({ onBack, onPinSent }) => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!email.trim()) { setError('Please enter your registered email.'); return; }
    setLoading(true);
    const res = await authService.sendResetPin(email.trim());
    setLoading(false);
    if (res.success) { setMessage(res.message); setTimeout(() => onPinSent(email.trim()), 1600); }
    else { setError(res.error); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4a6040', fontSize: '0.78rem', background: 'none', cursor: 'pointer', width: 'fit-content' }}>
        ← Back to Sign In
      </button>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#e8ede6', letterSpacing: '-0.02em' }}>Reset Password</h2>
        <p style={{ fontSize: '0.8rem', color: '#627060', marginTop: '5px', lineHeight: 1.55 }}>
          Enter your registered email. We'll send a 6-digit PIN to verify your identity.
        </p>
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
        <div>
          <label style={labelSt}>Registered Email</label>
          <div style={{ position: 'relative' }}>
            <InputIcon><Mail size={15} /></InputIcon>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="your@email.com" style={inputBase} />
          </div>
        </div>
        {error   && <ErrorBanner msg={error} />}
        {message && <SuccessBanner msg={message} />}
        <button type="submit" disabled={loading} style={{ padding: '11px', borderRadius: '7px', background: loading ? 'rgba(90,138,74,0.35)' : 'linear-gradient(135deg, #5a8a4a 0%, #3d6232 100%)', border: '1px solid rgba(90,138,74,0.4)', color: '#e8ede6', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
          {loading ? <Spinner /> : <Mail size={16} />}
          {loading ? 'Sending PIN…' : 'Send Reset PIN'}
        </button>
      </form>
      <div style={{ padding: '11px 13px', background: 'rgba(196,126,53,0.08)', border: '1px solid rgba(196,126,53,0.2)', borderRadius: '6px', fontSize: '0.7rem', color: '#c47e35', fontFamily: "'Space Mono', monospace", lineHeight: 1.6 }}>
        ⚠ PIN valid for <strong>10 minutes</strong>. For demo, check the browser console (F12 → Console) for the PIN.
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SCREEN: Enter PIN + New Password
═══════════════════════════════════════════════════════════════════ */
const ResetScreen = ({ email, onBack, onDone }) => {
  const [pin,       setPin]       = useState('');
  const [newPw,     setNewPw]     = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [done,      setDone]      = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (pin.length !== 6)          { setError('Enter the 6-digit PIN from your email.'); return; }
    if (newPw.length < 6)          { setError('Password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw)       { setError('Passwords do not match.'); return; }
    setLoading(true);
    const res = await authService.verifyPinAndReset(email, pin, newPw);
    setLoading(false);
    if (res.success) { setDone(true); setTimeout(onDone, 2000); }
    else { setError(res.error); }
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <CheckCircle2 size={52} color="#82b460" style={{ margin: '0 auto 16px' }} />
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#e8ede6' }}>Password Updated!</h3>
      <p style={{ fontSize: '0.8rem', color: '#627060', marginTop: '8px' }}>Redirecting to sign in…</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4a6040', fontSize: '0.78rem', background: 'none', cursor: 'pointer', width: 'fit-content' }}>← Back</button>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#e8ede6', letterSpacing: '-0.02em' }}>Enter Reset PIN</h2>
        <p style={{ fontSize: '0.78rem', color: '#627060', marginTop: '4px' }}>
          PIN sent to <span style={{ color: '#5a8a4a', fontFamily: "'Space Mono', monospace" }}>{email}</span>
        </p>
      </div>
      <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelSt}>6-Digit PIN</label>
          <input type="text" inputMode="numeric" maxLength={6} value={pin} onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }} placeholder="_ _ _ _ _ _"
            style={{ ...inputBase, paddingLeft: '14px', fontFamily: "'Space Mono', monospace", fontSize: '1.6rem', letterSpacing: '0.5em', textAlign: 'center' }} />
        </div>
        <div>
          <label style={labelSt}>New Password</label>
          <div style={{ position: 'relative' }}>
            <InputIcon><Lock size={15} /></InputIcon>
            <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => { setNewPw(e.target.value); setError(''); }} placeholder="Min. 6 characters" style={{ ...inputBase, paddingRight: '42px' }} />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: '#4a6040', padding: '4px', background: 'none' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label style={labelSt}>Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <InputIcon><Lock size={15} /></InputIcon>
            <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setError(''); }} placeholder="Re-enter password" style={inputBase} />
          </div>
        </div>
        {error && <ErrorBanner msg={error} />}
        <button type="submit" disabled={loading} style={{ padding: '11px', borderRadius: '7px', background: loading ? 'rgba(90,138,74,0.35)' : 'linear-gradient(135deg, #5a8a4a 0%, #3d6232 100%)', border: '1px solid rgba(90,138,74,0.4)', color: '#e8ede6', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}>
          {loading ? <Spinner /> : <CheckCircle2 size={16} />}
          {loading ? 'Verifying…' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN — LandingPage
═══════════════════════════════════════════════════════════════════ */
export const LandingPage = ({ onLogin, onGoogleLogin, onRegister }) => {
  // 'signin' | 'register' | 'forgot' | 'reset'
  const [screen,     setScreen]     = useState('signin');
  const [resetEmail, setResetEmail] = useState('');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Space Grotesk', sans-serif", background: '#0e1210' }}>

      {/* ── Left panel: branding + live data ─────────────────────── */}
      <div style={{
        width: '44%', minHeight: '100vh',
        background: 'linear-gradient(165deg, #111812 0%, #0d1510 55%, #0e1612 100%)',
        borderRight: '1px solid rgba(90,138,74,0.1)',
        padding: '44px 44px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative topo rings */}
        <svg style={{ position: 'absolute', bottom: '-80px', right: '-90px', opacity: 0.055, width: '560px', height: '560px', pointerEvents: 'none' }} viewBox="0 0 500 500">
          {[45, 90, 135, 180, 225, 270, 315].map((r, i) => (
            <circle key={i} cx="400" cy="400" r={r} stroke="#82b460" strokeWidth="1.2" fill="none" />
          ))}
        </svg>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'linear-gradient(140deg, #3d6e30 0%, #2a4e24 100%)', border: '1px solid rgba(90,138,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(90,138,74,0.18)', flexShrink: 0 }}>
            <Leaf size={20} color="#82b460" />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e8ede6', letterSpacing: '-0.01em' }}>
              <span style={{ color: '#82b460' }}>Eco</span>Guard
            </div>
            <div style={{ fontSize: '0.55rem', color: '#3a5030', fontFamily: "'Space Mono', monospace", letterSpacing: '0.12em' }}>
              ENVIRONMENTAL MONITORING SYSTEM
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(90,138,74,0.09)', border: '1px solid rgba(90,138,74,0.22)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '700', color: '#4a7040', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', marginBottom: '18px' }}>
            ● LIVE · BAY-DELTA ZONE
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '700', lineHeight: 1.1, letterSpacing: '-0.03em', color: '#e8ede6', marginBottom: '14px' }}>
            Protecting Communities<br />
            Through Environmental<br />
            <span style={{ color: '#82b460' }}>Vigilance.</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#4a6040', lineHeight: 1.7, maxWidth: '360px' }}>
            Real-time distributed sensor network monitoring flood levels, wildfire heat,
            air quality, and slope instability — 24 hours a day across the region.
          </p>
        </div>

        {/* Live sensor data */}
        <div>
          <div style={{ fontSize: '0.58rem', color: '#2e4028', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', marginBottom: '10px' }}>
            LIVE SENSOR READINGS
          </div>
          {LIVE_STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(139,163,130,0.08)', borderRadius: '6px', marginBottom: '7px' }}>
                <Icon size={14} color={s.color} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.76rem', color: '#6a8060' }}>{s.label}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.78rem', fontWeight: '700', color: '#aabcaa' }}>{s.value}</span>
                <span style={{ fontSize: '0.56rem', fontFamily: "'Space Mono', monospace", color: s.statusColor, background: s.statusBg, border: `1px solid ${s.statusBorder}`, padding: '2px 5px', borderRadius: '3px', letterSpacing: '0.06em', flexShrink: 0 }}>
                  {s.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right panel: auth form ────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '44px 32px', background: '#0e1210', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '410px', background: 'rgba(18,25,17,0.95)', border: '1px solid rgba(139,163,130,0.14)', borderRadius: '12px', padding: '34px 30px', boxShadow: '0 24px 60px rgba(0,0,0,0.45)' }}>

          {screen === 'signin'   && <SignInScreen   onLogin={onLogin} onGoogleLogin={onGoogleLogin} onForgotPassword={() => setScreen('forgot')} onSwitchToRegister={() => setScreen('register')} />}
          {screen === 'register' && <RegisterScreen onRegister={onRegister} onGoogleLogin={onGoogleLogin} onSwitchToLogin={() => setScreen('signin')} />}
          {screen === 'forgot'   && <ForgotScreen   onBack={() => setScreen('signin')} onPinSent={(em) => { setResetEmail(em); setScreen('reset'); }} />}
          {screen === 'reset'    && <ResetScreen    email={resetEmail} onBack={() => setScreen('forgot')} onDone={() => setScreen('signin')} />}

        </div>
      </div>

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
