import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import API from '../store/authStore'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'
import { SkeletonBlock } from '../components/Skeleton'
import { useToastStore } from '../store/toastStore'
import './Exchange.css'

const STATUS_SEQUENCE = ['PROPOSED', 'DISCUSSION', 'ACCEPTED', 'SHIPPED', 'RECEIVED']
const STATUS_LABELS = {
  PROPOSED: 'Proposé',
  DISCUSSION: 'En discussion',
  ACCEPTED: 'Validé',
  SHIPPED: 'Expédié',
  RECEIVED: 'Reçu',
  CANCELLED: 'Annulé',
}

export default function Exchange() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  useSEO('Échange en cours')
  const [exchange, setExchange] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [receptionPhoto, setReceptionPhoto] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [layoutRef, layoutVisible] = useScrollReveal()
  const socketRef = useRef(null)
  const [review, setReview] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(true)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewDraft, setReviewDraft] = useState({ rating: 0, comment: '', compliance: null, shippingSpeed: null, itemCondition: null })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    API.get(`/exchanges/${id}`)
      .then((res) => !cancelled && setExchange(res.data))
      .catch(() => !cancelled && setExchange(null))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    let cancelled = false
    API.get(`/exchanges/${id}/review`)
      .then((res) => !cancelled && setReview(res.data))
      .catch(() => !cancelled && setReview(null))
      .finally(() => !cancelled && setReviewLoading(false))
    return () => { cancelled = true }
  }, [id])

  useEffect(() => {
    // Le serveur Socket.io tourne sur le même backend que l'API REST — on
    // dérive son URL de la même variable d'environnement, pour ne pas avoir
    // à maintenir deux réglages séparés en production.
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000')
    socketRef.current = socket
    socket.emit('join_exchange', id)
    socket.on('new_message', (message) => {
      if (message.exchangeId !== id) return
      setExchange((prev) => {
        if (!prev) return prev
        if (prev.messages.some((m) => m.id === message.id)) return prev
        return { ...prev, messages: [...prev.messages, message] }
      })
    })
    return () => socket.disconnect()
  }, [id])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!draft.trim() || sending) return
    setSending(true)
    try {
      const res = await API.post(`/exchanges/${id}/messages`, { content: draft.trim() })
      setExchange((prev) => ({ ...prev, messages: [...prev.messages, res.data] }))
      socketRef.current?.emit('send_message', { ...res.data, exchangeId: id })
      setDraft('')
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'envoi du message"
      setError(message)
      useToastStore.getState().show(message, 'error')
    } finally {
      setSending(false)
    }
  }

  const handleAdvanceStatus = async ({ skipPointsCompensation = false } = {}) => {
    const currentIndex = STATUS_SEQUENCE.indexOf(exchange.status)
    const next = STATUS_SEQUENCE[currentIndex + 1]
    if (!next) return
    try {
      const res = await API.put(`/exchanges/${id}/status`, { status: next, skipPointsCompensation })
      setExchange((prev) => ({ ...prev, status: res.data.status }))
      if (next === 'ACCEPTED') {
        useToastStore.getState().show(
          skipPointsCompensation ? 'Échange validé sans compensation.' : 'Échange validé — soldes de points mis à jour.'
        )
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la mise à jour du statut'
      setError(message)
      useToastStore.getState().show(message, 'error')
    }
  }

  const handleValidateWithPoints = () => handleAdvanceStatus({ skipPointsCompensation: false })
  const handleValidateWithoutPoints = () => handleAdvanceStatus({ skipPointsCompensation: true })

  const handleCancel = async () => {
    if (!window.confirm('Annuler cette proposition d\'échange ? Cette action est définitive.')) return
    try {
      await API.put(`/exchanges/${id}/status`, { status: 'CANCELLED' })
      useToastStore.getState().show('Proposition annulée.')
      navigate(`/listings/${exchange.listingId}`)
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'annulation"
      setError(message)
      useToastStore.getState().show(message, 'error')
    }
  }

  const handleConfirmShipped = async () => {
    setActionLoading(true)
    try {
      const res = await API.post(`/exchanges/${id}/ship`)
      setExchange((prev) => ({ ...prev, ...res.data }))
      useToastStore.getState().show('Expédition confirmée.')
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de la confirmation d'expédition"
      setError(message)
      useToastStore.getState().show(message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setReceptionPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  const handleConfirmReceived = async () => {
    if (!receptionPhoto) return
    setActionLoading(true)
    try {
      const res = await API.post(`/exchanges/${id}/receive`, { photo: receptionPhoto })
      setExchange((prev) => ({ ...prev, ...res.data }))
      useToastStore.getState().show('Réception confirmée.')
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la confirmation de réception'
      setError(message)
      useToastStore.getState().show(message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewDraft.rating || reviewSubmitting) return
    setReviewSubmitting(true)
    try {
      const res = await API.post(`/exchanges/${id}/review`, reviewDraft)
      setReview(res.data)
      useToastStore.getState().show('Avis publié, merci !')
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'envoi de l'avis"
      useToastStore.getState().show(message, 'error')
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section style={{ paddingTop: '40px' }}>
        <div className="wrap">
          <SkeletonBlock height="28px" width="320px" style={{ marginBottom: '32px' }} />
          <div className="annonce-layout">
            <div>
              <SkeletonBlock height="200px" style={{ marginBottom: '20px' }} />
              <SkeletonBlock height="120px" />
            </div>
            <div className="annonce-side">
              <SkeletonBlock height="52px" radius={100} />
              <SkeletonBlock height="140px" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!exchange) {
    return (
      <section style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="wrap">
          <h1>Échange introuvable.</h1>
          <p className="hero-lede" style={{ margin: '16px auto 0' }}>
            Cet échange n'existe pas ou vous n'y avez pas accès.
          </p>
          <Link to="/listings" className="btn-ghost">← Retour aux annonces</Link>
        </div>
      </section>
    )
  }

  const isSender = exchange.senderId === user?.id
  const other = isSender ? exchange.receiver : exchange.sender
  const statusIndex = STATUS_SEQUENCE.indexOf(exchange.status)
  const isCancelled = exchange.status === 'CANCELLED'
  const otherName = other?.shopName || 'votre confrère'

  const currentUserHasShipped = isSender ? exchange.shippedBySender : exchange.shippedByReceiver
  const otherUserHasShipped = isSender ? exchange.shippedByReceiver : exchange.shippedBySender
  const bothHaveShipped = exchange.shippedBySender && exchange.shippedByReceiver
  const currentUserHasReceived = isSender ? exchange.receivedBySender : exchange.receivedByReceiver
  const otherUserHasReceived = isSender ? exchange.receivedByReceiver : exchange.receivedBySender
  const bothHaveReceived = exchange.receivedBySender && exchange.receivedByReceiver
  const myReceptionPhoto = isSender ? exchange.receptionPhotoSender : exchange.receptionPhotoReceiver
  const otherReceptionPhoto = isSender ? exchange.receptionPhotoReceiver : exchange.receptionPhotoSender

  // Une seule annonce réelle est liée à l'échange (celle du receiver) ; ce que le sender
  // propose en retour n'est décrit qu'en texte libre (searchingFor), pas une annonce trackée.
  const myListingTitle = isSender ? (exchange.listing?.searchingFor || 'Non précisé') : exchange.listing?.title
  const otherListingTitle = isSender ? exchange.listing?.title : (exchange.listing?.searchingFor || 'Non précisé')
  const formattedCompletionDate = exchange.receivedAt
    ? new Date(exchange.receivedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  const handleDownloadJustificatif = async () => {
    // window.open() ne permet pas d'envoyer le header Authorization : on récupère
    // le PDF via l'instance API authentifiée, puis on déclenche le téléchargement.
    try {
      const res = await API.get(`/exchanges/${exchange.id}/justificatif`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `justificatif-echange-${exchange.id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError("Erreur lors du téléchargement du justificatif")
    }
  }

  return (
    <div className="exchange-page">
      <section style={{ paddingTop: '40px', paddingBottom: '20px', borderTop: 'none' }}>
        <div className="wrap">
          <div className="breadcrumb mono">
            <Link to="/">Accueil</Link> <span>/</span> <Link to={`/listings/${exchange.listingId}`}>{exchange.listing?.title}</Link> <span>/</span> Échange
          </div>
        </div>
      </section>

      <header className="hero" style={{ padding: '40px 0 36px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '720px' }}>
          <h1 style={{ fontSize: 'clamp(28px, 3.4vw, 40px)' }}>
            Échange avec{' '}
            {other?.id ? (
              <Link to={`/profile/${other.id}`} className="glint">{other.shopName}</Link>
            ) : (
              <span className="glint">un confrère</span>
            )}
            .
          </h1>
          {!isCancelled ? (
            <div className="status-stepper">
              {STATUS_SEQUENCE.map((s, i) => (
                <div key={s} className={`status-step ${i < statusIndex ? 'done' : ''} ${i === statusIndex ? 'active' : ''}`}>
                  <span className="dot" /> {STATUS_LABELS[s]}
                </div>
              ))}
            </div>
          ) : (
            <div className="status-stepper">
              <div className="status-step active"><span className="dot" /> Annulé</div>
            </div>
          )}
        </div>
      </header>

      {bothHaveReceived && (
        <section style={{ paddingTop: '0' }}>
          <div className="wrap">
            <div className="exchange-success">
              <div className="exchange-success-icon">✓</div>
              <h2>Troc finalisé avec succès.</h2>
              <p className="exchange-success-sub">
                L'échange avec {otherName} est terminé. Les deux montures sont bien arrivées à destination.
              </p>

              {(myReceptionPhoto || otherReceptionPhoto) && (
                <div className="reception-photos">
                  <div className="reception-photo-card">
                    <div className="mono dim-label">Photo prise à votre réception</div>
                    {myReceptionPhoto ? (
                      <img src={myReceptionPhoto} alt="Photo de réception prise par vous" />
                    ) : (
                      <div className="thumb" />
                    )}
                  </div>
                  <div className="reception-photo-card">
                    <div className="mono dim-label">Photo prise par {otherName}</div>
                    {otherReceptionPhoto ? (
                      <img src={otherReceptionPhoto} alt={`Photo de réception prise par ${otherName}`} />
                    ) : (
                      <div className="thumb" />
                    )}
                  </div>
                </div>
              )}

              <div className="exchange-success-summary">
                <div className="row"><span>Monture envoyée</span><span>{myListingTitle}</span></div>
                <div className="row"><span>Monture reçue</span><span>{otherListingTitle}</span></div>
                <div className="row"><span>Écart réglé en points</span><span>{exchange.pointsSettled > 0 ? `${exchange.pointsSettled} points` : 'Aucun'}</span></div>
                <div className="row"><span>Date de finalisation</span><span>{formattedCompletionDate}</span></div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="exchange-success-actions">
                <button type="button" className="btn-primary" onClick={handleDownloadJustificatif}>
                  Télécharger le justificatif (PDF)
                </button>
                <Link to="/dashboard" className="btn-ghost">Retour à mon espace</Link>
              </div>

              {!reviewLoading && (
                review ? (
                  <div className="review-done">
                    <div className="review-done-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                    <p>Merci, votre avis sur {otherName} a été publié.</p>
                    {review.comment && <p className="review-done-comment">« {review.comment} »</p>}
                  </div>
                ) : (
                  <form className="review-form" onSubmit={handleSubmitReview}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>Noter {otherName}</div>
                    <p className="review-form-sub">Votre avis sera visible par les autres opticiens du réseau.</p>

                    <div className="review-stars" role="radiogroup" aria-label="Note sur 5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className={`review-star ${n <= reviewDraft.rating ? 'filled' : ''}`}
                          aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                          aria-pressed={n === reviewDraft.rating}
                          onClick={() => setReviewDraft((d) => ({ ...d, rating: n }))}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <div className="review-toggles">
                      {[
                        { key: 'compliance', label: 'Conforme à la description' },
                        { key: 'shippingSpeed', label: 'Envoi rapide' },
                        { key: 'itemCondition', label: 'État conforme' },
                      ].map(({ key, label }) => (
                        <label key={key} className="review-toggle">
                          <input
                            type="checkbox"
                            checked={reviewDraft[key] === true}
                            onChange={(e) => setReviewDraft((d) => ({ ...d, [key]: e.target.checked }))}
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    <textarea
                      className="review-comment"
                      placeholder="Un commentaire pour vos confrères ? (optionnel)"
                      value={reviewDraft.comment}
                      onChange={(e) => setReviewDraft((d) => ({ ...d, comment: e.target.value }))}
                      rows={3}
                    />

                    <button type="submit" className="btn-primary" disabled={!reviewDraft.rating || reviewSubmitting}>
                      {reviewSubmitting ? 'Envoi…' : 'Publier mon avis'}
                    </button>
                  </form>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {!bothHaveReceived && (
      <section style={{ paddingTop: '40px' }}>
        <div className="wrap">
          <div ref={layoutRef} className={`annonce-layout reveal-section ${layoutVisible ? 'reveal-visible' : ''}`}>
            <div>
              <div className="exchange-compare">
                <div className="exchange-side">
                  <div className="mono dim-label">Annonce concernée</div>
                  {exchange.listing?.photos?.[0]?.url ? (
                    <div className="thumb thumb--photo" style={{ marginBottom: '20px' }}>
                      <img src={exchange.listing.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                    </div>
                  ) : (
                    <div className="thumb" style={{ marginBottom: '20px' }} />
                  )}
                  <div className="seller-name" style={{ fontSize: '14px' }}>{exchange.listing?.title}</div>
                  <div className="seller-sub mono">{exchange.listing?.indicativeValue ? `Valeur indicative ~${exchange.listing.indicativeValue}€` : 'Valeur non précisée'}</div>
                </div>
                <div className="exchange-swap">⇄</div>
                <div className="exchange-side">
                  <div className="mono dim-label">{isSender ? 'Vous proposez' : 'On vous propose'}</div>
                  <div className="thumb" style={{ marginBottom: '20px' }} />
                  <div className="seller-name" style={{ fontSize: '14px' }}>{exchange.listing?.searchingFor || 'À définir en discussion'}</div>
                  <div className="seller-sub mono">{exchange.pointsNeeded > 0 ? `${exchange.pointsNeeded} points de complément` : 'Sans complément'}</div>
                </div>
              </div>

              <div className="verify-card" style={{ marginTop: '32px' }}>
                <div className="verify-row"><span>Complément en points</span><span className="ok">{exchange.pointsNeeded > 0 ? `${exchange.pointsNeeded} points` : 'Aucun'}</span></div>
                <div className="verify-row"><span>Statut</span><span className="ok">{STATUS_LABELS[exchange.status]}</span></div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="chat-thread">
                {exchange.messages.length === 0 && (
                  <p className="section-note" style={{ maxWidth: 'none', textAlign: 'center' }}>
                    Aucun message pour le moment — lancez la discussion.
                  </p>
                )}
                {exchange.messages.map((m) => (
                  <div key={m.id} className={`chat-bubble ${m.senderId === user?.id ? 'mine' : 'theirs'}`}>
                    <div className="chat-meta mono">{m.senderId === user?.id ? 'Vous' : (other?.shopName || 'Confrère')}</div>
                    {m.content}
                  </div>
                ))}
              </div>
              <form className="chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Écrire un message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={isCancelled}
                />
                <button type="submit" disabled={isCancelled || sending}>{sending ? '…' : 'Envoyer'}</button>
              </form>
            </div>

            <div className="annonce-side">
              {!isCancelled && STATUS_SEQUENCE[statusIndex + 1] === 'ACCEPTED' && (
                <div className="exchange-compensation-choice">
                  <button type="button" className="btn-primary" onClick={handleValidateWithPoints}>
                    Valider avec compensation en points
                  </button>
                  <button type="button" className="btn-ghost" onClick={handleValidateWithoutPoints}>
                    Valider sans compensation
                  </button>
                </div>
              )}
              {!isCancelled && exchange.status === 'PROPOSED' && (
                <button type="button" className="btn-primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }} onClick={() => handleAdvanceStatus()}>
                  Valider l'étape suivante
                </button>
              )}

              {!isCancelled && (exchange.status === 'ACCEPTED' || exchange.status === 'SHIPPED') && (
                <>
                  {!bothHaveShipped && !currentUserHasShipped && (
                    <button type="button" className="btn-primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }} onClick={handleConfirmShipped} disabled={actionLoading}>
                      J'ai expédié mon colis
                    </button>
                  )}
                  {!bothHaveShipped && currentUserHasShipped && (
                    <div className="exchange-waiting-note">
                      Votre envoi est confirmé. En attente de l'envoi de {otherName}.
                    </div>
                  )}
                  {bothHaveShipped && !currentUserHasReceived && (
                    <div className="reception-confirm">
                      <p>Confirmez la réception du colis :</p>
                      {receptionPhoto && (
                        <div className="reception-photo-preview">
                          <img src={receptionPhoto} alt="Aperçu de la photo de réception" />
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                      <button type="button" className="btn-primary" onClick={handleConfirmReceived} disabled={!receptionPhoto || actionLoading}>
                        J'ai reçu le colis
                      </button>
                    </div>
                  )}
                  {bothHaveShipped && currentUserHasReceived && !otherUserHasReceived && (
                    <div className="exchange-waiting-note">
                      Réception confirmée de votre côté. En attente de la confirmation de {otherName}.
                    </div>
                  )}
                </>
              )}

              {!isCancelled && !currentUserHasShipped && !otherUserHasShipped && (
                <button type="button" className="btn-ghost" style={{ textAlign: 'center', display: 'block', width: '100%' }} onClick={handleCancel}>
                  Annuler la proposition
                </button>
              )}
              <div className="verify-card rules-card">
                <div className="section-label" style={{ marginBottom: '16px' }}>Rappel des règles</div>
                <ul style={{ marginTop: 0 }}>
                  <li>Photo à réception obligatoire avant validation finale.</li>
                  <li>Annulation possible tant qu'aucun des deux colis n'a été expédié.</li>
                  <li>Points de compensation remboursés automatiquement en cas d'annulation avant expédition.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  )
}
