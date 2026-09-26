/**
 * EcoGuard Auth Service
 * Users are stored in localStorage so they persist across sessions.
 * Error codes:  'incorrect_email' | 'incorrect_password' | 'email_taken'
 */

const USERS_KEY   = 'ecoguard_users';
const SESSION_KEY = 'ecoguard_session';

/* ── Seed users written only once on first load ──────────────────── */
const SEED_USERS = [
  {
    id: 'USR-1001',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@ecoguard.ai',
    password: 'EcoGuard@2026',
    role: 'ADMIN',
    department: 'Chief Environmental Scientist',
    zone: 'BAY-DELTA',
    clearance: 'Tier 3 — Hazard Command',
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'USR-1002',
    name: 'Marcus Osei',
    email: 'marcus.osei@ecoguard.ai',
    password: 'Field@Ops99',
    role: 'FIELD_OPS',
    department: 'Field Operations Lead',
    zone: 'SIERRA-NORTH',
    clearance: 'Tier 2 — Field Operator',
    createdAt: new Date('2026-01-01').toISOString(),
  },
];

/* ── Users store in localStorage ──────────────────────────────────── */
function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Exclude legacy mock seed users so only accounts created by the user exist
        return parsed.filter(u => u.id !== 'USR-1001' && u.id !== 'USR-1002');
      }
    }
  } catch {}
  return [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function stripPassword(user) {
  const { password, ...safe } = user;
  return safe;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function generateId() {
  return 'USR-' + Date.now().toString(36).toUpperCase();
}

function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Runtime-only PIN store { email → { pin, expiresAt } }
const PIN_STORE = {};

/* ═══════════════════════════════════════════════════════════════════ */
export const authService = {

  /* ── Check if any registered accounts exist ────────────────────── */
  hasUsers() {
    return loadUsers().length > 0;
  },

  /* ── Register new account ──────────────────────────────────────── */
  async register(name, email, password) {
    await delay(500);
    const users = loadUsers();
    const cleanEmail = email.trim().toLowerCase();
    const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, code: 'email_taken', error: 'An account with this email already exists. Please sign in.' };
    }
    const displayName = (name && name.trim()) ? name.trim() : cleanEmail.split('@')[0];
    const newUser = {
      id: generateId(),
      name: displayName,
      email: cleanEmail,
      password,
      role: 'FIELD_OPS',
      department: 'Field Operator',
      zone: 'BAY-DELTA',
      clearance: 'Tier 1 — Basic Access',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const session = stripPassword(newUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /* ── Login ─────────────────────────────────────────────────────── */
  async login(email, password) {
    await delay(500);
    const users = loadUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        code: 'incorrect_email',
        error: 'Incorrect email',
      };
    }
    if (user.password !== password) {
      return {
        success: false,
        code: 'incorrect_password',
        error: 'Incorrect password',
      };
    }
    const session = stripPassword(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /* ── Google mock OAuth ─────────────────────────────────────────── */
  async loginWithGoogle() {
    await delay(700);
    const users = loadUsers();
    let user = users.find(u => u.email === 'google.user@ecoguard.ai');
    if (!user) {
      user = {
        id: generateId(),
        name: 'EcoGuard Specialist',
        email: 'google.user@ecoguard.ai',
        role: 'FIELD_OPS',
        department: 'Field Operator',
        zone: 'BAY-DELTA',
        clearance: 'Tier 1 — Basic Access',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsers(users);
    }
    const session = stripPassword(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /* ── Restore existing session ──────────────────────────────────── */
  async getCurrentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  /* ── Logout ────────────────────────────────────────────────────── */
  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  /* ── Send password-reset PIN to email ──────────────────────────── */
  async sendResetPin(email) {
    await delay(700);
    const users = loadUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Security: don't reveal whether email exists
      return { success: true, message: 'If that email is registered, a 6-digit PIN has been sent.' };
    }
    const pin = generatePin();
    PIN_STORE[email.toLowerCase()] = { pin, expiresAt: Date.now() + 10 * 60 * 1000 };
    console.info(
      `%c[EcoGuard] Reset PIN for ${email}: ${pin}  (valid 10 min)`,
      'background:#1a2518;color:#82b460;padding:4px 10px;border-radius:4px;font-weight:bold;font-size:14px'
    );
    return { success: true, message: 'A 6-digit reset PIN has been sent to your email address.' };
  },

  /* ── Verify PIN and set new password ───────────────────────────── */
  async verifyPinAndReset(email, pin, newPassword) {
    await delay(600);
    const entry = PIN_STORE[email.toLowerCase()];
    if (!entry)                      return { success: false, error: 'No PIN was requested for this email.' };
    if (Date.now() > entry.expiresAt) { delete PIN_STORE[email.toLowerCase()]; return { success: false, error: 'PIN has expired. Please request a new one.' }; }
    if (entry.pin !== pin.trim())    return { success: false, error: 'Incorrect PIN. Please check your email and try again.' };

    const users   = loadUsers();
    const userIdx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (userIdx !== -1) {
      users[userIdx].password = newPassword;
      saveUsers(users);
    }
    delete PIN_STORE[email.toLowerCase()];
    return { success: true, message: 'Password updated. You can now sign in.' };
  },
};
