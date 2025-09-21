import React, { useEffect, useState } from 'react'
import AuthModal from '../components/AuthModal'
import { apiGet } from '../services/client'

type Props = {
  onAuthenticated: () => void
}

const Welcome: React.FC<Props> = ({ onAuthenticated }) => {
  const [healthStatus, setHealthStatus] = useState<string>('checking...')
  const [showLogin, setShowLogin] = useState<boolean>(false)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Only check health in development
        if (import.meta.env.DEV) {
          const data = await apiGet<{ status: string }>('/health')
          setHealthStatus(data.status)
        } else {
          // In production, skip backend health check
          setHealthStatus('ok')
        }
      } catch {
        setHealthStatus('error - backend not connected')
      }
    }
    checkHealth()
  }, [])

  

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
              <img src="/logo-mwsoo3a.png" alt="mwsoo3a" width={72} height={72} className="mb-3 rounded-3 shadow-sm" />
              <div className="mb-3">
                <h1 className="display-5 fw-bold gradient-text mb-2">mwsoo3a</h1>
                <p className="text-muted mx-auto" style={{ maxWidth: 520 }}>
                  Your gateway to university life—discover universities, connect with peers, and unlock campus opportunities.
                </p>
              </div>

              {/* Floating decorative icons */}
              <div className="position-absolute top-50 start-0 translate-middle-y d-none d-md-block" style={{ left: '6%' }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="float-slow">
                  <path d="M3 7l9 4 9-4-9-4-9 4zm0 6l9 4 9-4" stroke="#1e3a8a" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="position-absolute top-50 end-0 translate-middle-y d-none d-lg-block" style={{ right: '6%' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="float-slower">
                  <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" stroke="#0b1f4d" strokeOpacity="0.22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="row g-3 justify-content-center py-2">
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="glass-card p-3 feature-rect hover-lift corner-accents text-start">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2" style={{ width: 40, height: 40, background: '#dbeafe' }}>
                      <svg width="18" height="18" className="text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0" />
                      </svg>
                    </div>
                    <div className="fw-semibold">Connect</div>
                    <div className="text-muted small">Meet peers and mentors across your academic network.</div>
                  </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="glass-card p-3 feature-rect hover-lift corner-accents text-start">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2" style={{ width: 40, height: 40, background: '#ede9fe' }}>
                      <svg width="18" height="18" className="text-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13M7.5 5C5.754 5 4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                      </svg>
                    </div>
                    <div className="fw-semibold">Learn</div>
                    <div className="text-muted small">Access curated resources tailored to your campus.</div>
                  </div>
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <div className="glass-card p-3 feature-rect hover-lift corner-accents text-start">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2" style={{ width: 40, height: 40, background: '#dcfce7' }}>
                      <svg width="18" height="18" className="text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="fw-semibold">Grow</div>
                    <div className="text-muted small">Unlock events, clubs, and opportunities around you.</div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <button onClick={() => { setShowLogin(true) }} className="btn btn-lg gradient-btn rounded-3 px-4">
                  <span className="d-inline-flex align-items-center gap-2">
                    Get Started
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>

              <div className="text-muted small mt-4">Made for students • Secure by AWS Cognito</div>
            </div>
          ) : null}
        </div>
      </div>
      {/* Auth modal overlay */}
      <AuthModal show={showLogin} onClose={() => setShowLogin(false)} onSuccess={onAuthenticated} />
    </div>
  )
}

export default Welcome
