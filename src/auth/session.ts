export function isSessionValid(): boolean {
  const access = localStorage.getItem('cognito_access_token')
  const exp = Number(localStorage.getItem('cognito_expires_at') || '0')
  return Boolean(access && Date.now() < exp)
}

export function clearSession(): void {
  try {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('cognito_id_token')
    localStorage.removeItem('cognito_access_token')
    localStorage.removeItem('cognito_expires_at')
  } finally {
    // Notify listeners (App) to re-sync auth state
    window.dispatchEvent(new Event('auth:changed'))
  }
}

export function setSessionChanged(): void {
  window.dispatchEvent(new Event('auth:changed'))
}