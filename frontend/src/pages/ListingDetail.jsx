import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuthStore } from '../store/authStore'
import API from '../store/authStore'
import { API_BASE } from '../utils/apiBase'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useListings } from '../hooks/useListings'
import { useSEO } from '../hooks/useSEO'
import { SkeletonBlock, SkeletonText } from '../components/Skeleton'
import { useToastStore } from '../store/toastStore'
import { parseListingTags } from '../utils/filterListings'
import './ListingDetail.css'

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function timeAgo(dateString) {
  if (!dateString) return ''
  const diffMs = Date.now() - new Date(dateString).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return "aujourd'hui"
  if (days === 1) return 'il y a 1 jour'
  if (days < 7) return `il y a ${days} jours`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? 'il y a 1 semaine' : `il y a ${weeks} semaines`
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [relatedRef, relatedVisible] = useScrollReveal()
  const { listings: allListings } = useListings()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [proposing, setProposing] = useState(false)
  const [selectedListingId, setSelectedListingId] = useState(null)
  const [proposeError, setProposeError] = useState('')
  const [proposeSubmitting, setProposeSubmitting] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useSEO(
    listing?.title,
    listing ? `${listing.title} — ${listing.indicativeValue ? `~${listing.indicativeValue}€` : 'valeur non précisée'}, à ${listing.location || 'échanger'} sur le réseau Troc.` : undefined
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`${API_BASE}/listings/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return
        setListing(data)
        if (data?.user?.id) {
          fetch(`${API_BASE}/users/${data.user.id}/reviews`)
            .then((res) => (res.ok ? res.json() : []))
            .then((r) => !cancelled && setReviews(Array.isArray(r) ? r : []))
            .catch(() => {})
        }
      })
      .catch(() => !cancelled && setListing(null))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    if (!isAuthenticated) return
    API.get('/listings/favorites/mine')
      .then((res) => setIsFavorited(res.data.some((l) => l.id === id)))
      .catch(() => {})
  }, [isAuthenticated, id])

  const handleToggleFavorite = async () => {
    if (favoriteLoading) return
    setFavoriteLoading(true)
    try {
      const res = await API.post(`/listings/${id}/favorite`)
      setIsFavorited(res.data.favorited)
      useToastStore.getState().show(res.data.favorited ? 'Annonce ajoutée aux favoris.' : 'Annonce retirée des favoris.')
    } catch (err) {
      useToastStore.getState().show(err.response?.data?.message || 'Erreur lors de la mise à jour des favoris', 'error')
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (loading) {
    return (
      <section style={{ paddingTop: '28px' }}>
        <div className="wrap">
          <div className="annonce-layout">
            <div>
              <SkeletonBlock height="380px" style={{ marginBottom: '20px' }} />
              <SkeletonBlock height="16px" width="220px" style={{ marginBottom: '16px' }} />
              <SkeletonBlock height="34px" width="70%" style={{ marginBottom: '24px' }} />
              <SkeletonBlock height="90px" />
            </div>
            <div className="annonce-side">
              <SkeletonBlock height="140px" />
              <SkeletonBlock height="120px" />
              <SkeletonBlock height="52px" radius={100} />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!listing) {
    return (
      <section style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="wrap">
          <h1>Annonce introuvable.</h1>
          <p className="hero-lede" style={{ margin: '16px auto 0' }}>
            Cette annonce n'existe plus ou a été retirée par son vendeur.
          </p>
          <Link to="/listings" className="btn-ghost">← Retour aux annonces</Link>
        </div>
      </section>
    )
  }

  const isOwner = isAuthenticated && listing.userId === user?.id
  const listingTags = parseListingTags(listing.tags)

  const myListings = isAuthenticated
    ? allListings.filter((l) => l.userId === user?.id && l.status === 'active' && l.id !== listing.id)
    : []
  const selectedListing = myListings.find((l) => l.id === selectedListingId) || null
  const pointsGapPreview = selectedListing
    ? Math.round(Math.abs((listing.indicativeValue || 0) - (selectedListing.indicativeValue || 0)))
    : null

  const handleSendProposal = async () => {
    if (!selectedListing) return
    setProposeError('')

    const listingValue = listing.indicativeValue || 0
    const myValue = selectedListing.indicativeValue || 0
    const pointsNeeded = Math.round(Math.abs(listingValue - myValue))
    const pointsDirection = myValue < listingValue ? 'sender_to_receiver' : (myValue > listingValue ? 'receiver_to_sender' : null)

    setProposeSubmitting(true)
    try {
      const res = await API.post('/exchanges', {
        listingId: listing.id,
        pointsNeeded,
        pointsDirection,
        proposedListingId: selectedListing.id,
      })
      useToastStore.getState().show('Proposition envoyée.')
      navigate(`/exchange/${res.data.id}`)
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'envoi de la proposition"
      setProposeError(message)
      useToastStore.getState().show(message, 'error')
    } finally {
      setProposeSubmitting(false)
    }
  }

  const related = allListings.filter((l) => l.id !== listing.id).slice(0, 3)
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null
  const photos = listing.photos || []

  return (
    <>
      <section style={{ paddingTop: '36px', paddingBottom: '0', borderTop: 'none' }}>
        <div className="wrap">
          <div className="breadcrumb mono">
            <Link to="/">Accueil</Link> <span>/</span> <Link to="/listings">Annonces</Link> <span>/</span> {listing.title}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: '28px' }}>
        <div className="wrap">
          <div className="annonce-layout">
            <div>
              <div className="annonce-gallery" style={{ height: '380px' }}>
                {[0, 1, 2].map((i) => (
                  photos[i] ? (
                    <div key={i} className={`photo-card__slot${i === 0 ? ' main' : ''}`} style={{ padding: 0, overflow: 'hidden' }}>
                      <img src={photos[i].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div key={i} className="photo-card__slot"><CameraIcon /></div>
                  )
                ))}
              </div>
              {photos.length === 0 && (
                <p className="section-note" style={{ marginTop: '10px', maxWidth: 'none' }}>
                  Le vendeur n'a pas encore ajouté de photo à cette annonce.
                </p>
              )}

              <div className="annonce-meta">
                <span className="meta">TROC · {(listing.location || 'VILLE NON PRÉCISÉE').toUpperCase()}</span>
                <span className="dim mono">Publié {timeAgo(listing.createdAt)}</span>
              </div>
              <div className="annonce-title-row">
                <h1 className="annonce-title">{listing.title}</h1>
                {isAuthenticated && !isOwner && (
                  <button
                    type="button"
                    className={`favorite-toggle ${isFavorited ? 'is-favorited' : ''}`}
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    aria-pressed={isFavorited}
                  >
                    {isFavorited ? '★' : '☆'}
                  </button>
                )}
              </div>

              <div className="rx-steps" style={{ marginTop: '32px' }}>
                <div className="rx-step">
                  <div className="rx-eye"><span className="box">M</span> Marque</div>
                  <h3 style={{ fontSize: '16px' }}>{listing.brand || 'Non précisée'}</h3>
                  {listing.reference && <p>Référence : {listing.reference}</p>}
                </div>
                <div className="rx-step">
                  <div className="rx-eye"><span className="box">T</span> Taille</div>
                  <h3 style={{ fontSize: '16px' }}>{listing.size || 'Non précisée'}</h3>
                </div>
                <div className="rx-step">
                  <div className="rx-eye"><span className="box">Ty</span> Typologie</div>
                  <h3 style={{ fontSize: '16px' }}>{listing.typology || 'Non précisée'}</h3>
                </div>
              </div>

              {(listing.shape || listing.material || listing.style || listingTags.length > 0) && (
                <div className="listing-attributes">
                  {listing.shape && <span className="listing-attribute">{listing.shape}</span>}
                  {listing.material && <span className="listing-attribute">{listing.material}</span>}
                  {listing.style && <span className="listing-attribute">{listing.style}</span>}
                  {listingTags.map((tag) => (
                    <span key={tag} className="listing-attribute listing-attribute--tag">{tag}</span>
                  ))}
                </div>
              )}

              {listing.description && (
                <div className="exchange-request">
                  <div className="section-label" style={{ marginBottom: '10px' }}>Notes du vendeur</div>
                  <p>{listing.description}</p>
                </div>
              )}

              <div className="exchange-request">
                <div className="section-label" style={{ marginBottom: '10px' }}>Recherché en retour</div>
                <p>{listing.searchingFor || 'Ouvert à toute proposition'}</p>
                {listing.wantedNotes && (
                  <p style={{ marginTop: '8px' }}>{listing.wantedNotes}</p>
                )}
              </div>
            </div>

            <div className="annonce-side">
              <div className="verify-card">
                <div className="section-label" style={{ marginBottom: '16px' }}>Valeur de l'échange</div>
                <div className="verify-row"><span>Valeur indicative</span><span className="ok">{listing.indicativeValue ? `~${listing.indicativeValue}€` : 'Non précisée'}</span></div>
                {selectedListing && (
                  <div className="verify-row"><span>Votre monture</span><span className="ok">{selectedListing.indicativeValue ? `~${selectedListing.indicativeValue}€` : 'Non précisée'}</span></div>
                )}
                <div className="verify-row"><span>Mode</span><span className="ok">Troc ou points</span></div>
                {selectedListing && (
                  <div className="verify-row"><span>Écart en points</span><span className="ok">{pointsGapPreview > 0 ? `${pointsGapPreview} points` : 'Aucun'}</span></div>
                )}
              </div>

              <Link to={`/profile/${listing.user?.id}`} className="seller-card">
                <div className="seller-head">
                  <div className="seller-avatar">
                    <Logo size="tiny" />
                  </div>
                  <div>
                    <div className="seller-name">{listing.user?.shopName || 'Vendeur'}</div>
                    <div className="seller-sub mono">{listing.location || 'Ville non précisée'}</div>
                  </div>
                </div>
                <div className="verify-row"><span>Avis reçus</span><span className="ok">{reviews.length} avis</span></div>
                <div className="verify-row"><span>Note entre pairs</span><span className="ok">{avgRating ? `${avgRating} / 5` : 'Pas encore noté'}</span></div>
              </Link>

              {isOwner && (
                <Link
                  to={`/listings/${listing.id}/edit`}
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }}
                >
                  Modifier l'annonce
                </Link>
              )}

              {!isOwner && !proposing && (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login')
                      return
                    }
                    setProposing(true)
                  }}
                >
                  Proposer un échange
                </button>
              )}

              {!isOwner && proposing && (
                <div className="proposal-panel">
                  <div className="proposal-panel-label">Votre monture proposée</div>

                  {myListings.length === 0 ? (
                    <div className="proposal-empty">
                      <p>Vous n'avez aucune annonce active à proposer.</p>
                      <Link to="/publish" className="btn-ghost">Publier une annonce →</Link>
                    </div>
                  ) : (
                    <div className="proposal-select-list">
                      {myListings.map((l) => (
                        <label key={l.id} className={`proposal-option ${selectedListingId === l.id ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="proposedListing"
                            value={l.id}
                            checked={selectedListingId === l.id}
                            onChange={() => setSelectedListingId(l.id)}
                          />
                          <div className="proposal-option-thumb">
                            {l.photos?.[0]?.url ? <img src={l.photos[0].url} alt="" /> : <span className="proposal-no-photo">📷</span>}
                          </div>
                          <div className="proposal-option-info">
                            <div className="proposal-option-title">{l.title}</div>
                            <div className="proposal-option-value">{l.indicativeValue ? `~${l.indicativeValue}€` : 'Valeur non précisée'}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {proposeError && <p className="form-error">{proposeError}</p>}

                  {myListings.length > 0 && (
                    <button
                      type="button"
                      className="btn-primary proposal-submit"
                      disabled={!selectedListingId || proposeSubmitting}
                      onClick={handleSendProposal}
                    >
                      {proposeSubmitting ? 'Envoi…' : 'Envoyer la proposition'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="tint-teal">
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="section-label">À voir aussi</div>
                <h2>D'autres annonces qui pourraient matcher.</h2>
              </div>
            </div>
            <div ref={relatedRef} className={`listings reveal-section ${relatedVisible ? 'reveal-visible' : ''}`}>
              {related.map((l) => (
                <Link key={l.id} to={`/listings/${l.id}`} className="listing">
                  {l.photos?.[0]?.url ? (
                    <div className="thumb thumb--photo">
                      <img src={l.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                    </div>
                  ) : (
                    <div className="thumb" />
                  )}
                  <div className="meta">TROC · {(l.location || 'VILLE NON PRÉCISÉE').toUpperCase()}</div>
                  <div className="title">{l.title}</div>
                  <div className="sub">{l.searchingFor || 'Ouvert à toute proposition'}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
