import sgMail from '@sendgrid/mail'

const FROM_EMAIL = 'troc.gestion@gmail.com'
const FROM_NAME = 'Troc'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Envoi silencieux : si aucune clé SendGrid n'est configurée (dev local,
// ou avant mise en place), on log au lieu d'échouer, pour ne jamais
// bloquer un flux (inscription, reset password) sur l'envoi d'email.
async function sendMail({ to, subject, html }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[mail] SENDGRID_API_KEY absente — email "${subject}" à ${to} non envoyé.`)
    return
  }
  try {
    await sgMail.send({ to, from: { email: FROM_EMAIL, name: FROM_NAME }, subject, html })
  } catch (error) {
    console.error('[mail] Échec de l\'envoi :', error.response?.body || error.message)
  }
}

function layout(title, bodyHtml) {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #14171C;">
      <div style="font-weight: 700; font-size: 20px; margin-bottom: 24px;">Troc</div>
      <h1 style="font-size: 22px; margin-bottom: 16px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 12px; color: #5C6560;">
        Troc — réseau d'échange entre opticiens.
      </p>
    </div>
  `
}

export async function sendWelcomeEmail(user) {
  await sendMail({
    to: user.email,
    subject: 'Bienvenue sur Troc',
    html: layout('Bienvenue sur Troc, ' + (user.shopName || '') + ' !', `
      <p style="line-height: 1.6;">Votre compte a été créé avec succès. Vous pouvez dès maintenant publier vos premières annonces et échanger avec d'autres opticiens du réseau.</p>
      <p style="line-height: 1.6;">Si vous avez renseigné un numéro Adeli/RPPS, votre vérification professionnelle est en cours d'examen par notre équipe.</p>
    `),
  })
}

export async function sendPasswordResetEmail(user, resetLink) {
  await sendMail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe Troc',
    html: layout('Réinitialisation de mot de passe', `
      <p style="line-height: 1.6;">Vous avez demandé la réinitialisation de votre mot de passe Troc. Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe (valable 1 heure) :</p>
      <p style="margin: 24px 0;">
        <a href="${resetLink}" style="background: #7c3aed; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 600;">Réinitialiser mon mot de passe</a>
      </p>
      <p style="line-height: 1.6; font-size: 13px; color: #5C6560;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
    `),
  })
}
