import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import API from '../store/authStore'
import Logo from '../components/Logo'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useListings } from '../hooks/useListings'
import { useExchanges } from '../hooks/useExchanges'
import { useSEO } from '../hooks/useSEO'
import { SkeletonBlock } from '../components/Skeleton'
import { useToastStore } from '../store/toastStore'
import './Dashboard.css'

const STATUS_LABELS = {
  PROPOSED: 'Proposé',
  DISCUSSION: 'En discussion',
  ACCEPTED: 'Accepté',
  SHIPPED: 'Expédié',
  RECEIVED: 'Reçu',
  CANCELLED: 'Annulé',
}

export default function Dashboard() {
  useSEO('Mon espace')
  const { user } = useAuthStore()
  const shopName = user?.shopName || 'Optique du Rhône'
  const [exchangesRef, exchangesVisible] = useScrollReveal()
  const [historiqueRef, historiqueVisible] = useScrollReveal()
  const [annoncesRef, annoncesVisible] = useScrollReveal()
  const { listings, loading, refetch } = useListings()
  const { exchanges, loading: exchangesLoading } = useExchanges()
  const [deletingId, setDeletingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [points, setPoints] = useState(null)

  const myListings = user ? listings.filter((l) => l.userId === user.id) : []
  const activeExchanges = exchanges.filter((ex) => !['RECEIVED', 'CANCELLED'].includes(ex.status))
  const completedExchanges = exchanges
    .filter((ex) => ex.status === 'RECEIVED')
    .sort((a, b) => new Date(b.receivedAt || b.updatedAt) - new Date(a.receivedAt || a.updatedAt))

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/users/${user.id}/points`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPoints(data?.balance ?? 0))
      .catch(() => setPoints(0))
  }, [user?.id])

  const handleDeleteClick = (id) => {
    if (confirmingId !== id) {
      setConfirmingId(id)
      return
    }
    handleDelete(id)
  }

  const handleDelete = async (id) => {
    setDeleteError('')
    setDeletingId(id)
    try {
      await API.delete(`/listings/${id}`)
      await refetch()
      useToastStore.getState().show('Annonce supprimée.')
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression'
      setDeleteError(message)
      useToastStore.getState().show(message, 'error')
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  return (
    <>
      <section style={{ paddingTop: '40px', paddingBottom: '0', borderTop: 'none' }}>
        <div className="wrap">
          <div className="breadcrumb mono">
            <Link to="/">Accueil</Link> <span>/</span> Mon espace
          </div>
        </div>
      </section>

      <header className="hero" style={{ paddingBottom: '40px' }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="eyebrow">
              <Logo size="tiny" />
              <span>{shopName}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 42px)' }}>Bonjour, <span className="glint">{shopName}</span>.</h1>
          </div>
          <div className="dashboard-header-actions">
            <div className="dashboard-utility-links">
              <Link to="/favoris" className="btn-ghost">☆ Mes favoris</Link>
              {user?.isAdmin && <Link to="/admin/verifications" className="btn-ghost">✓ Vérifications (admin)</Link>}
            </div>
            <Link to="/publish" className="btn-primary">Publier une nouvelle annonce</Link>
          </div>
        </div>
      </header>

      <section style={{ paddingTop: '56px', paddingBottom: '56px' }}>
        <div className="wrap">
          <div className="trust-grid">
            <div>
              <div className={`trust-num ${points < 0 ? 'trust-num--negative' : 'glint'}`}>{points === null ? '—' : `${points} pts`}</div>
              <div className="trust-label">solde de points disponible, utilisable sur votre prochain échange déséquilibré.</div>
              <Link to="/mes-points" className="btn-ghost" style={{ display: 'inline-block', marginTop: '4px' }}>
                Voir l'historique →
              </Link>
            </div>
            <div>
              <div className="trust-num glint">{activeExchanges.length}</div>
              <div className="trust-label">échanges actuellement en discussion avec des confrères.</div>
            </div>
            <div>
              <div className="trust-num glint">{myListings.length}</div>
              <div className="trust-label">annonces actives publiées dans le réseau.</div>
            </div>
          </div>
        </div>
      </section>

      <section ref={exchangesRef} className={`tint-teal reveal-section ${exchangesVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Mes échanges en cours
              </div>
              <h2>Ce qui attend une réponse ou une validation.</h2>
            </div>
          </div>
          {!exchangesLoading && activeExchanges.length === 0 && (
            <p className="section-note" style={{ maxWidth: 'none', textAlign: 'center' }}>
              Aucun échange en cours pour le moment.
            </p>
          )}
          {activeExchanges.length > 0 && (
            <div className="exchange-list">
              {activeExchanges.map((exchange) => {
                const isSender = exchange.senderId === user?.id
                const other = isSender ? exchange.receiver : exchange.sender
                const isActive = ['DISCUSSION', 'ACCEPTED'].includes(exchange.status)
                return (
                  <Link key={exchange.id} to={`/exchange/${exchange.id}`} className="exchange-row">
                    <div className="exchange-row-main">
                      <div className="seller-avatar">
                        <Logo size="tiny" />
                      </div>
                      <div>
                        <div className="seller-name">{other?.shopName || 'Confrère'}</div>
                        <div className="seller-sub mono">{exchange.listing?.title || 'Annonce'}</div>
                      </div>
                    </div>
                    <div className={`status-pill${isActive ? ' active' : ''}`}>{STATUS_LABELS[exchange.status] || exchange.status}</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section ref={historiqueRef} className={`reveal-section ${historiqueVisible ? 'reveal-visible' : ''}`} id="historique">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Historique de troc effectué
              </div>
              <h2>Les échanges que vous avez menés à terme.</h2>
            </div>
          </div>
          {!exchangesLoading && completedExchanges.length === 0 && (
            <p className="section-note" style={{ maxWidth: 'none', textAlign: 'center' }}>
              Aucun troc finalisé pour le moment.
            </p>
          )}
          {completedExchanges.length > 0 && (
            <div className="exchange-list">
              {completedExchanges.map((exchange) => {
                const isSender = exchange.senderId === user?.id
                const other = isSender ? exchange.receiver : exchange.sender
                const completedDate = exchange.receivedAt
                  ? new Date(exchange.receivedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
                  : null
                return (
                  <Link key={exchange.id} to={`/exchange/${exchange.id}`} className="exchange-row">
                    <div className="exchange-row-main">
                      <div className="seller-avatar">
                        <Logo size="tiny" />
                      </div>
                      <div>
                        <div className="seller-name">{other?.shopName || 'Confrère'}</div>
                        <div className="seller-sub mono">{exchange.listing?.title || 'Annonce'}{completedDate ? ` · ${completedDate}` : ''}</div>
                      </div>
                    </div>
                    <div className="status-pill">Terminé</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section ref={annoncesRef} className={`tint-violet reveal-section ${annoncesVisible ? 'reveal-visible' : ''}`} id="annonces">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Mes annonces
              </div>
              <h2>Ce que vous avez publié dans le réseau.</h2>
            </div>
            <Link to="/publish" className="btn-ghost">+ Nouvelle annonce</Link>
          </div>
          {deleteError && <p className="form-error">{deleteError}</p>}
          {loading && (
            <div className="listings">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <SkeletonBlock height="140px" style={{ marginBottom: '10px' }} />
                  <SkeletonBlock height="14px" width="70%" />
                </div>
              ))}
            </div>
          )}
          {!loading && myListings.length === 0 && (
            <div className="empty-listings">
              <p>Vous n'avez publié aucune annonce pour le moment.</p>
              <Link to="/publish" className="btn-primary">Publier ma première annonce</Link>
            </div>
          )}

          {myListings.length > 0 && (
            <div className="listings">
              {myListings.map((listing) => (
                <div key={listing.id} className="listing" style={{ position: 'relative' }}>
                  <Link to={`/listings/${listing.id}`}>
                    {listing.photos?.[0]?.url ? (
                      <div className="thumb thumb--photo">
                        <img src={listing.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                      </div>
                    ) : (
                      <div className="thumb" />
                    )}
                    <div className="meta">ACTIVE</div>
                    <div className="title">{listing.title}</div>
                    <div className="sub">{listing.searchingFor || 'Ouvert à toute proposition'}</div>
                  </Link>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Link to={`/listings/${listing.id}/edit`} className="btn-ghost" style={{ flex: 1, textAlign: 'center' }}>
                      Modifier
                    </Link>
                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ flex: 1, color: '#c0392b' }}
                      onClick={() => handleDeleteClick(listing.id)}
                      onBlur={() => confirmingId === listing.id && setConfirmingId(null)}
                      disabled={deletingId === listing.id}
                    >
                      {deletingId === listing.id
                        ? 'Suppression…'
                        : confirmingId === listing.id
                          ? 'Confirmer ?'
                          : 'Supprimer'}
                    </button>
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
