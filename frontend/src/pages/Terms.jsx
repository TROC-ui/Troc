import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useSEO } from '../hooks/useSEO'
import './Legal.css'
import './Accounting.css'

export default function Terms() {
  useSEO("Conditions générales d'utilisation")
  return (
    <>
      <header className="hero" style={{ padding: '48px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '760px' }}>
          <div className="eyebrow">
            <Logo size="tiny" />
            <span>Conditions générales</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 44px)' }}>Conditions générales d'utilisation.</h1>
          <div className="disclaimer-box">
            <strong>Document à faire valider par un professionnel du droit avant ouverture réelle du service.</strong> Cette page pose la structure et les règles de fonctionnement telles qu'implémentées sur la plateforme ; elle ne remplace pas une rédaction juridique sur mesure, notamment sur les clauses de responsabilité et de résiliation.
          </div>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="legal-content">
            <h2>1. Objet</h2>
            <p>
              Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et l'utilisation du site Troc, une plateforme d'échange de montures optiques entre opticiens professionnels. Troc met en relation des opticiens souhaitant échanger du stock invendu, directement entre boutiques, sans intervention d'un fournisseur tiers.
            </p>
            <p>
              L'utilisation du service implique l'acceptation pleine et entière des présentes CGU.
            </p>

            <h2>2. Un service réservé aux professionnels de l'optique</h2>
            <p>
              L'inscription sur Troc est réservée aux opticiens exerçant à titre professionnel. La création d'un compte nécessite la communication d'un numéro professionnel (Adeli ou RPPS) et, le cas échéant, d'un justificatif d'exercice. Toute fausse déclaration sur la qualité professionnelle de l'utilisateur peut entraîner la suspension immédiate du compte.
            </p>

            <h2>3. Fonctionnement du service</h2>
            <h3>Annonces</h3>
            <p>
              Chaque opticien peut publier des annonces décrivant une monture disponible à l'échange, avec une valeur indicative qu'il fixe lui-même. Cette valeur est déclarative et engage la responsabilité de son auteur quant à son exactitude raisonnable.
            </p>
            <h3>Échanges</h3>
            <p>
              Un opticien peut proposer un échange sur l'annonce d'un autre opticien. Les deux parties échangent librement par messagerie avant de valider l'échange. La validation d'un échange constitue un engagement entre les deux opticiens concernés — Troc n'est pas partie à cet engagement.
            </p>
            <h3>Système de points</h3>
            <p>
              Lorsque deux montures échangées n'ont pas la même valeur indicative, l'écart peut être comblé par un système de points internes à la plateforme. Les points :
            </p>
            <ul>
              <li>ne constituent en aucun cas une monnaie, un moyen de paiement ou un titre financier ;</li>
              <li>ne peuvent être ni achetés, ni vendus, ni convertis en argent réel, sous quelque forme que ce soit ;</li>
              <li>s'obtiennent uniquement par la conclusion d'échanges sur la plateforme, ainsi qu'un capital de bienvenue attribué à l'inscription ;</li>
              <li>sont plafonnés et ne peuvent descendre en dessous d'un seuil minimal, selon les règles en vigueur sur la plateforme.</li>
            </ul>
            <p>
              Les deux opticiens conservent toujours la possibilité de valider un échange sans recourir à cette compensation en points, par simple accord mutuel.
            </p>

            <h2>4. Obligations des utilisateurs</h2>
            <p>Chaque utilisateur s'engage à :</p>
            <ul>
              <li>fournir des informations exactes lors de son inscription et dans ses annonces ;</li>
              <li>décrire fidèlement l'état et les caractéristiques des montures proposées à l'échange ;</li>
              <li>respecter les engagements pris envers les autres opticiens dans le cadre d'un échange validé, notamment les délais d'expédition ;</li>
              <li>ne pas détourner le service à des fins de vente déguisée ou de toute activité étrangère au troc entre professionnels.</li>
            </ul>

            <h2>5. Responsabilité de Troc</h2>
            <p>
              Troc agit en tant qu'intermédiaire technique mettant à disposition une plateforme de mise en relation. Troc n'intervient pas dans l'exécution matérielle des échanges (expédition, réception, conformité des montures) et ne saurait être tenu responsable des litiges entre opticiens portant sur l'état, la conformité ou l'authenticité d'une monture échangée.
            </p>
            <p>
              Troc s'efforce d'assurer la disponibilité et la sécurité du service, sans garantie de disponibilité continue.
            </p>

            <h2>6. Suspension et résiliation</h2>
            <p>
              Troc se réserve le droit de suspendre ou de résilier, sans préavis en cas de manquement grave, le compte d'un utilisateur ne respectant pas les présentes CGU, notamment en cas de fausse déclaration de qualité professionnelle ou de comportement frauduleux envers d'autres membres.
            </p>
            <p>
              Tout utilisateur peut demander la suppression de son compte à tout moment.
            </p>

            <h2>7. Données personnelles</h2>
            <p>
              Le traitement des données personnelles des utilisateurs, y compris le numéro professionnel Adeli/RPPS, est détaillé dans la <Link to="/confidentialite">politique de confidentialité</Link>.
            </p>

            <h2>8. Modification des CGU</h2>
            <p>
              Troc peut être amené à modifier les présentes CGU, notamment pour refléter une évolution du service ou de la réglementation applicable. Les utilisateurs seront informés de toute modification substantielle.
            </p>

            <h2>9. Droit applicable et litiges</h2>
            <p>
              Les présentes CGU sont soumises au droit français. En cas de litige, une résolution amiable sera recherchée en priorité ; à défaut, les tribunaux français compétents seront seuls saisis.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
