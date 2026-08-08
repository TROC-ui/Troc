import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/Logo'
import { useSEO } from '../hooks/useSEO'
import { SkeletonBlock } from '../components/Skeleton'
import './MyPoints.css'

const REASON_LABELS = {
  welcome_bonus: 'Points de bienvenue à l\'inscription',
  exchange_settlement: 'Règlement d\'écart lors d\'un échange',
  exchange_cancelled: 'Remboursement — échange annulé avant expédition',
}

const REASON_ICONS = {
  welcome_bonus: '🎁',
  exchange_settlement: '⇄',
  exchange_cancelled: '↩',
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MyPoints() {
  useSEO('Historique de mes points')
  const { user } = useAuthStore()
  const [points, setPoints] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/users/${user.id}/points`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setPoints)
      .finally(() => setLoading(false))
  }, [user?.id])

  const transactions = [...(points?.transactions || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <>
      <section style={{ paddingTop: '40px', paddingBottom: '0', borderTop: 'none' }}>
        <div className="wrap">
          <div className="breadcrumb mono">
            <Link to="/">Accueil</Link> <span>/</span> <Link to="/dashboard">Mon espace</Link> <span>/</span> Historique des points
          </div>
        </div>
      </section>

      <header className="hero" style={{ paddingBottom: '48px' }}>
        <div className="wrap">
          <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 42px)' }}>Historique de mes points.</h1>
          <p className="hero-lede" style={{ marginBottom: 0, maxWidth: '480px' }}>
            Chaque mouvement de points, dans l'ordre — d'où vient votre solde actuel.
          </p>

          {!loading && (
            <div className="points-balance-card">
              <div className="points-balance-label mono">Solde actuel</div>
              <div className={`points-balance-value ${points && points.balance < 0 ? 'trust-num--negative' : 'glint'}`}>
                {points ? `${points.balance} pts` : '—'}
              </div>
            </div>
          )}
        </div>
      </header>

      <section style={{ paddingTop: '64px' }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Mouvements
              </div>
              <h2>Le détail, du plus récent au plus ancien.</h2>
            </div>
          </div>

          {loading && (
            <div className="points-history-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} height="78px" style={{ marginBottom: '14px' }} />
              ))}
            </div>
          )}

          {!loading && transactions.length === 0 && (
            <p className="section-note" style={{ maxWidth: 'none', textAlign: 'center' }}>
              Aucun mouvement de points pour le moment.
            </p>
          )}

          {!loading && transactions.length > 0 && (
            <div className="points-history-list">
              {transactions.map((tx) => (
                <div key={tx.id} className="points-history-row">
                  <div className="points-history-main">
                    <div className="points-history-icon">{REASON_ICONS[tx.reason] || '•'}</div>
                    <div>
                      <div className="points-history-reason">{REASON_LABELS[tx.reason] || tx.reason}</div>
                      <div className="points-history-date mono">{formatDate(tx.createdAt)}</div>
                    </div>
                  </div>
                  <div className="points-history-amount-group">
                    <span className={`points-history-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount} pts
                    </span>
                    {tx.exchangeId && (
                      <Link to={`/exchange/${tx.exchangeId}`} className="btn-ghost points-history-link">
                        Voir l'échange →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
