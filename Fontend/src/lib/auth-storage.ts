export interface StoredUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  tenant_id: string;
  tenant_name: string;
  is_2fa_enabled: boolean;
  login_mfa_enabled: boolean;
}

export interface LoginAuthPayload {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  user?: StoredUserProfile;
  mfa_verified?: boolean;
}

const ACCESS_KEY = "auth_token";
const REFRESH_KEY = "refresh_token";
const PROFILE_KEY = "auth_user_profile";
const MFA_VERIFIED_KEY = "auth_mfa_verified";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, nowMs: number = Date.now()): boolean {
  const payload = decodeJwtPayload(token);
  const exp = typeof payload?.exp === "number" ? payload.exp : null;
  if (!exp) return true;
  return exp * 1000 <= nowMs;
}

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined";
}

function getPrimaryStorage(rememberMe: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

export function saveAuthSession(payload: LoginAuthPayload, rememberMe: boolean): void {
  if (!canUseBrowserStorage()) return;
  const token = String(payload.access_token || "").trim();
  if (!token || token === "undefined" || token === "null") {
    return;
  }

  const primary = getPrimaryStorage(rememberMe);
  const secondary = rememberMe ? sessionStorage : localStorage;

  secondary.removeItem(ACCESS_KEY);
  secondary.removeItem(REFRESH_KEY);
  secondary.removeItem(PROFILE_KEY);
  secondary.removeItem(MFA_VERIFIED_KEY);

  primary.setItem(ACCESS_KEY, token);
  if (payload.refresh_token) {
    primary.setItem(REFRESH_KEY, payload.refresh_token);
  }
  if (payload.user) {
    primary.setItem(PROFILE_KEY, JSON.stringify(payload.user));
  }
  if (payload.mfa_verified) {
    primary.setItem(MFA_VERIFIED_KEY, "true");
  }
}

export function readAccessToken(): string | null {
  if (!canUseBrowserStorage()) return null;
  const token = sessionStorage.getItem(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY);
  if (!token) return null;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    clearAuthSession();
    return null;
  }
  if (isTokenExpired(trimmed)) {
    clearAuthSession();
    return null;
  }
  return trimmed;
}

export function readUserProfile(): StoredUserProfile | null {
  if (!canUseBrowserStorage()) return null;
  const raw = sessionStorage.getItem(PROFILE_KEY) || localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredUserProfile>;
    const mfaVerified =
      sessionStorage.getItem(MFA_VERIFIED_KEY) === "true" ||
      localStorage.getItem(MFA_VERIFIED_KEY) === "true";

    if (!parsed.id || !parsed.email) {
      return null;
    }

    return {
      id: parsed.id,
      first_name: parsed.first_name || "",
      last_name: parsed.last_name || "",
      email: parsed.email,
      role: parsed.role || "member",
      tenant_id: parsed.tenant_id || "",
      tenant_name: parsed.tenant_name || "",
      is_2fa_enabled: Boolean(parsed.is_2fa_enabled) || mfaVerified,
      login_mfa_enabled:
        typeof parsed.login_mfa_enabled === "boolean"
          ? parsed.login_mfa_enabled
          : true,
    };
  } catch {
    return null;
  }
}

export function updateStoredUserProfile(updates: Partial<StoredUserProfile>): void {
  if (!canUseBrowserStorage()) return;
  const current = readUserProfile();
  if (!current) return;

  const next = { ...current, ...updates };
  const primaryHasProfile = sessionStorage.getItem(PROFILE_KEY) != null;
  const target = primaryHasProfile ? sessionStorage : localStorage;
  target.setItem(PROFILE_KEY, JSON.stringify(next));
}

export function clearAuthSession(): void {
  if (!canUseBrowserStorage()) return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(MFA_VERIFIED_KEY);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(MFA_VERIFIED_KEY);
}
