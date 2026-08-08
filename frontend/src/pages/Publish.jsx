import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuthStore } from '../store/authStore'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'
import API from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { CATEGORIES, SHAPES, MATERIALS, STYLES } from '../constants/listingOptions'

const CONDITIONS = ['Jamais portée', 'Très bon état', 'Bon état']
const WANTED_TYPOLOGIES = [...CATEGORIES, 'Ouvert à tout']

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 16V4M12 4l-4 4M12 4l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function wantedToSearchingFor(wanted) {
  return wanted === 'Ouvert à tout' ? 'Ouvert à toute proposition' : `Une monture ${wanted.toLowerCase()}`
}

function searchingForToWanted(searchingFor) {
  const match = WANTED_TYPOLOGIES.find((t) => wantedToSearchingFor(t) === searchingFor)
  return match || 'Ouvert à tout'
}

export default function Publish() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  useSEO(isEditing ? "Modifier l'annonce" : 'Publier une annonce')
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [photos, setPhotos] = useState([null, null, null])
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    size: '',
    city: '',
    notes: '',
    value: '',
    exchangeZone: '',
    wantedNotes: '',
  })
  const [condition, setCondition] = useState(CONDITIONS[0])
  const [typology, setTypology] = useState(CATEGORIES[0])
  const [shape, setShape] = useState('')
  const [material, setMaterial] = useState('')
  const [style, setStyle] = useState('')
  const [wanted, setWanted] = useState(WANTED_TYPOLOGIES[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [layoutRef, layoutVisible] = useScrollReveal()
  const [loading, setLoading] = useState(isEditing)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!isEditing) return
    let cancelled = false
    API.get(`/listings/${id}`)
      .then((res) => {
        if (cancelled) return
        const listing = res.data
        if (listing.userId !== user?.id) {
          setLoadError("Vous ne pouvez modifier que vos propres annonces.")
          return
        }
        setFormData({
          title: listing.title || '',
          brand: listing.brand || '',
          size: listing.size || '',
          city: listing.location || '',
          notes: listing.description || '',
          value: listing.indicativeValue ?? '',
          exchangeZone: '',
          wantedNotes: listing.wantedNotes || '',
        })
        setCondition(CONDITIONS.includes(listing.condition) ? listing.condition : CONDITIONS[0])
        setTypology(CATEGORIES.includes(listing.typology) ? listing.typology : CATEGORIES[0])
        setShape(SHAPES.includes(listing.shape) ? listing.shape : '')
        setMaterial(MATERIALS.includes(listing.material) ? listing.material : '')
        setStyle(STYLES.includes(listing.style) ? listing.style : '')
        setWanted(searchingForToWanted(listing.searchingFor))
        const existingPhotos = (listing.photos || []).sort((a, b) => a.order - b.order).map((p) => p.url)
        setPhotos([existingPhotos[0] || null, existingPhotos[1] || null, existingPhotos[2] || null])
      })
      .catch(() => !cancelled && setLoadError("Cette annonce n'existe pas ou plus."))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, isEditing, user?.id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (index, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPhotos((prev) => {
        const next = [...prev]
        next[index] = reader.result
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const payload = {
      title: formData.title,
      brand: formData.brand,
      size: formData.size,
      condition,
      typology,
      shape: shape || null,
      material: material || null,
      style: style || null,
      description: formData.notes,
      indicativeValue: formData.value || null,
      searchingFor: wantedToSearchingFor(wanted),
      wantedNotes: formData.wantedNotes,
      location: formData.city,
      photos: photos.filter(Boolean),
    }
    try {
      if (isEditing) {
        await API.put(`/listings/${id}`, payload)
        useToastStore.getState().show('Annonce mise à jour.')
        navigate(`/listings/${id}`)
      } else {
        await API.post('/listings', payload)
        useToastStore.getState().show('Annonce publiée.')
        navigate('/listings')
      }
    } catch (err) {
      const message = err.response?.data?.message || (isEditing ? "Erreur lors de la mise à jour de l'annonce" : "Erreur lors de la publication de l'annonce")
      setError(message)
      useToastStore.getState().show(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (isEditing && loading) {
    return (
      <section style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="wrap">
          <p className="section-note" style={{ maxWidth: 'none' }}>Chargement de l'annonce…</p>
        </div>
      </section>
    )
  }

  if (isEditing && loadError) {
    return (
      <section style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="wrap">
          <h1>Impossible de modifier cette annonce.</h1>
          <p className="hero-lede" style={{ margin: '16px auto 0' }}>{loadError}</p>
          <Link to="/dashboard" className="btn-ghost">← Retour à mon espace</Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section style={{ paddingTop: '40px', paddingBottom: '0', borderTop: 'none' }}>
        <div className="wrap">
          <div className="breadcrumb mono">
            <Link to="/">Accueil</Link> <span>/</span> <Link to="/dashboard">Mon espace</Link> <span>/</span> {isEditing ? "Modifier l'annonce" : 'Publier'}
          </div>
        </div>
      </section>

      <header className="hero" style={{ padding: '24px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '720px' }}>
          {isEditing ? (
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>Modifier l'annonce.</h1>
          ) : (
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>Publier <span className="glint">mon stock</span>.</h1>
          )}
          <div className="eyebrow">
            <Logo size="tiny" />
            <span>{isEditing ? 'Les modifications sont visibles immédiatement' : '2 minutes suffisent'}</span>
          </div>
          <p className="hero-lede" style={{ maxWidth: '600px', marginBottom: 0 }}>
            {isEditing
              ? 'Corrigez le prix, les photos ou la description — le reste du réseau voit la version à jour dès l\'enregistrement.'
              : 'Une monture qui dort en réserve ? Photographiez-la, décrivez-la, et laissez le réseau faire matcher.'}
          </p>
        </div>
      </header>

      <section style={{ paddingTop: '80px' }}>
        <div className="wrap">
          <div ref={layoutRef} className={`annonce-layout reveal-section ${layoutVisible ? 'reveal-visible' : ''}`}>
            <form className="publish-form" onSubmit={handleSubmit}>
              <div className="form-block">
                <div className="section-label" style={{ marginBottom: '16px' }}>Photos</div>
                <div className="annonce-gallery" style={{ height: '220px' }}>
                  {photos.map((photo, index) => (
                    <label
                      key={index}
                      className={`photo-card__slot upload${index === 0 ? ' main' : ''}`}
                      style={photo ? { padding: 0, overflow: 'hidden' } : undefined}
                    >
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(index, e.target.files[0])} hidden />
                      {photo ? (
                        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <UploadIcon />
                      )}
                    </label>
                  ))}
                </div>
                <p className="section-note" style={{ marginTop: '10px', maxWidth: 'none' }}>
                  3 photos minimum : face, profil, état des charnières.
                </p>
              </div>

              <div className="form-block">
                <div className="section-label" style={{ marginBottom: '16px' }}>Description</div>
                <div className="field-row">
                  <label>Titre de l'annonce
                    <input type="text" name="title" placeholder="Ex. Monture titane fine, T50" value={formData.title} onChange={handleChange} required />
                  </label>
                </div>
                <div className="field-row two-col">
                  <label>Marque / référence
                    <input type="text" name="brand" placeholder="Ex. Lindberg, réf. 6512" value={formData.brand} onChange={handleChange} />
                  </label>
                  <label>Taille
                    <input type="text" name="size" placeholder="Ex. 50-18-140" value={formData.size} onChange={handleChange} />
                  </label>
                </div>
                <div className="field-row">
                  <label>Ville
                    <input type="text" name="city" placeholder="Ex. Lyon" value={formData.city} onChange={handleChange} required />
                  </label>
                </div>
                <div className="field-row">
                  <label>Typologie de la monture</label>
                  <div className="pill-choices">
                    {CATEGORIES.map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`pill-choice${typology === t ? ' active' : ''}`}
                        onClick={() => setTypology(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-row">
                  <label>Forme</label>
                  <div className="pill-choices">
                    {SHAPES.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`pill-choice${shape === s ? ' active' : ''}`}
                        onClick={() => setShape(shape === s ? '' : s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-row">
                  <label>Matière</label>
                  <div className="pill-choices">
                    {MATERIALS.map((m) => (
                      <button
                        type="button"
                        key={m}
                        className={`pill-choice${material === m ? ' active' : ''}`}
                        onClick={() => setMaterial(material === m ? '' : m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-row">
                  <label>Style</label>
                  <div className="pill-choices">
                    {STYLES.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`pill-choice${style === s ? ' active' : ''}`}
                        onClick={() => setStyle(style === s ? '' : s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-row">
                  <label>Notes complémentaires
                    <textarea name="notes" placeholder="Ex. Fin de collection, jamais montée avec des verres." value={formData.notes} onChange={handleChange} />
                  </label>
                </div>
              </div>

              <div className="form-block">
                <div className="section-label" style={{ marginBottom: '16px' }}>Valeur de votre annonce</div>
                <div className="field-row two-col">
                  <label>Valeur indicative (€)
                    <input type="text" name="value" placeholder="Ex. 90" value={formData.value} onChange={handleChange} />
                  </label>
                  <label>Zone d'échange
                    <input type="text" name="exchangeZone" placeholder="Ex. Rayon 80km" value={formData.exchangeZone} onChange={handleChange} />
                  </label>
                </div>
              </div>

              <div className="form-block">
                <div className="section-label" style={{ marginBottom: '16px' }}>Ce que vous recherchez</div>
                <div className="field-row">
                  <label>Typologie recherchée en retour</label>
                  <div className="pill-choices">
                    {WANTED_TYPOLOGIES.map((t) => (
                      <button
                        type="button"
                        key={t}
                        className={`pill-choice${wanted === t ? ' active' : ''}`}
                        onClick={() => setWanted(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-row">
                  <label>Précisions sur votre recherche (optionnel)
                    <textarea
                      name="wantedNotes"
                      placeholder="Ex. Idéalement une monture titane, taille 50-52, jamais portée."
                      value={formData.wantedNotes}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="btn-primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box', display: 'block' }} disabled={submitting}>
                {submitting
                  ? (isEditing ? 'Enregistrement…' : 'Publication en cours…')
                  : (isEditing ? 'Enregistrer les modifications' : "Publier l'annonce")}
              </button>
            </form>

            <div className="annonce-side">
              <div className="section-label" style={{ marginBottom: '2px' }}>Aperçu en direct</div>
              <p className="section-note" style={{ marginBottom: '16px', maxWidth: 'none' }}>
                Voici comment votre annonce apparaîtra dans le réseau.
              </p>
              <div className="listing" style={{ pointerEvents: 'none' }}>
                {photos.find(Boolean) ? (
                  <div className="thumb thumb--photo" style={{ overflow: 'hidden' }}>
                    <img src={photos.find(Boolean)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  </div>
                ) : (
                  <div className="thumb" />
                )}
                <div className="meta">TROC · {(formData.city || 'VOTRE VILLE').toUpperCase()}</div>
                <div className="title">{formData.title || 'Titre de votre annonce'}</div>
                <div className="sub">Contre {wanted.toLowerCase()}</div>
              </div>
              <div className="verify-card">
                <div className="verify-row"><span>Valeur indicative</span><span className="ok">{formData.value ? `~${formData.value}€` : '—'}</span></div>
                <div className="verify-row"><span>Statut</span><span className="ok">{isEditing ? 'Active' : 'Brouillon'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
