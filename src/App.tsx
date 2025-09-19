import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { signOut as cognitoSignOut } from './auth/cognitoCustom'
import { isSessionValid, clearSession, setSessionChanged } from './auth/session'
import Dashboard from './pages/Dashboard'
import Universities from './pages/Universities'
import './App.css'
import Navbar from './components/Navbar'
import Welcome from './pages/Welcome'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  useEffect(() => {
    // Initial check
    setIsAuthenticated(isSessionValid())
    // Listen for auth change events
    const handler = () => setIsAuthenticated(isSessionValid())
    window.addEventListener('auth:changed', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('auth:changed', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const handleLogout = () => {
    try { cognitoSignOut(localStorage.getItem('userEmail') || '') } catch {}
    clearSession()
    setIsAuthenticated(false)
  }

  return (
    <Router>
      {isAuthenticated ? (
        <>
          <Navbar onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/universities" element={<Universities />} />
          </Routes>
        </>
      ) : (
        <Welcome onAuthenticated={() => { setIsAuthenticated(true); setSessionChanged() }} />
      )}
    </Router>
  )
}

export default App
