import React from 'react'
import { Link, NavLink } from 'react-router-dom'

type NavbarProps = {
  onLogout: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : ''
  const initial = email ? email.charAt(0).toUpperCase() : 'U'
  const handleLogout = () => onLogout()

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top navbar-navy" style={{zIndex: 40}}>
      <div className="container-fluid">
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2">
          <img src="/logo-mwsoo3a.png" alt="mwsoo3a logo" width={28} height={28} style={{ borderRadius: 6, objectFit: 'cover' }} />
          <strong>mwsoo3a</strong>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/dashboard" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/universities" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Universities</NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="dropdown">
              <button className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-2" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
                <span className="d-inline-flex align-items-center justify-content-center rounded-circle text-white" style={{width: 24, height: 24, background: 'linear-gradient(135deg,var(--primary-start),var(--primary-end))'}}>
                  {initial}
                </span>
                <span className="d-none d-sm-inline">
                  {email.split('@')[0]}
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                <li className="dropdown-item text-muted small">
                  @{email.split('@')[1]}
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
