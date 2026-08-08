import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// Champs utilisateur sûrs à exposer publiquement (jamais le hash du mot de passe)
const publicUserSelect = { id: true, shopName: true, avatar: true, createdAt: true }

// GET /listings - List all listings
router.get('/', async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: 'active' },
      include: { user: { select: publicUserSelect }, photos: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(listings)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des annonces' })
  }
})

// GET /listings/favorites/mine - List the connected user's favorited listings
router.get('/favorites/mine', verifyToken, async (req, res) => {
  try {
    const favorites = await prisma.favoriteListing.findMany({
      where: { userId: req.userId },
      include: { listing: { include: { user: { select: publicUserSelect }, photos: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(favorites.map((f) => f.listing))
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des favoris' })
  }
})

// POST /listings/:id/favorite - Toggle favorite on a listing
router.post('/:id/favorite', verifyToken, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } })
    if (!listing) {
      return res.status(404).json({ message: 'Annonce introuvable' })
    }

    const existing = await prisma.favoriteListing.findUnique({
      where: { userId_listingId: { userId: req.userId, listingId: req.params.id } },
    })

    if (existing) {
      await prisma.favoriteListing.delete({ where: { id: existing.id } })
      return res.json({ favorited: false })
    }

    await prisma.favoriteListing.create({ data: { userId: req.userId, listingId: req.params.id } })
    res.json({ favorited: true })
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour des favoris' })
  }
})

// GET /listings/:id - Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { user: { select: publicUserSelect }, photos: true },
    })
    if (!listing) {
      return res.status(404).json({ message: 'Annonce introuvable' })
    }
    res.json(listing)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement de l\'annonce' })
  }
})

// POST /listings - Create listing
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, brand, reference, size, condition, typology, shape, material, style, tags, description, indicativeValue, searchingFor, wantedNotes, location, photos } = req.body

    if (!title || !brand || !condition) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }

    if (!Array.isArray(photos) || photos.filter(Boolean).length < 3) {
      return res.status(400).json({ message: '3 photos minimum sont requises (face, profil, état des charnières)' })
    }

    const listing = await prisma.listing.create({
      data: {
        userId: req.userId,
        title,
        brand,
        reference,
        size,
        condition,
        typology,
        shape,
        material,
        style,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : null,
        description,
        indicativeValue: indicativeValue ? Number(indicativeValue) : null,
        searchingFor,
        wantedNotes,
        location,
        photos: Array.isArray(photos) && photos.length > 0
          ? { create: photos.map((url, order) => ({ url, order, userId: req.userId })) }
          : undefined,
      },
      include: { photos: true },
    })

    res.status(201).json(listing)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la publication de l\'annonce' })
  }
})

// PUT /listings/:id - Update listing
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    })

    if (!listing || listing.userId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    const { title, brand, reference, size, condition, typology, shape, material, style, tags, description, indicativeValue, searchingFor, wantedNotes, location, photos } = req.body

    if (!title || !brand || !condition) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' })
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        title,
        brand,
        reference,
        size,
        condition,
        typology,
        shape,
        material,
        style,
        tags: Array.isArray(tags) ? JSON.stringify(tags) : null,
        description,
        indicativeValue: indicativeValue ? Number(indicativeValue) : null,
        searchingFor,
        wantedNotes,
        location,
        // Remplace l'ensemble des photos plutôt que de les fusionner : plus simple
        // et suffisant pour un formulaire d'édition qui renvoie l'état complet.
        ...(Array.isArray(photos) ? {
          photos: {
            deleteMany: {},
            create: photos.filter(Boolean).map((url, order) => ({ url, order, userId: req.userId })),
          },
        } : {}),
      },
      include: { photos: true },
    })

    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'annonce' })
  }
})

// DELETE /listings/:id - Delete listing
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
    })

    if (!listing || listing.userId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    await prisma.listing.update({
      where: { id: req.params.id },
      data: { status: 'archived' },
    })

    res.json({ message: 'Annonce archivée' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression' })
  }
})

export default router
