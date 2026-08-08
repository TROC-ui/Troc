import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useSEO } from '../hooks/useSEO'
import './Legal.css'
import './Accounting.css'

export default function LegalNotice() {
  useSEO('Mentions légales')
  return (
    <>
      <header className="hero" style={{ padding: '48px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '760px' }}>
          <div className="eyebrow">
            <Logo size="tiny" />
            <span>Informations légales</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 44px)' }}>Mentions légales.</h1>
          <div className="disclaimer-box">
            Ce document reflète la configuration réelle du service. Il reste recommandé de le faire relire par un professionnel du droit avant une ouverture à grande échelle.
          </div>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="legal-content">
            <h2>Éditeur du site</h2>
            <p>
              Le site Troc est édité par une personne physique agissant à titre non professionnel — aucune société n'est immatriculée à ce jour pour l'exploitation de ce site.
            </p>
            <p>
              Conformément à l'article 6-III-2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, les éditeurs personnes physiques n'agissant pas à titre professionnel peuvent ne tenir à la disposition du public que le nom et l'adresse de leur hébergeur, sous réserve de lui avoir communiqué leurs éléments d'identification personnelle. C'est le choix fait ici : l'identité complète de l'éditeur a été communiquée à l'hébergeur mentionné ci-dessous, et ne sera transmise qu'à une autorité judiciaire compétente qui en ferait la demande.
            </p>
            <p>
              Adresse e-mail de contact : troc.gestion@gmail.com
            </p>

            <h2>Directeur de la publication</h2>
            <p>
              Le directeur ou la directrice de la publication est l'éditeur du site tel qu'indiqué ci-dessus.
            </p>

            <h2>Hébergement</h2>
            <p>
              Le site (partie visible, front-end) est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — <a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a>.
            </p>
            <p>
              Le serveur applicatif (back-end) est hébergé par <strong>Render Services, Inc.</strong>, 525 Brannan Street, Suite 300, San Francisco, CA 94107, États-Unis — <a href="https://render.com" target="_blank" rel="noreferrer">render.com</a>.
            </p>
            <p>
              La base de données est hébergée par <strong>Neon, Inc.</strong> (<a href="https://neon.tech" target="_blank" rel="noreferrer">neon.tech</a>), sur des serveurs physiquement situés dans l'Union européenne (région Francfort, Allemagne).
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments du site Troc (structure, textes, logo, identité visuelle, code source) est protégé au titre du droit d'auteur et du droit des marques. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation préalable, est interdite.
            </p>
            <p>
              Les contenus publiés par les utilisateurs (annonces, photographies de montures, messages) restent la propriété de leurs auteurs respectifs, qui garantissent disposer des droits nécessaires pour les publier sur le site.
            </p>

            <h2>Données personnelles</h2>
            <p>
              Le traitement des données personnelles des utilisateurs est détaillé dans la <Link to="/confidentialite">politique de confidentialité</Link> du site.
            </p>

            <h2>Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut de résolution amiable, les tribunaux français compétents seront seuls saisis.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
