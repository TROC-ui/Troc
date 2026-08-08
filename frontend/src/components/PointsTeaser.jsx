import { Link } from 'react-router-dom'
import { useSectionTransition } from '../hooks/useSectionTransition'
import mascottesPoigneeDeMain from '../assets/images/mascottes-poignee-de-main.png'

export default function PointsTeaser() {
  const [ref, isActive] = useSectionTransition()

  return (
    <section
      ref={ref}
      className={`snap-section transition-section points-teaser-slide ${isActive ? 'section-active' : ''}`}
    >
      <div className="wrap points-teaser-grid">
        <div>
          <div className="eyebrow-gold">Le principe des points</div>
          <h2 className="points-teaser-title">
            Un système de points, <span className="gold-word">jamais d'argent réel</span>.
          </h2>
          <p className="points-teaser-lede">
            Les points ne s'achètent pas, ne se revendent pas, et ne se convertissent jamais
            en cash — ils circulent uniquement entre confrères, comme un simple filet de
            sécurité pour équilibrer un échange.
          </p>
          <ul className="points-teaser-list">
            <li>Gagnés uniquement en échangeant du stock</li>
            <li>Utilisés pour combler un écart de valeur</li>
            <li>Aucune transaction bancaire, jamais</li>
          </ul>
          <Link to="/points" className="btn-gold">En savoir plus →</Link>
        </div>
        <div className="points-illustration">
          <img src={mascottesPoigneeDeMain} alt="Deux opticiens Troc qui se serrent la main" />
        </div>
      </div>
    </section>
  )
}
