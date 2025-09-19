import React, { useEffect, useState } from 'react'
import { signUp as cognitoSignUp, confirmSignUp as cognitoConfirm, resendConfirmationCode, signIn as cognitoSignIn, forgotPassword as cognitoForgot, confirmForgotPassword as cognitoConfirmForgot, isCognitoConfigured } from '../auth/cognitoCustom'
import { setSessionChanged } from '../auth/session'

type Props = {
  onAuthenticated: () => void
}

const Welcome: React.FC<Props> = ({ onAuthenticated }) => {
  const [healthStatus, setHealthStatus] = useState<string>('checking...')
  const [showLogin, setShowLogin] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [authMessage, setAuthMessage] = useState<string>('')
  const [authKind, setAuthKind] = useState<'success' | 'error' | 'info'>('info')
  const [code, setCode] = useState<string>('')
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'confirm' | 'forgot' | 'reset'>('login')
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [birthdate, setBirthdate] = useState<string>('')
  const [busy, setBusy] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:4000/health')
        const data = await response.json()
        setHealthStatus(data.status)
      } catch {
        setHealthStatus('error - backend not connected')
      }
    }
    checkHealth()
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthMessage('')
    setAuthKind('info')
    setBusy(true)
    try {
      if (!isCognitoConfigured()) {
        throw new Error('Cognito is not configured. Please set VITE_COGNITO_REGION, VITE_COGNITO_USER_POOL_ID, and VITE_COGNITO_CLIENT_ID in your .env file and restart the dev server.')
      }
      if (authMode === 'register') {
        const attrs: Record<string,string> = {}
        if (firstName) attrs['given_name'] = firstName
        if (lastName) attrs['family_name'] = lastName
        if (birthdate) attrs['birthdate'] = birthdate
        const res = await cognitoSignUp(email, password, attrs)
        if (res.userConfirmed) {
          setAuthMessage('Account created and already confirmed. You can sign in now.')
          setAuthKind('success')
          setAuthMode('login')
        } else {
          setAuthMessage('Account created. We sent you a verification code via email. Enter it to confirm.')
          setAuthKind('info')
          setAuthMode('confirm')
        }
      } else if (authMode === 'confirm') {
        await cognitoConfirm(email, code)
        setAuthMessage('Email verified successfully. Please sign in.')
        setAuthKind('success')
        setAuthMode('login')
        setCode('')
      } else if (authMode === 'forgot') {
        await cognitoForgot(email)
        setAuthMessage('We sent you a reset code. Enter it below with your new password.')
        setAuthKind('info')
        setAuthMode('reset')
      } else if (authMode === 'reset') {
        await cognitoConfirmForgot(email, code, password)
        setAuthMessage('Password reset successful. Please sign in.')
        setAuthKind('success')
        setAuthMode('login')
        setCode('')
        setPassword('')
      } else {
        const session = await cognitoSignIn(email, password)
        localStorage.setItem('cognito_id_token', session.idToken)
        localStorage.setItem('cognito_access_token', session.accessToken)
        localStorage.setItem('cognito_expires_at', String(session.expiresAt))
        localStorage.setItem('userEmail', email)
        setAuthMessage('Login successful!')
        setAuthKind('success')
  onAuthenticated()
  setSessionChanged()
      }
    } catch (error: any) {
      let msg = error?.message || 'Authentication error'
      if (typeof msg === 'string' && msg.includes('SECRET_HASH')) {
        msg = 'Cognito App Client has a secret. Create an App Client WITHOUT a client secret (public client) and update VITE_COGNITO_CLIENT_ID.'
      }
      setAuthMessage(msg)
      setAuthKind('error')
    }
    setBusy(false)
  }

  return (
    <div
      className="min-vh-100 position-relative"
      style={{ background: 'linear-gradient(135deg, #eaf0ff 0%, #e9ecff 50%, #eef 100%)' }}
    >
      <div className="position-absolute top-0 start-0 w-100 h-100 bg-grid-pattern" style={{ opacity: 0.06 }} />
      <div className="hero-overlay" />
      <div className="position-relative min-vh-100 d-flex align-items-center justify-content-center px-3">
        <div className="container" style={{ maxWidth: 480 }}>
          {/* Health indicator */}
          <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            <div className={`px-3 py-1 rounded-pill small border ${healthStatus === 'ok' ? 'bg-success-subtle text-success-emphasis border-success-subtle' : 'bg-danger-subtle text-danger-emphasis border-danger-subtle'}`}>
              <div className="d-flex align-items-center gap-2">
                <span className="rounded-circle" style={{ width: 8, height: 8, background: healthStatus === 'ok' ? '#22c55e' : '#ef4444' }} />
                {healthStatus === 'ok' ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>

          {!showLogin ? (
            <div className="text-center animate-fade-in">
              <div className="rounded-3 d-flex align-items-center justify-content-center shadow-sm mx-auto mb-3" style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16M10 21v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
                </svg>
              </div>
              <div className="mb-4">
                <h1 className="display-6 fw-bold gradient-text mb-2">mwsoo3a</h1>
                <p className="text-muted small mx-auto" style={{ maxWidth: 360 }}>Your gateway to university life. Connect, learn, and grow with your academic community.</p>
              </div>
              <div className="row row-cols-3 g-3 py-3">
                <div className="col text-center">
                  <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 36, height: 36, background: '#dbeafe' }}>
                    <svg width="18" height="18" className="text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0" />
                    </svg>
                  </div>
                  <div className="small fw-semibold text-secondary">Connect</div>
                </div>
                <div className="col text-center">
                  <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 36, height: 36, background: '#ede9fe' }}>
                    <svg width="18" height="18" className="text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13M7.5 5C5.754 5 4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                    </svg>
                  </div>
                  <div className="small fw-semibold text-secondary">Learn</div>
                </div>
                <div className="col text-center">
                  <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 36, height: 36, background: '#dcfce7' }}>
                    <svg width="18" height="18" className="text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="small fw-semibold text-secondary">Grow</div>
                </div>
              </div>
              <button onClick={() => { setShowLogin(true); setAuthMode('login'); setAuthMessage(''); }} className="btn btn-lg gradient-btn rounded-3 px-4">
                <span className="d-inline-flex align-items-center gap-2">
                  Get Started
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          ) : (
            <div className="glass-card shadow-lg rounded-3 p-4 border animate-slide-up">
              <div className="text-center mb-4">
                <div className="rounded-3 d-flex align-items-center justify-content-center mx-auto mb-2" style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16M10 21v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
                  </svg>
                </div>
                <h2 className="h5 fw-bold mb-1">{
                  authMode === 'register' ? 'Join mwsoo3a' :
                  authMode === 'confirm' ? 'Confirm your email' :
                  authMode === 'forgot' ? 'Forgot password' :
                  authMode === 'reset' ? 'Reset password' : 'Welcome Back'
                }</h2>
                <p className="text-muted small mb-0">
                  {authMode === 'register' ? 'Create your account and verify with the code we send you'
                    : authMode === 'confirm' ? 'Enter the 6-digit verification code sent to your email'
                    : authMode === 'forgot' ? 'Enter your email to receive a password reset code'
                    : authMode === 'reset' ? 'Enter the reset code and your new password'
                    : 'Sign in to access your university dashboard'}
                </p>
              </div>

              <form onSubmit={handleAuth}>
                {authMode === 'register' && (
                  <>
                    <div className="row g-2 mb-3">
                      <div className="col">
                        <label htmlFor="firstName" className="form-label small">First name</label>
                        <input id="firstName" className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" required />
                      </div>
                      <div className="col">
                        <label htmlFor="lastName" className="form-label small">Last name</label>
                        <input id="lastName" className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="birthdate" className="form-label small">Birthdate</label>
                      <input type="date" id="birthdate" className="form-control" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required />
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label htmlFor="email" className="form-label small">University Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm0 0v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-9 9" />
                      </svg>
                    </span>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-control" placeholder="your.email@university.edu" />
                  </div>
                </div>

                {(authMode === 'login' || authMode === 'register' || authMode === 'reset') && (
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label small">{authMode === 'reset' ? 'New Password' : 'Password'}</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0 2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
                        </svg>
                      </span>
                      <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-control" placeholder={authMode === 'reset' ? 'Enter new password' : 'Enter your password'} />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                )}

                {(authMode === 'confirm' || authMode === 'reset') && (
                  <div className="mb-3">
                    <label htmlFor="code" className="form-label small">Verification Code</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">#</span>
                      <input type="text" id="code" value={code} onChange={(e) => setCode(e.target.value)} required className="form-control" placeholder="Enter the 6-digit code" />
                    </div>
                  </div>
                )}

                {authMessage && (
                  <div className={`small p-3 rounded-3 border ${authKind === 'success' ? 'bg-success-subtle text-success-emphasis border-success-subtle' : authKind === 'error' ? 'bg-danger-subtle text-danger-emphasis border-danger-subtle' : 'bg-info-subtle text-info-emphasis border-info-subtle'}`}>
                    <div className="d-flex align-items-center gap-2">
                      <svg width="16" height="16" className="flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {authKind === 'success' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                        ) : authKind === 'error' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.062 19h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.722 2.5z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 18.5A6.5 6.5 0 1 1 12 5.5a6.5 6.5 0 0 1 0 13z" />
                        )}
                      </svg>
                      {authMessage}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn gradient-btn w-100" disabled={busy}>
                  {authMode === 'register' ? 'Create Account' :
                   authMode === 'confirm' ? 'Confirm Email' :
                   authMode === 'forgot' ? 'Send Reset Code' :
                   authMode === 'reset' ? 'Reset Password' : 'Sign In'}
                </button>
              </form>

              <div className="mt-4 text-center">
                {authMode === 'login' && (
                  <>
                    <button onClick={() => { setAuthMode('register'); setAuthMessage(''); }} className="btn btn-link p-0 me-3" disabled={busy}>Don't have an account? Create one</button>
                    <button onClick={() => { setAuthMode('forgot'); setAuthMessage(''); }} className="btn btn-link p-0" disabled={busy}>Forgot password?</button>
                  </>
                )}
                {authMode === 'register' && (
                  <button onClick={() => { setAuthMode('login'); setAuthMessage(''); }} className="btn btn-link p-0" disabled={busy}>Already have an account? Sign in</button>
                )}
                {(authMode === 'confirm' || authMode === 'forgot' || authMode === 'reset') && (
                  <button onClick={() => { setAuthMode('login'); setAuthMessage(''); setCode(''); }} className="btn btn-link p-0" disabled={busy}>Back to sign in</button>
                )}

                {authMode === 'confirm' && (
                  <div className="mt-2">
                    <button onClick={async () => {
                      setBusy(true)
                      setAuthMessage('Resending verification code...')
                      setAuthKind('info')
                      try {
                        await resendConfirmationCode(email)
                        setAuthMessage('Verification code resent. Check your email.')
                        setAuthKind('success')
                      } catch (e: any) {
                        setAuthMessage(e?.message || 'Failed to resend code')
                        setAuthKind('error')
                      } finally {
                        setBusy(false)
                      }
                    }} className="btn btn-link p-0" disabled={busy}>Resend code</button>
                  </div>
                )}

                <div className="mt-2">
                  <button onClick={() => setShowLogin(false)} className="btn btn-link text-muted p-0 d-inline-flex align-items-center gap-1">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0 7-7m-7 7h18" />
                    </svg>
                    Back to home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Welcome
