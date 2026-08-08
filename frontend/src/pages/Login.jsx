import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'
import PasswordField from '../components/PasswordField'

export default function Login() {
  useSEO('Connexion')
  const navigate = useNavigate()
  const { login, loading, error } = useAuthStore()
  const [formRef, formVisible] = useScrollReveal()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Erreur lors de la connexion')
    }
  }

  return (
    <>
      <header className="hero" style={{ padding: '64px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '460px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(28px, 3.6vw, 40px)' }}>Bon retour <span className="glint">parmi nous</span>.</h1>
          <p className="hero-lede" style={{ margin: '0 auto', maxWidth: '380px', textAlign: 'center', marginBottom: 0 }}>
            Connectez-vous pour retrouver vos annonces, vos échanges en cours et votre solde de points.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: '30px', paddingBottom: '80px' }}>
        <div className="wrap" style={{ maxWidth: '440px' }}>
          <form ref={formRef} className={`publish-form reveal-section ${formVisible ? 'reveal-visible' : ''}`} onSubmit={handleSubmit}>
            {(localError || error) && <p className="form-error">{localError || error}</p>}

            <div className="form-block">
              <div className="field-row">
                <label>Email
                  <input
                    type="email"
                    name="email"
                    placeholder="contact@boutique.fr"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
              <div className="field-row">
                <PasswordField
                  label="Mot de passe"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
              </div>
              <p style={{ textAlign: 'right', margin: '-8px 0 0' }}>
                <Link to="/mot-de-passe-oublie" className="glint" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Mot de passe oublié ?
                </Link>
              </p>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }} disabled={loading}>
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>

            <p className="section-note" style={{ textAlign: 'center', margin: '20px auto 0', maxWidth: 'none' }}>
              Pas encore inscrit ? <Link to="/signup" className="glint" style={{ fontWeight: 600 }}>Créer un compte</Link>
            </p>
          </form>
        </div>
      </section>
    </>
  )
}
