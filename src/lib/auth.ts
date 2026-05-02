// Simple shared-password gate (per user choice).
// Stored in sessionStorage so it clears when the tab/browser closes.
export const APP_PASSWORD = "julia2025";
const KEY = "bps-auth-ok";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === "1";
}

export function login(password: string): boolean {
  if (password === APP_PASSWORD) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function logout() {
  sessionStorage.removeItem(KEY);
}
