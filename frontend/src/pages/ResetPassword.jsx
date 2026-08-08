import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import API from '../store/authStore'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'
import { useToastStore } from '../store/toastStore'
import PasswordField from '../components/PasswordField'

export default function ResetPassword() {
  useSEO('Réinitialiser le mot de passe')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [formRef, formVisible] = useScrollReveal()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      await API.post('/auth/reset-password', { token, password })
      useToastStore.getState().show('Mot de passe mis à jour, vous pouvez vous connecter.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <section style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="wrap">
          <h1>Lien invalide.</h1>
          <p className="hero-lede" style={{ margin: '16px auto 0' }}>
            Ce lien de réinitialisation est incomplet ou a été mal copié.
          </p>
          <Link to="/mot-de-passe-oublie" className="btn-ghost">← Redemander un lien</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <header className="hero" style={{ padding: '64px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '460px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 40px)' }}>Nouveau mot de passe.</h1>
          <p className="hero-lede" style={{ margin: '0 auto', maxWidth: '380px', textAlign: 'center', marginBottom: 0 }}>
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: '30px', paddingBottom: '80px' }}>
        <div className="wrap" style={{ maxWidth: '440px' }}>
          <form ref={formRef} className={`publish-form reveal-section ${formVisible ? 'reveal-visible' : ''}`} onSubmit={handleSubmit}>
            {error && <p className="form-error">{error}</p>}

            <div className="form-block">
              <div className="field-row">
                <PasswordField
                  label="Nouveau mot de passe"
                  placeholder="8 caractères minimum"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="field-row">
                <PasswordField
                  label="Confirmer le mot de passe"
                  placeholder="8 caractères minimum"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }} disabled={loading}>
              {loading ? 'Mise à jour…' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
