import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import API from '../store/authStore'
import { API_BASE } from '../utils/apiBase'
import Logo from '../components/Logo'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'
import { SkeletonBlock } from '../components/Skeleton'
import { useToastStore } from '../store/toastStore'
import PasswordField from '../components/PasswordField'
import './Profile.css'

function timeAgo(dateString) {
  if (!dateString) return ''
  const diffMs = Date.now() - new Date(dateString).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days < 30) return `${days} jour${days > 1 ? 's' : ''}`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mois`
  const years = Math.floor(months / 12)
  return `${years} an${years > 1 ? 's' : ''}`
}

export default function Profile() {
  const { userId } = useParams()
  const { user: authUser, isAuthenticated } = useAuthStore()
  const isOwnProfile = !userId || userId === authUser?.id
  const targetId = userId || authUser?.id
  useSEO(isOwnProfile ? 'Mon profil' : 'Profil opticien')
  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [myVerification, setMyVerification] = useState(null)
  const [verificationLoading, setVerificationLoading] = useState(true)
  const [adeliInput, setAdeliInput] = useState('')
  const [verificationSubmitting, setVerificationSubmitting] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [confianceRef, confianceVisible] = useScrollReveal()
  const [annoncesRef, annoncesVisible] = useScrollReveal()
  const [avisRef, avisVisible] = useScrollReveal()

  useEffect(() => {
    if (!targetId) {
      setLoading(false)
      return
    }
    Promise.all([
      fetch(`${API_BASE}/users/${targetId}`).then((res) => (res.ok ? res.json() : null)),
      fetch(`${API_BASE}/users/${targetId}/reviews`).then((res) => (res.ok ? res.json() : [])),
    ]).then(([userData, reviewsData]) => {
      setProfile(userData)
      setReviews(Array.isArray(reviewsData) ? reviewsData : [])
    }).finally(() => setLoading(false))
  }, [targetId])

  useEffect(() => {
    if (!isAuthenticated || isOwnProfile || !targetId) return
    API.get('/users/favorites/mine')
      .then((res) => setIsFavorited(res.data.some((u) => u.id === targetId)))
      .catch(() => {})
  }, [isAuthenticated, isOwnProfile, targetId])

  useEffect(() => {
    if (!isAuthenticated || !isOwnProfile) {
      setVerificationLoading(false)
      return
    }
    API.get('/users/verification/mine')
      .then((res) => setMyVerification(res.data))
      .catch(() => {})
      .finally(() => setVerificationLoading(false))
  }, [isAuthenticated, isOwnProfile])

  const handleSubmitVerification = async (e) => {
    e.preventDefault()
    if (!adeliInput.trim() || verificationSubmitting) return
    setVerificationSubmitting(true)
    try {
      const res = await API.put('/users/verification/mine', { adeliNumber: adeliInput.trim() })
      setMyVerification(res.data)
      useToastStore.getState().show('Numéro envoyé, en attente de validation.')
    } catch (err) {
      useToastStore.getState().show(err.response?.data?.message || "Erreur lors de l'envoi", 'error')
    } finally {
      setVerificationSubmitting(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordSubmitting) return
    if (newPassword !== confirmNewPassword) {
      useToastStore.getState().show('Les nouveaux mots de passe ne correspondent pas', 'error')
      return
    }
    setPasswordSubmitting(true)
    try {
      await API.put('/users/password', { currentPassword, newPassword })
      useToastStore.getState().show('Mot de passe mis à jour.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err) {
      useToastStore.getState().show(err.response?.data?.message || 'Erreur lors du changement de mot de passe', 'error')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (favoriteLoading) return
    setFavoriteLoading(true)
    try {
      const res = await API.post(`/users/${targetId}/favorite`)
      setIsFavorited(res.data.favorited)
      useToastStore.getState().show(res.data.favorited ? 'Confrère ajouté aux favoris.' : 'Confrère retiré des favoris.')
    } catch (err) {
      useToastStore.getState().show(err.response?.data?.message || 'Erreur lors de la mise à jour des favoris', 'error')
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (!isAuthenticated && isOwnProfile) {
    return (
      <section style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="wrap">
          <h1>Connectez-vous pour voir votre profil.</h1>
          <p className="hero-lede" style={{ margin: '16px auto 0' }}>
            Ce profil est réservé aux opticiens connectés.
          </p>
          <Link to="/login" className="btn-primary">Se connecter</Link>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <header className="hero" style={{ paddingBottom: '50px' }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
            <SkeletonBlock width="72px" height="72px" radius={20} />
            <div>
              <SkeletonBlock height="28px" width="240px" style={{ marginBottom: '10px' }} />
              <SkeletonBlock height="14px" width="160px" />
            </div>
          </div>
          <div className="trust-grid" style={{ marginTop: '40px' }}>
            <SkeletonBlock height="60px" />
            <SkeletonBlock height="60px" />
            <SkeletonBlock height="60px" />
          </div>
        </div>
      </header>
    )
  }

  if (!profile) {
    return (
      <section style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="wrap">
          <h1>Profil introuvable.</h1>
          <p className="hero-lede" style={{ margin: '16px auto 0' }}>
            Cet opticien n'existe pas ou n'est plus sur le réseau.
          </p>
          <Link to="/listings" className="btn-ghost">← Retour aux annonces</Link>
        </div>
      </section>
    )
  }

  const shopName = profile?.shopName || (isOwnProfile ? authUser?.shopName : null) || 'Boutique'
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null
  const activeListings = profile?.listings || []
  const completedExchanges = profile?.completedExchangesCount || 0

  return (
    <>
      <section style={{ paddingTop: '40px', paddingBottom: '0', borderTop: 'none' }}>
        <div className="wrap">
          <div className="breadcrumb mono">
            <Link to="/">Accueil</Link> <span>/</span>{' '}
            {isOwnProfile ? (
              <><Link to="/dashboard">Mon espace</Link> <span>/</span> Profil</>
            ) : (
              <><Link to="/listings">Annonces</Link> <span>/</span> {shopName}</>
            )}
          </div>
        </div>
      </section>

      <header className="hero" style={{ paddingBottom: '50px' }}>
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '28px', alignItems: 'center' }}>
              <div className="profile-avatar-lg">
                <Logo size="small" />
              </div>
              <div>
                <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 42px)', marginBottom: '10px' }}>
                  {shopName}
                  {profile?.verification?.status === 'approved' && (
                    <span className="verified-badge" title="Numéro professionnel vérifié">✓ Vérifié</span>
                  )}
                </h1>
                <div className="annonce-meta" style={{ marginTop: 0 }}>
                  <span className="meta">{(profile?.address || 'ZONE NON PRÉCISÉE').toUpperCase()}</span>
                  <span className="dim mono">Membre depuis {timeAgo(profile?.createdAt)}</span>
                </div>
              </div>
            </div>
            {isOwnProfile ? (
              <Link to="/dashboard" className="btn-ghost">Voir mon tableau de bord →</Link>
            ) : isAuthenticated ? (
              <button type="button" className={isFavorited ? 'btn-primary' : 'btn-ghost'} onClick={handleToggleFavorite} disabled={favoriteLoading}>
                {isFavorited ? '★ Confrère favori' : '☆ Ajouter aux favoris'}
              </button>
            ) : null}
          </div>

          <div className="trust-grid" style={{ marginTop: '40px' }}>
            <div>
              <div className="trust-num glint">{completedExchanges}</div>
              <div className="trust-label">échanges conclus avec des confrères depuis l'inscription.</div>
            </div>
            <div>
              <div className="trust-num glint">{avgRating ? `${avgRating}/5` : '—'}</div>
              <div className="trust-label">note moyenne reçue, sur la conformité et le délai d'envoi.</div>
            </div>
            <div>
              <div className="trust-num glint">{activeListings.length}</div>
              <div className="trust-label">annonces actives publiées dans le réseau.</div>
            </div>
          </div>
        </div>
      </header>

      <section ref={confianceRef} className={`tint-violet reveal-section ${confianceVisible ? 'reveal-visible' : ''}`} id="confiance">
        <div className="wrap">
          <div className="verify">
            <div className="verify-card">
              <div className="verify-row"><span>Historique d'échanges</span><span className="ok">{completedExchanges} confrères</span></div>
              <div className="verify-row"><span>Note entre pairs</span><span className="ok">{avgRating ? `${avgRating} / 5` : 'Pas encore noté'}</span></div>
              <div className="verify-row"><span>Zone d'échange</span><span className="ok">{profile?.address || 'Non précisée'}</span></div>
            </div>
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Badges de confiance
              </div>
              <h2 style={{ marginBottom: '20px' }}>Ce que le réseau sait de cet opticien.</h2>
              <ul>
                <li>{completedExchanges} échange{completedExchanges !== 1 ? 's' : ''} conclu{completedExchanges !== 1 ? 's' : ''} sur le réseau.</li>
                <li>{reviews.length} avis reçu{reviews.length !== 1 ? 's' : ''} de la part de confrères.</li>
              </ul>
            </div>
          </div>

          {isOwnProfile && !verificationLoading && (
            <div className="verification-panel">
              {!myVerification && (
                <form className="verification-form" onSubmit={handleSubmitVerification}>
                  <div className="section-label" style={{ marginBottom: '10px' }}>Vérification professionnelle</div>
                  <p className="section-note" style={{ marginBottom: '14px', maxWidth: 'none' }}>
                    Envoyez votre numéro Adeli / RPPS pour obtenir le badge "Vérifié" sur votre profil.
                  </p>
                  <div className="verification-form-row">
                    <input
                      type="text"
                      placeholder="Ex. 69 1234567 8"
                      value={adeliInput}
                      onChange={(e) => setAdeliInput(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary" disabled={verificationSubmitting}>
                      {verificationSubmitting ? 'Envoi…' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              )}

              {myVerification?.status === 'pending' && (
                <div className="verification-status verification-status--pending">
                  <span className="section-label" style={{ marginBottom: '6px' }}>Vérification professionnelle</span>
                  <p>Numéro {myVerification.adeliNumber} envoyé, en attente de validation par l'équipe Troc.</p>
                </div>
              )}

              {myVerification?.status === 'approved' && (
                <div className="verification-status verification-status--approved">
                  <span className="section-label" style={{ marginBottom: '6px' }}>Vérification professionnelle</span>
                  <p>✓ Numéro {myVerification.adeliNumber} vérifié — le badge est visible sur votre profil.</p>
                </div>
              )}

              {myVerification?.status === 'rejected' && (
                <form className="verification-form" onSubmit={handleSubmitVerification}>
                  <div className="section-label" style={{ marginBottom: '10px' }}>Vérification professionnelle</div>
                  <p className="verification-rejected-note">
                    Numéro {myVerification.adeliNumber} refusé{myVerification.rejectionReason ? ` — ${myVerification.rejectionReason}` : '.'}
                  </p>
                  <div className="verification-form-row">
                    <input
                      type="text"
                      placeholder="Renvoyer un numéro"
                      value={adeliInput}
                      onChange={(e) => setAdeliInput(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary" disabled={verificationSubmitting}>
                      {verificationSubmitting ? 'Envoi…' : 'Renvoyer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {isOwnProfile && (
            <form className="verification-form" onSubmit={handleChangePassword} style={{ marginTop: '24px' }}>
              <div className="section-label" style={{ marginBottom: '10px' }}>Sécurité</div>
              <p className="section-note" style={{ marginBottom: '14px', maxWidth: 'none' }}>
                Changez votre mot de passe. Vous devrez saisir votre mot de passe actuel.
              </p>
              <div className="verification-form-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                <PasswordField
                  label="Mot de passe actuel"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <PasswordField
                  label="Nouveau mot de passe"
                  placeholder="8 caractères minimum"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <PasswordField
                  label="Confirmer le nouveau mot de passe"
                  placeholder="8 caractères minimum"
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="submit" className="btn-primary" disabled={passwordSubmitting} style={{ alignSelf: 'flex-start' }}>
                  {passwordSubmitting ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section ref={annoncesRef} className={`tint-teal reveal-section ${annoncesVisible ? 'reveal-visible' : ''}`} id="annonces">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Annonces actives
              </div>
              <h2>Ce que {shopName} propose en ce moment.</h2>
            </div>
          </div>
          {activeListings.length === 0 ? (
            <div className="empty-listings">
              <p>Aucune annonce active pour le moment.</p>
              <Link to="/publish" className="btn-primary">Publier une annonce</Link>
            </div>
          ) : (
            <div className="listings">
              {activeListings.map((listing) => (
                <Link key={listing.id} to={`/listings/${listing.id}`} className="listing">
                  {listing.photos?.[0]?.url ? (
                    <div className="thumb thumb--photo">
                      <img src={listing.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                    </div>
                  ) : (
                    <div className="thumb" />
                  )}
                  <div className="meta">TROC · {(listing.location || 'VILLE NON PRÉCISÉE').toUpperCase()}</div>
                  <div className="title">{listing.title}</div>
                  <div className="sub">{listing.searchingFor || 'Ouvert à toute proposition'}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section ref={avisRef} className={`reveal-section ${avisVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Avis reçus
              </div>
              <h2>Ce que ses confrères en disent après échange.</h2>
            </div>
          </div>
          {reviews.length === 0 ? (
            <p className="section-note" style={{ maxWidth: 'none', textAlign: 'center' }}>
              Aucun avis reçu pour le moment.
            </p>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-head">
                    <div className="seller-avatar" style={{ width: '34px', height: '34px' }} />
                    <div>
                      <div className="seller-name" style={{ fontSize: '13.5px' }}>{review.reviewer?.shopName || 'Un confrère'}</div>
                      <div className="seller-sub mono">Échange conclu il y a {timeAgo(review.createdAt)}</div>
                    </div>
                  </div>
                  <p>{review.comment || `Note : ${review.rating}/5`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
