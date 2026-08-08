import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useSEO } from '../hooks/useSEO'
import './Legal.css'
import './Accounting.css'

export default function Privacy() {
  useSEO('Politique de confidentialité')
  return (
    <>
      <header className="hero" style={{ padding: '48px 0 40px' }}>
        <div className="wrap" style={{ display: 'block', maxWidth: '760px' }}>
          <div className="eyebrow">
            <Logo size="tiny" />
            <span>Vie privée</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 3.8vw, 44px)' }}>Politique de confidentialité.</h1>
          <div className="disclaimer-box">
            <strong>Document à faire valider avant ouverture réelle du service.</strong> Cette page décrit fidèlement les données collectées et traitées telles qu'implémentées sur la plateforme aujourd'hui. Les informations marquées <span className="placeholder" style={{ color: '#a97e22' }}>entre crochets</span> restent à compléter avec l'identité réelle du responsable de traitement, et l'ensemble à faire relire par un professionnel du droit (RGPD) avant tout traitement de données réelles.
          </div>
        </div>
      </header>

      <section>
        <div className="wrap">
          <div className="legal-content">
            <h2>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données collectées sur Troc est l'éditeur du site, une personne physique agissant à titre individuel (aucune société n'est immatriculée à ce jour), joignable à troc.gestion@gmail.com pour toute question relative à vos données personnelles. Son identité complète est communiquée à l'hébergeur du site (voir les <Link to="/mentions-legales">mentions légales</Link>) et reste disponible sur demande motivée d'une autorité compétente, notamment la CNIL.
            </p>

            <h2>2. Données collectées</h2>
            <p>Dans le cadre du fonctionnement du service, Troc collecte et traite les données suivantes :</p>
            <ul>
              <li><strong>Données de compte :</strong> nom de la boutique, adresse e-mail professionnelle, mot de passe (jamais stocké en clair, uniquement sous forme hachée), zone géographique d'échange.</li>
              <li><strong>Données de vérification professionnelle :</strong> numéro Adeli ou RPPS, et le justificatif d'exercice éventuellement transmis, utilisés uniquement pour confirmer la qualité d'opticien professionnel.</li>
              <li><strong>Contenus publiés :</strong> annonces (titre, marque, état, valeur indicative, description) et photographies associées.</li>
              <li><strong>Échanges et messagerie :</strong> historique des propositions d'échange, messages échangés entre opticiens dans le cadre d'un échange, statut et suivi (expédition, réception).</li>
              <li><strong>Solde de points :</strong> historique des mouvements de points liés à vos échanges.</li>
              <li><strong>Données techniques :</strong> horodatage de connexion, jeton de session (stocké localement dans votre navigateur, jamais sous forme de cookie tiers).</li>
            </ul>

            <h2>3. Finalités du traitement</h2>
            <p>Ces données sont traitées pour :</p>
            <ul>
              <li>créer et sécuriser votre compte, et vérifier votre qualité de professionnel de l'optique ;</li>
              <li>permettre la publication d'annonces et la mise en relation entre opticiens pour un échange ;</li>
              <li>assurer le suivi d'un échange (messagerie, statut, solde de points) ;</li>
              <li>assurer la sécurité du service et prévenir les fraudes ;</li>
              <li>répondre à vos demandes lorsque vous nous contactez.</li>
            </ul>
            <p>
              Aucune donnée n'est utilisée à des fins de prospection commerciale tierce, ni cédée ou vendue à des tiers.
            </p>

            <h2>4. Base légale</h2>
            <p>
              Ces traitements reposent sur l'exécution du contrat qui vous lie à Troc lors de votre inscription (fourniture du service), ainsi que sur l'intérêt légitime de Troc à assurer la sécurité et le bon fonctionnement de la plateforme, notamment la vérification de la qualité professionnelle des utilisateurs.
            </p>

            <h2>5. Destinataires des données</h2>
            <p>
              Vos données sont accessibles à l'équipe technique de Troc dans la stricte mesure nécessaire au fonctionnement du service, ainsi qu'à l'hébergeur du site (voir les <Link to="/mentions-legales">mentions légales</Link>). Certaines informations (nom de boutique, zone d'échange, avis reçus) sont visibles par les autres opticiens membres du réseau, dans le cadre normal du service.
            </p>
            <p>
              Aucune donnée n'est transmise à un tiers à des fins commerciales.
            </p>

            <h2>6. Durée de conservation</h2>
            <p>
              Vos données sont conservées pendant toute la durée de votre inscription sur la plateforme, puis archivées ou supprimées dans un délai raisonnable après la clôture de votre compte, sous réserve des obligations légales de conservation applicables.
            </p>

            <h2>7. Sécurité</h2>
            <p>
              Votre mot de passe est stocké sous forme hachée (bcrypt) et n'est jamais accessible en clair, y compris par notre équipe. L'accès aux données nécessite une authentification par jeton, non partagée entre comptes.
            </p>

            <h2>8. Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données personnelles.
            </p>
            <p>
              Pour exercer ces droits, contactez-nous à troc.gestion@gmail.com. Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr) si vous estimez que le traitement de vos données n'est pas conforme à la réglementation.
            </p>

            <h2>9. Cookies et traceurs</h2>
            <p>
              Troc n'utilise aucun cookie publicitaire ni traceur tiers. La connexion utilise un jeton de session stocké dans le stockage local de votre navigateur, nécessaire au seul fonctionnement du service, et supprimé lors de votre déconnexion.
            </p>

            <h2>10. Contact</h2>
            <p>
              Pour toute question relative à cette politique ou à vos données personnelles, contactez-nous à troc.gestion@gmail.com.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
