import express from 'express'
import { verifyToken, requireAdmin } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.use(verifyToken, requireAdmin)

// GET /admin/verifications - List all verification requests
router.get('/verifications', async (req, res) => {
  try {
    const verifications = await prisma.verification.findMany({
      include: { user: { select: { id: true, shopName: true, email: true, address: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(verifications)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des vérifications' })
  }
})

// PUT /admin/verifications/:id - Approve or reject a verification request
router.put('/verifications/:id', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' })
    }

    const verification = await prisma.verification.findUnique({ where: { id: req.params.id } })
    if (!verification) {
      return res.status(404).json({ message: 'Demande de vérification introuvable' })
    }

    const updated = await prisma.verification.update({
      where: { id: req.params.id },
      data: {
        status,
        rejectionReason: status === 'rejected' ? (rejectionReason || null) : null,
      },
    })

    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de la vérification' })
  }
})

export default router
