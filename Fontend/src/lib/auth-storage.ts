export interface StoredUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  tenant_id: string;
  tenant_name: string;
}

export interface LoginAuthPayload {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user?: StoredUserProfile;
}

const ACCESS_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";
const PROFILE_KEY = "auth_user_profile";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined";
}

function getPrimaryStorage(rememberMe: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

export function saveAuthSession(payload: LoginAuthPayload, rememberMe: boolean): void {
  if (!canUseBrowserStorage()) return;

  const primary = getPrimaryStorage(rememberMe);
  const secondary = rememberMe ? sessionStorage : localStorage;

  secondary.removeItem(ACCESS_KEY);
  secondary.removeItem(REFRESH_KEY);
  secondary.removeItem(PROFILE_KEY);

  primary.setItem(ACCESS_KEY, payload.access_token);
  if (payload.refresh_token) {
    primary.setItem(REFRESH_KEY, payload.refresh_token);
  }
  if (payload.user) {
    primary.setItem(PROFILE_KEY, JSON.stringify(payload.user));
  }
}

export function readAccessToken(): string | null {
  if (!canUseBrowserStorage()) return null;
  return sessionStorage.getItem(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY);
}

export function readUserProfile(): StoredUserProfile | null {
  if (!canUseBrowserStorage()) return null;
  const raw = sessionStorage.getItem(PROFILE_KEY) || localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUserProfile;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (!canUseBrowserStorage()) return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PROFILE_KEY);
}
