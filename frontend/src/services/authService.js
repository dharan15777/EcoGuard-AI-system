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

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // First ever load — seed defaults
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
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

  /* ── Register new account ──────────────────────────────────────── */
  async register(name, email, password) {
    await delay(600);
    const users = loadUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, code: 'email_taken', error: 'An account with this email already exists. Please sign in.' };
    }
    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
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
    await delay(600);
    const users = loadUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return {
        success: false,
        code: 'incorrect_email',
        error: 'No account found with this email address. Please create an account first.',
      };
    }
    if (user.password !== password) {
      return {
        success: false,
        code: 'incorrect_password',
        error: 'Incorrect password. Please try again or reset your password.',
      };
    }
    const session = stripPassword(user);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /* ── Google mock OAuth ─────────────────────────────────────────── */
  async loginWithGoogle() {
    await delay(900);
    // Simulate linking to seed admin account
    const users = loadUsers();
    const user  = users[0];
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
