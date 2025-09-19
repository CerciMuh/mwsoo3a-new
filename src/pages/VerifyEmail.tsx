import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

const VerifyEmail: React.FC = () => {
  const query = useQuery()
  const token = query.get('token') || ''
  const [status, setStatus] = useState<'idle'|'ok'|'error'|'loading'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const run = async () => {
      if (!token) { setStatus('error'); setMessage('Missing verification token.'); return }
      setStatus('loading')
      try {
        const res = await fetch(`http://localhost:4000/verify-email?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (res.ok) {
          setStatus('ok')
          setMessage(data.message || 'Email verified successfully.')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed.')
        }
      } catch (e) {
        setStatus('error')
        setMessage('Network error.')
      }
    }
    run()
  }, [token])

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                {status === 'loading' && (
                  <div className="spinner-border text-primary" role="status" />
                )}
                {status === 'ok' && (
                  <svg width="32" height="32" className="text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                )}
                {status === 'error' && (
                  <svg width="32" height="32" className="text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.062 19h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.722 2.5z" />
                  </svg>
                )}
              </div>
              <h5 className="mb-2">Email Verification</h5>
              <p className="text-muted mb-4">{message || 'Verifying your email...'}</p>
              <div className="d-flex justify-content-center gap-2">
                <Link to="/" className="btn btn-outline-secondary btn-sm">Home</Link>
                <Link to="/dashboard" className="btn gradient-btn btn-sm">Go to Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
