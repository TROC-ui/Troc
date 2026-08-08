import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../store/authStore'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'

export default function ForgotPassword() {
  useSEO('Mot de passe oublié')
  const [formRef, formVisible] = useScrollReveal()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResetLink('')
    setMessage('')
    setLoading(true)
    try {
      const res = await API.post('/auth/forgot-password', { email })
      if (res.data.resetLink) {
        setResetLink(res.data.resetLink)
      } else {
        setMessage(res.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la demande de réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <header className="hero" style={{ padding: '64px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '460px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 40px)' }}>Mot de passe oublié.</h1>
          <p className="hero-lede" style={{ margin: '0 auto', maxWidth: '380px', textAlign: 'center', marginBottom: 0 }}>
            Entrez l'email de votre compte pour générer un lien de réinitialisation.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: '30px', paddingBottom: '80px' }}>
        <div className="wrap" style={{ maxWidth: '440px' }}>
          <form ref={formRef} className={`publish-form reveal-section ${formVisible ? 'reveal-visible' : ''}`} onSubmit={handleSubmit}>
            {error && <p className="form-error">{error}</p>}

            <div className="form-block">
              <div className="field-row">
                <label>Email
                  <input
                    type="email"
                    placeholder="contact@boutique.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }} disabled={loading}>
              {loading ? 'Génération…' : 'Générer le lien de réinitialisation'}
            </button>

            {message && (
              <p className="section-note" style={{ textAlign: 'center', margin: '20px auto 0', maxWidth: 'none' }}>
                {message}
              </p>
            )}

            {resetLink && (
              <div className="verify-card" style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '13px', color: 'var(--paper-dim)', marginBottom: '10px' }}>
                  Mode développement — aucun envoi d'email n'est configuré (pas de clé SendGrid). Voici le lien directement :
                </p>
                <Link to={resetLink.replace(window.location.origin, '')} className="glint" style={{ wordBreak: 'break-all', fontSize: '13px' }}>
                  {resetLink}
                </Link>
              </div>
            )}

            <p className="section-note" style={{ textAlign: 'center', margin: '20px auto 0', maxWidth: 'none' }}>
              <Link to="/login" className="glint" style={{ fontWeight: 600 }}>← Retour à la connexion</Link>
            </p>
          </form>
        </div>
      </section>
    </>
  )
}
