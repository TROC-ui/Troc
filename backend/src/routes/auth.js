import express from 'express'
import { signup, login, getUser, requestPasswordReset, resetPassword } from '../services/authService.js'
import { verifyToken } from '../middleware/auth.js'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/mailService.js'

const router = express.Router()

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, shopName, city, exchangeZone, professionalNumber } = req.body

    if (!email || !password || !shopName) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }

    const { user, token } = await signup({ email, password, shopName, city, exchangeZone, professionalNumber })

    sendWelcomeEmail(user).catch(() => {})

    res.json({
      user: {
        id: user.id,
        email: user.email,
        shopName: user.shopName,
        address: user.address,
        isAdmin: user.isAdmin,
      },
      token,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }

    const { user, token } = await login(email, password)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        shopName: user.shopName,
        isAdmin: user.isAdmin,
      },
      token,
    })
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
})

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email requis' })
    }

    const resetToken = await requestPasswordReset(email)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

    if (process.env.SENDGRID_API_KEY) {
      // Envoi réel par email : le lien n'est jamais renvoyé dans la réponse HTTP
      // (sinon n'importe qui pourrait prendre le contrôle d'un compte en
      // connaissant juste son email).
      await sendPasswordResetEmail({ email }, resetLink)
      return res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' })
    }

    // Pas de clé SendGrid configurée (dev local) : le lien est renvoyé
    // directement dans la réponse pour pouvoir tester le flux sans email réel.
    if (process.env.NODE_ENV !== 'production') {
      return res.json({ message: 'Lien de réinitialisation généré', resetLink })
    }
    res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' })
  } catch (error) {
    // Message générique pour ne pas révéler si l'email existe en base.
    res.status(200).json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' })
  }
})

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères' })
    }

    await resetPassword(token, password)

    res.json({ message: 'Mot de passe mis à jour' })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// GET /auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await getUser(req.userId)
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement du profil' })
  }
})

export default router
