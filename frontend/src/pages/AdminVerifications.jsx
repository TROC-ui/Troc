import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import API from '../store/authStore'
import { useSEO } from '../hooks/useSEO'
import { useToastStore } from '../store/toastStore'
import { SkeletonBlock } from '../components/Skeleton'
import './AdminVerifications.css'

const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Vérifié',
  rejected: 'Refusé',
}

export default function AdminVerifications() {
  useSEO('Vérifications professionnelles')
  const { user } = useAuthStore()
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [actioningId, setActioningId] = useState(null)

  const load = () => {
    setLoading(true)
    API.get('/admin/verifications')
      .then((res) => setVerifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (user?.isAdmin) load()
    else setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isAdmin])

  const handleDecision = async (id, status) => {
    let rejectionReason
    if (status === 'rejected') {
      rejectionReason = window.prompt('Motif du refus (optionnel) :') || ''
    }
    setActioningId(id)
    try {
      await API.put(`/admin/verifications/${id}`, { status, rejectionReason })
      useToastStore.getState().show(status === 'approved' ? 'Vérification approuvée.' : 'Vérification refusée.')
      setVerifications((prev) => prev.map((v) => (v.id === id ? { ...v, status, rejectionReason } : v)))
    } catch (err) {
      useToastStore.getState().show(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error')
    } finally {
      setActioningId(null)
    }
  }

  if (!user?.isAdmin) {
    return (
      <section style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="wrap">
          <h1>Accès réservé.</h1>
          <p className="hero-lede" style={{ margin: '16px auto 0' }}>
            Cette page est réservée aux administrateurs du réseau.
          </p>
          <Link to="/dashboard" className="btn-ghost">← Retour à mon espace</Link>
        </div>
      </section>
    )
  }

  const filtered = verifications.filter((v) => v.status === tab)

  return (
    <>
      <section style={{ paddingTop: '40px', paddingBottom: '0', borderTop: 'none' }}>
        <div className="wrap">
          <div className="breadcrumb mono">
            <Link to="/">Accueil</Link> <span>/</span> <Link to="/dashboard">Mon espace</Link> <span>/</span> Vérifications
          </div>
        </div>
      </section>

      <header className="hero" style={{ paddingBottom: '30px' }}>
        <div className="wrap">
          <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 42px)' }}>Vérifications professionnelles.</h1>
          <p className="hero-lede" style={{ marginBottom: 0 }}>
            Numéros Adeli / RPPS soumis par les opticiens du réseau.
          </p>

          <div className="admin-tabs">
            {['pending', 'approved', 'rejected'].map((s) => (
              <button type="button" key={s} className={`pill-choice ${tab === s ? 'active' : ''}`} onClick={() => setTab(s)}>
                {STATUS_LABELS[s]} ({verifications.filter((v) => v.status === s).length})
              </button>
            ))}
          </div>
        </div>
      </header>

      <section style={{ paddingTop: '0' }}>
        <div className="wrap">
          {loading && (
            <div className="admin-verif-list">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} height="90px" style={{ marginBottom: '12px' }} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="section-note" style={{ maxWidth: 'none', textAlign: 'center' }}>
              Aucune demande {STATUS_LABELS[tab].toLowerCase()} pour le moment.
            </p>
          )}

          {!loading && filtered.length > 0 && (
            <div className="admin-verif-list">
              {filtered.map((v) => (
                <div key={v.id} className="admin-verif-row">
                  <div>
                    <Link to={`/profile/${v.user.id}`} className="seller-name">{v.user.shopName}</Link>
                    <div className="seller-sub mono">{v.user.email} · {v.user.address || 'Zone non précisée'}</div>
                    <div className="admin-verif-number mono">Numéro : {v.adeliNumber}</div>
                    {v.status === 'rejected' && v.rejectionReason && (
                      <div className="admin-verif-reason">Motif du refus : {v.rejectionReason}</div>
                    )}
                  </div>
                  {v.status === 'pending' && (
                    <div className="admin-verif-actions">
                      <button type="button" className="btn-primary" onClick={() => handleDecision(v.id, 'approved')} disabled={actioningId === v.id}>
                        Approuver
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => handleDecision(v.id, 'rejected')} disabled={actioningId === v.id}>
                        Refuser
                      </button>
                    </div>
                  )}
                  {v.status !== 'pending' && (
                    <div className={`status-pill ${v.status === 'approved' ? 'active' : ''}`}>{STATUS_LABELS[v.status]}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
