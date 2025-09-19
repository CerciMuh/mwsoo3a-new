export type CognitoConfig = {
  region: string;
  userPoolId: string;
  clientId: string;
  domain: string; // full https://...cognito.com
  redirectUri: string;
  logoutUri: string;
};

function getEnv(name: string, fallback = ''): string {
  return (import.meta as any).env?.[name] ?? fallback;
}

export function getCognitoConfig(): CognitoConfig {
  return {
    region: getEnv('VITE_COGNITO_REGION'),
    userPoolId: getEnv('VITE_COGNITO_USER_POOL_ID'),
    clientId: getEnv('VITE_COGNITO_CLIENT_ID'),
    domain: getEnv('VITE_COGNITO_DOMAIN'),
    redirectUri: getEnv('VITE_COGNITO_REDIRECT_URI') || window.location.origin,
    logoutUri: getEnv('VITE_COGNITO_LOGOUT_URI') || window.location.origin,
  };
}

function randString(len = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function buildAuthorizeUrl(cfg = getCognitoConfig()) {
  const state = randString(16);
  const nonce = randString(16);
  sessionStorage.setItem('cognito_state', state);
  sessionStorage.setItem('cognito_nonce', nonce);
  const authorize = new URL('/oauth2/authorize', cfg.domain);
  authorize.searchParams.set('client_id', cfg.clientId);
  authorize.searchParams.set('response_type', 'token id_token'); // implicit for fast start
  authorize.searchParams.set('scope', 'openid email profile');
  authorize.searchParams.set('redirect_uri', cfg.redirectUri);
  authorize.searchParams.set('state', state);
  authorize.searchParams.set('nonce', nonce);
  return authorize.toString();
}

export function buildLogoutUrl(cfg = getCognitoConfig()) {
  const logout = new URL('/logout', cfg.domain);
  logout.searchParams.set('client_id', cfg.clientId);
  logout.searchParams.set('logout_uri', cfg.logoutUri);
  return logout.toString();
}

export type CognitoTokens = {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  state?: string;
};

export function parseHashTokens(hash: string): CognitoTokens | null {
  if (!hash || hash[0] !== '#') return null;
  const params = new URLSearchParams(hash.slice(1));
  const access_token = params.get('access_token');
  const id_token = params.get('id_token');
  const token_type = params.get('token_type') || '';
  const expires_in = Number(params.get('expires_in') || '0');
  const state = params.get('state') || undefined;
  if (!access_token || !id_token) return null;
  return { access_token, id_token, token_type, expires_in, state };
}

export function decodeJwtPayload<T = any>(jwt: string): T | null {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function storeTokens(tok: CognitoTokens) {
  localStorage.setItem('cognito_access_token', tok.access_token);
  localStorage.setItem('cognito_id_token', tok.id_token);
  const expAt = Date.now() + (tok.expires_in || 3600) * 1000;
  localStorage.setItem('cognito_expires_at', String(expAt));
}

export function hasValidSession(): boolean {
  const access = localStorage.getItem('cognito_access_token');
  const expAt = Number(localStorage.getItem('cognito_expires_at') || '0');
  return Boolean(access && Date.now() < expAt);
}

export function clearSession() {
  localStorage.removeItem('cognito_access_token');
  localStorage.removeItem('cognito_id_token');
  localStorage.removeItem('cognito_expires_at');
}
