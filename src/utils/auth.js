const STORAGE_PIN_AUTH_KEY = 'santiago_pin_auth';
const STORAGE_CUSTOM_PIN_KEY = 'santiago_custom_pin';
export const DEFAULT_PIN = '159';

export function isDeviceAuthenticated() {
  return localStorage.getItem(STORAGE_PIN_AUTH_KEY) === 'true' || 
         sessionStorage.getItem(STORAGE_PIN_AUTH_KEY) === 'true';
}

export function lockTerminalDevice() {
  localStorage.removeItem(STORAGE_PIN_AUTH_KEY);
  sessionStorage.removeItem(STORAGE_PIN_AUTH_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('santiago-lock-terminal'));
  }
}

export function getTargetPin() {
  return localStorage.getItem(STORAGE_CUSTOM_PIN_KEY) || DEFAULT_PIN;
}

export function saveAuthentication(remember = true) {
  if (remember) {
    localStorage.setItem(STORAGE_PIN_AUTH_KEY, 'true');
  } else {
    sessionStorage.setItem(STORAGE_PIN_AUTH_KEY, 'true');
  }
}

// ==========================================
// PIN ESPECÍFICO DO DASHBOARD (PADRÃO: 157)
// ==========================================
export const DEFAULT_DASHBOARD_PIN = '157';
const STORAGE_DASHBOARD_AUTH_KEY = 'santiago_dashboard_auth';
const STORAGE_CUSTOM_DASHBOARD_PIN_KEY = 'santiago_custom_dashboard_pin';

export function isDashboardAuthenticated() {
  return sessionStorage.getItem(STORAGE_DASHBOARD_AUTH_KEY) === 'true';
}

export function saveDashboardAuthentication() {
  sessionStorage.setItem(STORAGE_DASHBOARD_AUTH_KEY, 'true');
}

export function lockDashboard() {
  sessionStorage.removeItem(STORAGE_DASHBOARD_AUTH_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('santiago-lock-dashboard'));
  }
}

export function getDashboardTargetPin() {
  return localStorage.getItem(STORAGE_CUSTOM_DASHBOARD_PIN_KEY) || DEFAULT_DASHBOARD_PIN;
}

