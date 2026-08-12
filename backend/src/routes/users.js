import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'
import { comparePassword, hashPassword } from '../services/authService.js'

const router = express.Router()
const prisma = new PrismaClient()

// GET /users/favorites/mine - List the connected user's favorited profiles
router.get('/favorites/mine', verifyToken, async (req, res) => {
  try {
    const favorites = await prisma.favoriteUser.findMany({
      where: { userId: req.userId },
      include: {
        favoritedUser: {
          select: { id: true, shopName: true, avatar: true, address: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(favorites.map((f) => f.favoritedUser))
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des favoris' })
  }
})

// POST /users/:id/favorite - Toggle favorite on a user profile
router.post('/:id/favorite', verifyToken, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ message: 'Impossible de vous ajouter vous-même en favori' })
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!target) {
      return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    const existing = await prisma.favoriteUser.findUnique({
      where: { userId_favoritedUserId: { userId: req.userId, favoritedUserId: req.params.id } },
    })

    if (existing) {
      await prisma.favoriteUser.delete({ where: { id: existing.id } })
      return res.json({ favorited: false })
    }

    await prisma.favoriteUser.create({ data: { userId: req.userId, favoritedUserId: req.params.id } })
    res.json({ favorited: true })
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour des favoris' })
  }
})

// GET /users/verification/mine - Get the connected user's own verification request
router.get('/verification/mine', verifyToken, async (req, res) => {
  try {
    const verification = await prisma.verification.findUnique({ where: { userId: req.userId } })
    res.json(verification)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement de la vérification' })
  }
})

// PUT /users/verification/mine - Submit or resubmit a professional number for verification
router.put('/verification/mine', verifyToken, async (req, res) => {
  try {
    const { adeliNumber } = req.body

    if (!adeliNumber || !adeliNumber.trim()) {
      return res.status(400).json({ message: 'Numéro Adeli / RPPS requis' })
    }

    // Toute nouvelle soumission repart en attente, y compris après un refus.
    const verification = await prisma.verification.upsert({
      where: { userId: req.userId },
      update: { adeliNumber: adeliNumber.trim(), status: 'pending', rejectionReason: null },
      create: { userId: req.userId, adeliNumber: adeliNumber.trim(), status: 'pending' },
    })

    res.json(verification)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'envoi de la vérification' })
  }
})

// GET /users/:id - Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        shopName: true,
        avatar: true,
        address: true,
        createdAt: true,
        listings: {
          where: { status: 'active' },
        },
        receivedReviews: true,
        points: true,
        verification: { select: { status: true } },
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' })
    }

    const completedExchangesCount = await prisma.exchange.count({
      where: {
        status: 'RECEIVED',
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
    })

    res.json({ ...user, completedExchangesCount })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement du profil' })
  }
})

// GET /users/:id/reviews - Get user reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { reviewedId: req.params.id },
      include: { reviewer: { select: { id: true, shopName: true, avatar: true, createdAt: true } } },
    })

    res.json(reviews)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des avis' })
  }
})

// PUT /users/profile - Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { shopName, address, phone, avatar } = req.body

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: {
        shopName,
        address,
        phone,
        avatar,
      },
    })

    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du profil' })
  }
})

// PUT /users/password - Change the connected user's password
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit faire au moins 8 caractères' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const match = await comparePassword(currentPassword, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' })
    }

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } })

    res.json({ message: 'Mot de passe mis à jour' })
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors du changement de mot de passe' })
  }
})

// DELETE /users/me - Delete the connected user's account (cascade sur toutes
// ses données : annonces, échanges, messages, avis, points).
router.delete('/me', verifyToken, async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: 'Mot de passe requis pour confirmer la suppression' })
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    const match = await comparePassword(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Mot de passe incorrect' })
    }

    await prisma.user.delete({ where: { id: req.userId } })

    res.json({ message: 'Compte supprimé' })
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la suppression du compte' })
  }
})

// GET /users/:id/points - Get user points
router.get('/:id/points', async (req, res) => {
  try {
    const points = await prisma.userPoints.findUnique({
      where: { userId: req.params.id },
      include: { transactions: true },
    })

    if (!points) {
      return res.status(404).json({ message: 'Solde de points introuvable' })
    }

    res.json(points)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des points' })
  }
})

export default router
