import { useMemo, useState } from 'react'
import { signUp as cognitoSignUp, confirmSignUp as cognitoConfirm, resendConfirmationCode, signIn as cognitoSignIn, forgotPassword as cognitoForgot, confirmForgotPassword as cognitoConfirmForgot } from '../auth/cognitoCustom'
import { setSessionChanged } from '../auth/session'

type Mode = 'login' | 'register' | 'confirm' | 'forgot' | 'reset'

type Props = {
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ show, onClose, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [givenName, setGivenName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null)
  const [showPwd, setShowPwd] = useState(false)

  const title = useMemo(() => {
    switch (mode) {
      case 'register': return 'Create your account'
      case 'confirm': return 'Confirm your email'
      case 'forgot': return 'Forgot your password'
      case 'reset': return 'Reset your password'
      default: return 'Welcome back'
    }
  }, [mode])

  const resetAll = () => {
    setMode('login')
    setEmail('')
    setPassword('')
    setGivenName('')
    setFamilyName('')
    setBirthdate('')
    setCode('')
    setMsg(null)
  }

  const closeAndReset = () => { resetAll(); onClose() }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setMsg(null)
    try {
      const attrs: Record<string, string> = {}
      if (givenName) attrs['given_name'] = givenName
      if (familyName) attrs['family_name'] = familyName
      if (birthdate) attrs['birthdate'] = birthdate
      const res = await cognitoSignUp(email, password, attrs)
      if (res.userConfirmed) {
        setMsg({ type: 'success', text: 'Account confirmed. You can sign in now.' })
        setMode('login')
      } else {
        setMsg({ type: 'success', text: 'Confirmation code sent to your email.' })
        setMode('confirm')
      }
    } catch (err: any) {
      setMsg({ type: 'danger', text: err?.message || 'Sign up failed.' })
    } finally { setSubmitting(false) }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setMsg(null)
    try {
      await cognitoConfirm(email, code)
      setMsg({ type: 'success', text: 'Email confirmed. Please sign in.' })
      setMode('login')
      setCode('')
    } catch (err: any) {
      setMsg({ type: 'danger', text: err?.message || 'Confirmation failed.' })
    } finally { setSubmitting(false) }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setMsg(null)
    try {
      const session = await cognitoSignIn(email, password)
      localStorage.setItem('cognito_id_token', session.idToken)
      localStorage.setItem('cognito_access_token', session.accessToken)
      if (session.refreshToken) localStorage.setItem('cognito_refresh_token', session.refreshToken)
      localStorage.setItem('cognito_expires_at', String(session.expiresAt))
      localStorage.setItem('userEmail', email)
      setMsg({ type: 'success', text: 'Signed in.' })
      setSessionChanged()
      onSuccess?.()
      closeAndReset()
    } catch (err: any) {
      setMsg({ type: 'danger', text: err?.message || 'Sign in failed.' })
    } finally { setSubmitting(false) }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setMsg(null)
    try {
      await cognitoForgot(email)
      setMsg({ type: 'success', text: 'Reset code sent to your email.' })
      setMode('reset')
    } catch (err: any) {
      setMsg({ type: 'danger', text: err?.message || 'Request failed.' })
    } finally { setSubmitting(false) }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setMsg(null)
    try {
      await cognitoConfirmForgot(email, code, password)
      setMsg({ type: 'success', text: 'Password reset. Please sign in.' })
      setMode('login')
      setCode('')
      setPassword('')
    } catch (err: any) {
      setMsg({ type: 'danger', text: err?.message || 'Reset failed.' })
    } finally { setSubmitting(false) }
  }

  async function handleResend() {
    setSubmitting(true); setMsg(null)
    try {
      await resendConfirmationCode(email)
      setMsg({ type: 'success', text: 'Code resent. Check your email.' })
    } catch (err: any) {
      setMsg({ type: 'danger', text: err?.message || 'Could not resend code.' })
    } finally { setSubmitting(false) }
  }

  if (!show) return null

  return (
    <div>
      {/* Backdrop behind modal */}
      <div className="modal-backdrop show" onClick={closeAndReset} style={{ zIndex: 1050 }} />
      <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true" style={{ zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content glass-card">
          <div className="modal-header border-0">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={closeAndReset} />
          </div>
          <div className="modal-body">
            {msg && <div className={`alert alert-${msg.type} mb-3`}>{msg.text}</div>}

            {mode === 'register' && (
              <form onSubmit={handleRegister}>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">First name</label>
                    <input className="form-control" value={givenName} onChange={e => setGivenName(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last name</label>
                    <input className="form-control" value={familyName} onChange={e => setFamilyName(e.target.value)} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Birthdate</label>
                    <input type="date" className="form-control" value={birthdate} onChange={e => setBirthdate(e.target.value)} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">University Email</label>
                    <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <input className="form-control" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPwd(s => !s)}>{showPwd ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>
                </div>
                <div className="d-grid gap-2 mt-3">
                  <button className="btn gradient-btn" disabled={submitting}>{submitting ? 'Creating...' : 'Create account'}</button>
                  <button type="button" className="btn btn-link" onClick={() => setMode('login')}>Have an account? Sign in</button>
                </div>
              </form>
            )}

            {mode === 'confirm' && (
              <form onSubmit={handleConfirm}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirmation code</label>
                  <input className="form-control" value={code} onChange={e => setCode(e.target.value)} required />
                </div>
                <div className="d-grid gap-2">
                  <button className="btn gradient-btn" disabled={submitting}>{submitting ? 'Confirming...' : 'Confirm'}</button>
                  <button type="button" className="btn btn-link" onClick={handleResend} disabled={submitting}>Resend code</button>
                  <button type="button" className="btn btn-link" onClick={() => setMode('login')}>Back to sign in</button>
                </div>
              </form>
            )}

            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="mb-1">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input className="form-control" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPwd(s => !s)}>{showPwd ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <div className="text-end">
                  <button type="button" className="btn btn-link p-0" onClick={() => setMode('forgot')}>Forgot password?</button>
                </div>
                <div className="d-grid gap-2 mt-2">
                  <button className="btn gradient-btn" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
                  <button type="button" className="btn btn-link" onClick={() => setMode('register')}>Create an account</button>
                </div>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgot}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="d-grid gap-2">
                  <button className="btn gradient-btn" disabled={submitting}>{submitting ? 'Sending...' : 'Send reset code'}</button>
                  <button type="button" className="btn btn-link" onClick={() => setMode('login')}>Back to sign in</button>
                </div>
              </form>
            )}

            {mode === 'reset' && (
              <form onSubmit={handleReset}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Reset code</label>
                  <input className="form-control" value={code} onChange={e => setCode(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">New password</label>
                  <div className="input-group">
                    <input className="form-control" type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPwd(s => !s)}>{showPwd ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <div className="d-grid gap-2 mt-3">
                  <button className="btn gradient-btn" disabled={submitting}>{submitting ? 'Resetting...' : 'Reset password'}</button>
                  <button type="button" className="btn btn-link" onClick={() => setMode('login')}>Back to sign in</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
