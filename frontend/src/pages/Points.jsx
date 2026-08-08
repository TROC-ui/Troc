import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'

export default function Points() {
  useSEO('Le principe des points', "Comment fonctionne le système de points Troc pour combler un écart de valeur entre deux montures échangées.")
  const [gapRef, gapVisible] = useScrollReveal()
  const [choiceRef, choiceVisible] = useScrollReveal()
  const [originRef, originVisible] = useScrollReveal()
  const [rulesRef, rulesVisible] = useScrollReveal()
  const [neverRef, neverVisible] = useScrollReveal()

  return (
    <>
      <header className="hero" style={{ paddingBottom: '60px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '720px' }}>
          <div className="eyebrow eyebrow-big">
            <Logo size="small" />
            <span>Comment fonctionne le troc</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>Le principe des points.</h1>
          <p className="hero-lede" style={{ maxWidth: '600px', marginBottom: 0 }}>
            Le troc reste la base : une monture contre une autre. Les points ne servent qu'à combler un écart de valeur — si les deux opticiens le souhaitent.
          </p>
        </div>
      </header>

      <section ref={gapRef} className={`reveal-section ${gapVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                L'écart de valeur
              </div>
              <h2>Pourquoi un écart apparaît.</h2>
            </div>
            <p className="section-note">
              Chaque annonce a sa valeur indicative. L'écart entre deux montures est calculé automatiquement dès la proposition d'échange, et affiché avant validation.
            </p>
          </div>

          <div className="verify-card" style={{ maxWidth: '520px' }}>
            <div className="verify-row"><span>Monture proposée par vous</span><span className="ok">Valeur indicative ~60€</span></div>
            <div className="verify-row"><span>Monture recherchée</span><span className="ok">Valeur indicative ~90€</span></div>
            <div className="verify-row"><span>Écart constaté</span><span className="ok">30 points</span></div>
          </div>
        </div>
      </section>

      <section ref={choiceRef} className={`tint-teal reveal-section ${choiceVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Validation
              </div>
              <h2>Deux façons de conclure, à vous de choisir.</h2>
            </div>
            <p className="section-note">
              Une fois l'écart affiché, à vous de choisir — aucune option n'est obligatoire.
            </p>
          </div>

          <div className="rx-steps rx-steps--2col">
            <div className="rx-step">
              <div className="rx-eye"><span className="box">✓</span> Valider avec compensation</div>
              <h3>L'écart se règle en points</h3>
              <p>L'écart est transféré en points : qui reçoit la monture de plus grande valeur voit son solde diminuer d'autant, l'autre voit le sien augmenter. La façon la plus juste de conclure un échange déséquilibré.</p>
            </div>
            <div className="rx-step">
              <div className="rx-eye"><span className="box">—</span> Valider sans compensation</div>
              <h3>L'écart reste sans suite</h3>
              <p>Les deux opticiens s'accordent sur l'écart sans toucher aux points — par bonne entente, ou si la différence est minime. Aucun solde modifié.</p>
            </div>
          </div>

          <p className="section-note" style={{ maxWidth: 'none', marginTop: '28px' }}>
            Dans les deux cas, l'échange se conclut normalement. Les points restent un outil, jamais un blocage.
          </p>

          <Link to="/accounting" className="btn-ghost" style={{ display: 'inline-block', marginTop: '20px' }}>
            Comment ça se traduit côté comptabilité →
          </Link>
        </div>
      </section>

      <section ref={originRef} className={`reveal-section ${originVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                D'où viennent vos points
              </div>
              <h2>Comment votre solde évolue, du gain à l'usage.</h2>
            </div>
          </div>

          <div className="rx-steps">
            <div className="rx-step">
              <div className="rx-eye"><span className="box">01</span> Équilibrer</div>
              <h3>Un complément, pas une monnaie</h3>
              <p>Le point compense un écart de valeur — jamais une monnaie indépendante.</p>
            </div>
            <div className="rx-step">
              <div className="rx-eye"><span className="box">02</span> Gagner</div>
              <h3>Seulement en échangeant</h3>
              <p>Impossible d'acheter des points — ils s'obtiennent uniquement quand une de vos annonces trouve preneur.</p>
            </div>
            <div className="rx-step">
              <div className="rx-eye"><span className="box">03</span> Utiliser</div>
              <h3>Un outil qui circule, pas une épargne</h3>
              <p>Faits pour être réutilisés vite sur un prochain échange — pas pour dormir sur votre compte.</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={rulesRef} className={`tint-violet reveal-section ${rulesVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Les règles du solde
              </div>
              <h2>Ce qu'il faut savoir sur votre solde.</h2>
            </div>
          </div>

          <div className="trust-grid">
            <div>
              <div className="trust-num glint">40 points</div>
              <div className="trust-label">offerts à l'inscription — personne ne part de zéro.</div>
            </div>
            <div>
              <div className="trust-num trust-num--negative">-50 points</div>
              <div className="trust-label">la limite basse — le temps de se rééquilibrer au prochain échange.</div>
            </div>
            <div>
              <div className="trust-num glint">500 points</div>
              <div className="trust-label">le plafond — au-delà, à utiliser avant d'en regagner.</div>
            </div>
          </div>
        </div>
      </section>

      <section ref={neverRef} className={`reveal-section ${neverVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-label">
            <Logo size="tiny" />
            Ce que les points ne sont jamais
          </div>
          <p className="section-note" style={{ maxWidth: '640px', marginTop: '16px' }}>
            Ils ne s'achètent pas, ne se revendent pas, ne se convertissent jamais en argent réel. Un filet de sécurité entre confrères — jamais une monnaie.
          </p>
        </div>
      </section>

      <section className="cta-final">
        <div className="wrap">
          <div className="section-label" style={{ justifyContent: 'center' }}>Rejoindre</div>
          <h2>Prêt à faire circuler votre réserve ?</h2>
          <Link to="/" className="btn-primary">Retour à l'accueil</Link>
        </div>
      </section>
    </>
  )
}
