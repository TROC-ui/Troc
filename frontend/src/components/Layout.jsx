import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import API from '../store/authStore'
import { API_BASE } from '../utils/apiBase'
import { useToastStore } from '../store/toastStore'
import Logo from './Logo'
import ToastContainer from './ToastContainer'
import './Layout.css'

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [pointsBalance, setPointsBalance] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setPointsBalance(null)
      return
    }
    fetch(`${API_BASE}/users/${user.id}/points`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPointsBalance(data?.balance ?? 0))
      .catch(() => setPointsBalance(0))
  }, [isAuthenticated, user?.id])

  // Notifie une seule fois quand le compte vient d'être vérifié (statut
  // approuvé pas encore vu sur cet appareil) — évite de devoir aller
  // consulter son profil pour s'en apercevoir.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return
    API.get('/users/verification/mine')
      .then((res) => {
        const status = res.data?.status
        const seenKey = `verificationNotified:${user.id}`
        if (status === 'approved' && localStorage.getItem(seenKey) !== 'approved') {
          useToastStore.getState().show('Votre compte a été vérifié ✅', 'success')
          localStorage.setItem(seenKey, 'approved')
        } else if (status !== 'approved') {
          localStorage.removeItem(seenKey)
        }
      })
      .catch(() => {})
  }, [isAuthenticated, user?.id])

  // Ferme le menu mobile à chaque changement de route, et bloque le scroll
  // du fond pendant qu'il est ouvert.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <div className="layout">
      {/* Navigation */}
      <nav>
        <div className="wrap">
          <Link to="/" className="brand">
            <Logo size="small" />
            <div className="brand-text">
              <div className="brand-name">Troc</div>
            </div>
          </Link>

          <div className="nav-links">
            <Link to="/">Accueil</Link>
            <Link to="/listings">Annonces</Link>
            <Link to="/points">Les points</Link>
            {isAuthenticated && <Link to="/dashboard">Mon espace</Link>}
            {isAuthenticated && pointsBalance !== null && (
              <span className="nav-points-balance">{pointsBalance} pts</span>
            )}
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Link to="/publish" className="nav-cta">Publier</Link>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', color: 'var(--paper-dim)', cursor: 'pointer', fontSize: '14px' }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-cta">Connexion</Link>
                <Link to="/signup" className="nav-cta">S'inscrire</Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="nav-menu-toggle"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-drawer"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`nav-menu-icon ${menuOpen ? 'is-open' : ''}`} />
          </button>
        </div>

        <div
          id="nav-mobile-drawer"
          className={`nav-mobile-drawer ${menuOpen ? 'is-open' : ''}`}
          role="dialog"
          aria-modal="true"
          hidden={!menuOpen}
        >
          <Link to="/">Accueil</Link>
          <Link to="/listings">Annonces</Link>
          <Link to="/points">Les points</Link>
          {isAuthenticated && <Link to="/dashboard">Mon espace</Link>}
          {isAuthenticated && pointsBalance !== null && (
            <span className="nav-points-balance nav-points-balance--mobile">{pointsBalance} pts</span>
          )}

          <div className="nav-mobile-actions">
            {isAuthenticated ? (
              <>
                <Link to="/publish" className="nav-cta">Publier</Link>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-cta">Connexion</Link>
                <Link to="/signup" className="nav-cta">S'inscrire</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="wrap">
          <p>&copy; 2026 Troc — Réseau d'échange entre opticiens. Tous droits réservés.</p>
          <div className="footer-legal-links">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/cgu">CGU</Link>
            <Link to="/confidentialite">Politique de confidentialité</Link>
          </div>
        </div>
      </footer>

      <ToastContainer />
    </div>
  )
}
