import { Link } from 'react-router-dom'
import { useSectionTransition } from '../hooks/useSectionTransition'
import { useListings } from '../hooks/useListings'
import { useSEO } from '../hooks/useSEO'
import Logo from '../components/Logo'
import PointsTeaser from '../components/PointsTeaser'
import publierPhoto from '../assets/photos/publier.jpg'
import echangerPhoto from '../assets/photos/echanger.jpg'
import recevoirPhoto from '../assets/photos/recevoir.jpg'
import HeroIllustration from '../components/HeroIllustration'
import './Homepage.css'

export default function Homepage() {
  useSEO()
  const { listings, loading: listingsLoading } = useListings()
  const recentListings = listings.slice(0, 4)

  const [fonctionnementRef, fonctionnementActive] = useSectionTransition()
  const [annoncesRef, annoncesActive] = useSectionTransition()
  const [pratiqueRef, pratiqueActive] = useSectionTransition()
  const [chiffresRef, chiffresActive] = useSectionTransition()
  const [confianceRef, confianceActive] = useSectionTransition()
  const [ctaRef, ctaActive] = useSectionTransition()

  return (
    <div>
      <div>
        {/* Hero Section */}
        <section className="hero snap-section">
          <div className="wrap hero-wrap">
            <div className="hero-left">
              <h1>Le stock qui dort<br className="hero-break" /> chez vous <span className="glint">fait envie</span><br className="hero-break" /> ailleurs.</h1>

              <p className="hero-lede">
                Troc échange les montures invendues directement entre boutiques d'opticiens — sans repasser par le fournisseur, sans brader en réserve.
              </p>

              <div className="hero-ctas">
                <Link to="/signup" className="btn-primary">Publier mon stock</Link>
                <Link to="/listings" className="btn-ghost">Voir les annonces →</Link>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-illustration">
                <HeroIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          ref={fonctionnementRef}
          className={`features snap-section transition-section ${fonctionnementActive ? 'section-active' : ''}`}
        >
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="section-label">
                  <Logo size="tiny" />
                  Fonctionnement
                </div>
                <h2>Un circuit boutique → boutique, jamais vu ailleurs.</h2>
              </div>
            </div>

            <div
              className="func-steps"
              onMouseMove={(e) => {
                const step = e.target.closest('.func-step')
                if (!step) return
                const rect = step.getBoundingClientRect()
                step.style.setProperty('--spot-x', `${((e.clientX - rect.left) / rect.width) * 100}%`)
                step.style.setProperty('--spot-y', `${((e.clientY - rect.top) / rect.height) * 100}%`)
              }}
            >
              <div className="func-step">
                <div className="func-num">01</div>
                <div className="func-label">Réserve</div>
                <h3>Vous photographiez</h3>
                <p>Marque, référence, taille, état — chaque monture dormante devient une fiche en 2 minutes.</p>
              </div>

              <div className="func-step">
                <div className="func-num">02</div>
                <div className="func-label">Vitrine</div>
                <h3>Le réseau matche</h3>
                <p>Filtres par typologie de clientèle et zone géographique : on vous propose les échanges pertinents près de chez vous.</p>
              </div>

              <div className="func-step">
                <div className="func-num">03</div>
                <div className="func-label">Échange</div>
                <h3>Vous validez</h3>
                <p>Troc direct, point relais mutualisé ou envoi simple — vous choisissez la logistique qui vous arrange.</p>
              </div>
            </div>
          </div>
        </section>

        <PointsTeaser />

        {/* Key numbers */}
        <section
          ref={chiffresRef}
          className={`trust-stats snap-section transition-section ${chiffresActive ? 'section-active' : ''}`}
        >
          <div className="wrap">
            <div className="trust-grid">
              <div>
                <div className="trust-num glint">Zéro</div>
                <div className="trust-label">remise négociée avec un fournisseur — l'échange se fait entre pairs, à valeur équivalente.</div>
              </div>
              <div>
                <div className="trust-num glint">Adeli / RPPS</div>
                <div className="trust-label">demandé à chaque inscription pour rejoindre le réseau — réservé aux opticiens professionnels.</div>
              </div>
              <div>
                <div className="trust-num glint">1 stock</div>
                <div className="trust-label">qui tourne, plutôt qu'une réserve qui dort — c'est tout l'objectif.</div>
              </div>
            </div>
          </div>
        </section>

        {/* In practice / photo placeholders */}
        <section
          ref={pratiqueRef}
          className={`pratique snap-section transition-section ${pratiqueActive ? 'section-active' : ''}`}
        >
          <div className="wrap">
            <div className="photo-grid">
              <div className="photo-card">
                <div className="frame frame-photo">
                  <img src={publierPhoto} alt="Opticien publiant une annonce depuis son ordinateur" />
                </div>
                <div className="photo-cap">
                  <span className="mono glint">Publier</span>
                </div>
              </div>

              <div className="photo-card">
                <div className="frame frame-photo">
                  <img src={echangerPhoto} alt="Deux opticiens finalisant un échange de montures en boutique" />
                </div>
                <div className="photo-cap">
                  <span className="mono glint">Échanger</span>
                </div>
              </div>

              <div className="photo-card">
                <div className="frame frame-photo">
                  <img src={recevoirPhoto} alt="Réception d'un colis contenant une monture échangée" />
                </div>
                <div className="photo-cap">
                  <span className="mono glint">Recevoir</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust / confiance section */}
        <section
          id="confiance"
          ref={confianceRef}
          className={`confiance snap-section transition-section ${confianceActive ? 'section-active' : ''}`}
        >
          <div className="wrap">
            <div className="verify">
              <div className="trust-panel">
                <div className="trust-panel-badge">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2.5l7.5 3.2v5.4c0 5-3.2 8.7-7.5 10.4-4.3-1.7-7.5-5.4-7.5-10.4V5.7L12 2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M8.5 12.3l2.4 2.4 4.6-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Réseau fermé</span>
                </div>

                <div className="trust-panel-row">
                  <span className="trust-panel-label">Numéro professionnel</span>
                  <span className="trust-panel-value trust-panel-value--teal">DEMANDÉ</span>
                </div>
                <div className="trust-panel-row">
                  <span className="trust-panel-label">Historique d'échanges</span>
                  <span className="trust-panel-value trust-panel-value--violet">Réseau en constitution</span>
                </div>
                <div className="trust-panel-row">
                  <span className="trust-panel-label">Notation entre pairs</span>
                  <span className="trust-panel-value trust-panel-value--teal">Après chaque échange</span>
                </div>
                <div className="trust-panel-row">
                  <span className="trust-panel-label">Zone d'échange</span>
                  <span className="trust-panel-value trust-panel-value--violet">Rayon 80km</span>
                </div>
              </div>
              <div>
                <div className="section-label">
                  <Logo size="tiny" />
                  Confiance
                </div>
                <h2 style={{ marginBottom: '20px' }}>Un réseau fermé, réservé au métier.</h2>
                <ul>
                  <li>Inscription réservée aux opticiens en exercice, numéro professionnel demandé à l'ouverture du compte.</li>
                  <li>Chaque échange donne lieu à une notation, visible par le reste du réseau.</li>
                  <li>Aucune revente au grand public : l'outil reste strictement confrère à confrère.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Listings preview */}
        <section
          ref={annoncesRef}
          className={`annonces snap-section transition-section ${annoncesActive ? 'section-active' : ''}`}
        >
          <div className="wrap">
            <div className="section-head">
              <div>
                <div className="section-label">
                  <Logo size="tiny" />
                  En ce moment
                </div>
                <h2>Ce qui circule cette semaine entre opticiens du réseau.</h2>
              </div>
              <Link to="/listings" className="btn-ghost">Voir toutes les annonces →</Link>
            </div>

            {!listingsLoading && recentListings.length === 0 && (
              <div className="empty-listings">
                <p>Aucune annonce pour le moment.</p>
                <Link to="/publish" className="btn-primary">Publier la première annonce</Link>
              </div>
            )}

            {recentListings.length > 0 && (
              <div className="listings">
                {recentListings.map((listing) => (
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

        {/* CTA section */}
        <section
          ref={ctaRef}
          className={`cta-final cta-final-home snap-section transition-section ${ctaActive ? 'section-active' : ''}`}
        >
          <div className="wrap">
            <Logo size="medium" className="cta-final-logo" />
            <div className="section-label" style={{ justifyContent: 'center' }}>Rejoindre</div>
            <h2>Votre réserve a de la valeur.<br />Faites-la circuler.</h2>
            <Link to="/signup" className="btn-primary">Publier ma première annonce</Link>
            <p className="section-note" style={{ textAlign: 'center', margin: '18px auto 0', fontSize: '12px' }}>
              Inscription réservée aux opticiens professionnels
            </p>
          </div>
        </section>
      </div>

      {/* Site map banner */}
      <section className="page-banner">
        <div className="wrap">
          <div className="page-banner-label mono">Explorer le site</div>
          <div className="page-banner-links">
            <Link to="/">Accueil</Link>
            <Link to="/listings">Toutes les annonces</Link>
            <Link to="/accounting">Comptabilité d'un échange</Link>
            <Link to="/points">Le principe des points</Link>
            <Link to="/dashboard">Mon espace</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
