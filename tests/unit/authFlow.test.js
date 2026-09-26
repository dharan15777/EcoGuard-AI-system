const assert = require('assert');

// Simulate browser storage
class MockStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.get(key) || null; }
  setItem(key, val) { this.store.set(key, String(val)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

global.localStorage = new MockStorage();
global.sessionStorage = new MockStorage();

// Auth service logic implementation under test
const USERS_KEY = 'ecoguard_users';
const SESSION_KEY = 'ecoguard_session';

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
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

const authService = {
  hasUsers() {
    return loadUsers().length > 0;
  },

  async register(name, email, password) {
    const users = loadUsers();
    const cleanEmail = email.trim().toLowerCase();
    const exists = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, code: 'email_taken', error: 'An account with this email already exists. Please sign in.' };
    }
    const displayName = (name && name.trim()) ? name.trim() : cleanEmail.split('@')[0];
    const newUser = {
      id: 'USR-' + Date.now().toString(36).toUpperCase(),
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

  async login(email, password) {
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

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  }
};

async function runTests() {
  console.log('🧪 Running Auth Flow Unit Test: authFlow.test.js');

  // 1. Initial State: No accounts created yet
  assert.strictEqual(authService.hasUsers(), false, 'Should have no users initially');

  // 2. Attempt login before account creation -> MUST fail with 'Incorrect email'
  const failLoginBeforeCreate = await authService.login('alice@example.com', 'mypassword123');
  assert.strictEqual(failLoginBeforeCreate.success, false);
  assert.strictEqual(failLoginBeforeCreate.error, 'Incorrect email', 'Unregistered email must report Incorrect email');

  // 3. Create account with email & password
  const regResult = await authService.register('', 'alice@example.com', 'SecurePass2026!');
  assert.strictEqual(regResult.success, true, 'Registration must succeed');
  assert.strictEqual(regResult.user.email, 'alice@example.com');
  assert.strictEqual(authService.getCurrentUser().email, 'alice@example.com', 'Session must be active after registration');
  assert.strictEqual(authService.hasUsers(), true, 'hasUsers must return true after account creation');

  // 4. Logout
  authService.logout();
  assert.strictEqual(authService.getCurrentUser(), null, 'Session must be cleared on logout');

  // 5. Login with incorrect email
  const wrongEmailLogin = await authService.login('bob@example.com', 'SecurePass2026!');
  assert.strictEqual(wrongEmailLogin.success, false);
  assert.strictEqual(wrongEmailLogin.error, 'Incorrect email', 'Should return Incorrect email for unregistered email');

  // 6. Login with correct email but incorrect password
  const wrongPassLogin = await authService.login('alice@example.com', 'WrongPass!');
  assert.strictEqual(wrongPassLogin.success, false);
  assert.strictEqual(wrongPassLogin.error, 'Incorrect password', 'Should return Incorrect password for wrong password');

  // 7. Login with correct email and correct password -> access granted
  const correctLogin = await authService.login('alice@example.com', 'SecurePass2026!');
  assert.strictEqual(correctLogin.success, true, 'Should successfully log in with valid credentials');
  assert.strictEqual(correctLogin.user.email, 'alice@example.com');
  assert.strictEqual(authService.getCurrentUser().email, 'alice@example.com', 'Session restored on login');

  console.log('✅ PASS: All Auth Flow scenarios verified successfully!');
}

runTests().catch(err => {
  console.error('❌ FAIL:', err);
  process.exit(1);
});
