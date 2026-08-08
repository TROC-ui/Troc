import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'
import Logo from '../components/Logo'

export default function Signup() {
  useSEO("Créer un compte", "Rejoignez le réseau Troc — inscription réservée aux opticiens professionnels.")
  const navigate = useNavigate()
  const { signup, loading, error } = useAuthStore()
  const [formRef, formVisible] = useScrollReveal()
  const [formData, setFormData] = useState({
    shopName: '',
    city: '',
    exchangeZone: '',
    email: '',
    password: '',
    professionalNumber: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signup(formData)
      navigate('/dashboard')
    } catch {
      // l'erreur est déjà exposée via authStore.error
    }
  }

  return (
    <>
      <header className="hero" style={{ padding: '48px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '640px' }}>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>Rejoindre le réseau.</h1>
          <div className="eyebrow">
            <Logo size="tiny" />
            <span>Réservé aux opticiens en exercice</span>
          </div>
          <p className="hero-lede" style={{ maxWidth: '560px', marginBottom: 0 }}>
            Le numéro professionnel est demandé à l'inscription — le réseau reste réservé aux opticiens.
          </p>
        </div>
      </header>

      <section style={{ paddingTop: '80px' }}>
        <div className="wrap">
          <div ref={formRef} className={`annonce-layout reveal-section ${formVisible ? 'reveal-visible' : ''}`}>
            <form className="publish-form" onSubmit={handleSubmit}>
              {error && <p className="form-error">{error}</p>}

              <div className="form-block">
                <div className="section-label" style={{ marginBottom: '16px' }}>Votre boutique</div>
                <div className="field-row">
                  <label>Nom de la boutique
                    <input type="text" name="shopName" placeholder="Ex. Optique du Rhône" value={formData.shopName} onChange={handleChange} required />
                  </label>
                </div>
                <div className="field-row two-col">
                  <label>Ville
                    <input type="text" name="city" placeholder="Ex. Lyon" value={formData.city} onChange={handleChange} required />
                  </label>
                  <label>Zone d'échange souhaitée
                    <input type="text" name="exchangeZone" placeholder="Ex. Rayon 80km" value={formData.exchangeZone} onChange={handleChange} />
                  </label>
                </div>
              </div>

              <div className="form-block">
                <div className="section-label" style={{ marginBottom: '16px' }}>Vos identifiants</div>
                <div className="field-row">
                  <label>Email professionnel
                    <input type="email" name="email" placeholder="vous@votreboutique.fr" value={formData.email} onChange={handleChange} required />
                  </label>
                </div>
                <div className="field-row">
                  <label>Mot de passe
                    <input type="password" name="password" placeholder="8 caractères minimum" minLength={8} value={formData.password} onChange={handleChange} required />
                  </label>
                </div>
              </div>

              <div className="form-block">
                <div className="section-label" style={{ marginBottom: '16px' }}>Vérification professionnelle</div>
                <div className="field-row">
                  <label>Numéro Adeli / RPPS
                    <input type="text" name="professionalNumber" placeholder="Ex. 69 1234567 8" value={formData.professionalNumber} onChange={handleChange} required />
                  </label>
                </div>
                <p className="section-note" style={{ marginTop: '4px', maxWidth: 'none' }}>
                  Vérifié manuellement par l'équipe Troc après inscription — votre compte reste actif pendant la vérification.
                </p>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }} disabled={loading}>
                {loading ? 'Création en cours…' : 'Créer mon compte'}
              </button>
              <p className="section-note" style={{ textAlign: 'center', margin: '16px auto 0', maxWidth: 'none' }}>
                Compte actif dès l'inscription.
              </p>
            </form>

            <div className="annonce-side">
              <div className="section-label" style={{ marginBottom: '2px' }}>Ce qui se passe ensuite</div>
              <p className="section-note" style={{ marginBottom: '16px', maxWidth: 'none' }}>Deux étapes avant votre premier échange.</p>
              <div className="rx-steps" style={{ gridTemplateColumns: '1fr', gap: '1px' }}>
                <div className="rx-step">
                  <div className="rx-eye"><span className="box">01</span> Inscription</div>
                  <h3 style={{ fontSize: '16px' }}>Vous créez votre compte</h3>
                  <p>Boutique, email, numéro professionnel — deux minutes suffisent.</p>
                </div>
                <div className="rx-step">
                  <div className="rx-eye"><span className="box">02</span> Accès</div>
                  <h3 style={{ fontSize: '16px' }}>Vous publiez et échangez</h3>
                  <p>Accès complet aux annonces et à la messagerie d'échange, dès la création du compte.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
