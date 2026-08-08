import Logo from '../components/Logo'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useSEO } from '../hooks/useSEO'
import './Accounting.css'

export default function Accounting() {
  useSEO("La comptabilité d'un échange", "Comprendre les obligations comptables et fiscales liées à un échange de montures entre opticiens.")
  const [principeRef, principeVisible] = useScrollReveal()
  const [pointsRef, pointsVisible] = useScrollReveal()
  const [justifRef, justifVisible] = useScrollReveal()

  return (
    <>
      <header className="hero" style={{ padding: '48px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '680px' }}>
          <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 44px)' }}>La comptabilité d'un échange.</h1>
          <div className="eyebrow">
            <Logo size="tiny" />
            <span>Comprendre ses obligations</span>
          </div>
          <p className="hero-lede" style={{ maxWidth: '600px' }}>
            Un troc n'est pas invisible comptablement, même sans argent qui circule. Voici les grands principes à connaître avant votre premier échange.
          </p>
          <div className="disclaimer-box">
            <strong>Ceci n'est pas un conseil comptable ou fiscal personnalisé.</strong> Les règles varient selon votre situation (régime fiscal, structure juridique, TVA). Cette page donne les grands principes généraux ; faites valider votre cas précis par votre expert-comptable avant votre premier échange.
          </div>
        </div>
      </header>

      <section ref={principeRef} className={`tint-teal reveal-section ${principeVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Le principe général
              </div>
              <h2>Un troc est traité comme une double vente.</h2>
            </div>
          </div>
          <div className="rx-steps">
            <div className="rx-step">
              <div className="rx-eye"><span className="box">1</span> Facturation</div>
              <h3 style={{ fontSize: '16px' }}>Chaque monture se facture</h3>
              <p>Même sans argent qui circule, chaque opticien émet en principe une facture pour la monture qu'il cède, à sa valeur normale de marché.</p>
            </div>
            <div className="rx-step">
              <div className="rx-eye"><span className="box">2</span> TVA</div>
              <h3 style={{ fontSize: '16px' }}>La TVA s'applique normalement</h3>
              <p>La TVA se calcule sur la valeur de la monture cédée, comme pour une vente classique — l'absence d'argent ne dispense pas de la TVA.</p>
            </div>
            <div className="rx-step">
              <div className="rx-eye"><span className="box">3</span> Stock</div>
              <h3 style={{ fontSize: '16px' }}>Sortie et entrée de stock</h3>
              <p>La monture donnée sort du stock à son coût d'achat ; celle reçue entre au stock à sa valeur normale. L'écart entre les deux impacte votre résultat.</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={pointsRef} className={`tint-violet reveal-section ${pointsVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Le cas des points
              </div>
              <h2>Un sujet à faire valider, faute de traitement standard.</h2>
            </div>
          </div>
          <div className="verify">
            <div className="verify-card">
              <div className="verify-row"><span>Nature comptable des points</span><span className="ok">À définir avec votre expert-comptable</span></div>
              <div className="verify-row"><span>Solde de points en fin d'exercice</span><span className="ok">Traitement non standardisé</span></div>
              <div className="verify-row"><span>TVA sur écart compensé en points</span><span className="ok">À faire valider</span></div>
            </div>
            <div>
              <h2 style={{ marginBottom: '20px' }}>Pourquoi cette prudence ?</h2>
              <ul>
                <li>Le système de points ne correspond à aucune catégorie comptable standard (ni monnaie, ni simple troc à valeur égale).</li>
                <li>Sa valorisation dans vos comptes dépend de votre situation et doit être définie au cas par cas.</li>
                <li>Nous recommandons d'aborder ce point avec votre expert-comptable avant vos premiers échanges compensés en points.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section ref={justifRef} className={`reveal-section ${justifVisible ? 'reveal-visible' : ''}`}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">
                <Logo size="tiny" />
                Ce que la plateforme prévoit
              </div>
              <h2>Un justificatif généré pour chaque échange conclu.</h2>
            </div>
          </div>
          <div className="verify-card">
            <div className="verify-row"><span>Détail des deux montures échangées</span><span className="ok">Inclus</span></div>
            <div className="verify-row"><span>Valeurs indicatives déclarées</span><span className="ok">Inclus</span></div>
            <div className="verify-row"><span>Écart en points le cas échéant</span><span className="ok">Inclus</span></div>
            <div className="verify-row"><span>Date et identités des deux parties</span><span className="ok">Inclus</span></div>
          </div>
          <p className="section-note" style={{ marginTop: '16px', maxWidth: '600px' }}>
            Ce justificatif ne remplace pas une facture ni un conseil comptable — il sert de base factuelle à transmettre à votre expert-comptable pour qu'il détermine le traitement adapté à votre situation.
          </p>
        </div>
      </section>
    </>
  )
}
