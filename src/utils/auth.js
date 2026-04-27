// SHA-256 admin authentication utility
// The password hash is stored here — the raw password is never saved anywhere.
const ADMIN_HASH = '8ac3157440085339ce81cb1e10c9c5c576ba8aa2abe51097440484f850f33753';
const SESSION_KEY = 'akj_admin_session';

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password) {
  const hash = await hashPassword(password);
  return hash === ADMIN_HASH;
}

export function isAdminAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function setAdminSession() {
  sessionStorage.setItem(SESSION_KEY, 'true');
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
