import express from 'express'
import { signup, login, getUser, requestPasswordReset, resetPassword } from '../services/authService.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, shopName, city, exchangeZone, professionalNumber } = req.body

    if (!email || !password || !shopName) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }

    const { user, token } = await signup({ email, password, shopName, city, exchangeZone, professionalNumber })

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

    // Pas d'envoi d'email configuré (pas de clé SendGrid) : le lien est
    // renvoyé directement dans la réponse pour un usage en développement.
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

    res.json({ message: 'Lien de réinitialisation généré', resetLink })
  } catch (error) {
    res.status(404).json({ message: error.message })
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
