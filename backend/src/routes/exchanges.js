import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFDocument from 'pdfkit'
import { verifyToken } from '../middleware/auth.js'
import { PrismaClient } from '@prisma/client'
import { settleExchangePoints, reverseExchangePoints } from '../services/pointsService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logoBuffer = Buffer.from(
  fs.readFileSync(path.join(__dirname, '../assets/logo-base64.txt'), 'utf8').trim(),
  'base64'
)

// Charte graphique du site, reprise pour le PDF
const BRAND = {
  ink: '#14171C',
  inkDim: '#5C6560',
  violet: '#6F5CF0',
  teal: '#149C8C',
  paper: '#F2F4F0',
  line: '#E0E0E0',
}

function formatDate(date) {
  if (!date) return 'Non précisée'
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const router = express.Router()
const prisma = new PrismaClient()

// Champs utilisateur sûrs à exposer (jamais le hash du mot de passe)
const publicUserSelect = { id: true, shopName: true, avatar: true, createdAt: true }

// GET /exchanges - List user's exchanges
router.get('/', verifyToken, async (req, res) => {
  try {
    const exchanges = await prisma.exchange.findMany({
      where: {
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId },
        ],
      },
      include: {
        listing: true,
        sender: { select: publicUserSelect },
        receiver: { select: publicUserSelect },
        messages: true,
      },
    })
    res.json(exchanges)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des échanges' })
  }
})

// GET /exchanges/:id - Get single exchange
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: req.params.id },
      include: {
        listing: true,
        sender: { select: publicUserSelect },
        receiver: { select: publicUserSelect },
        messages: true,
      },
    })

    if (!exchange) {
      return res.status(404).json({ message: 'Échange introuvable' })
    }

    // Check authorization
    if (exchange.senderId !== req.userId && exchange.receiverId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    // Les points ne sont réellement réglés que si l'échange n'a pas été validé "sans compensation".
    const settlement = await prisma.pointTransaction.findFirst({
      where: { exchangeId: exchange.id },
    })

    res.json({ ...exchange, pointsSettled: settlement ? exchange.pointsNeeded : 0 })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement de l\'échange' })
  }
})

// POST /exchanges - Propose exchange
router.post('/', verifyToken, async (req, res) => {
  try {
    const { listingId, pointsNeeded, pointsDirection } = req.body

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return res.status(404).json({ message: 'Annonce introuvable' })
    }

    if (listing.userId === req.userId) {
      return res.status(400).json({ message: 'Impossible de proposer un échange sur votre propre annonce' })
    }

    const exchange = await prisma.exchange.create({
      data: {
        senderId: req.userId,
        receiverId: listing.userId,
        listingId,
        pointsNeeded: pointsNeeded || 0,
        pointsDirection,
      },
    })

    res.status(201).json(exchange)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de l\'échange' })
  }
})

// POST /exchanges/:id/messages - Send a message on an exchange
router.post('/:id/messages', verifyToken, async (req, res) => {
  try {
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message vide' })
    }

    const exchange = await prisma.exchange.findUnique({
      where: { id: req.params.id },
    })

    if (!exchange) {
      return res.status(404).json({ message: 'Échange introuvable' })
    }

    if (exchange.senderId !== req.userId && exchange.receiverId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    const receiverId = exchange.senderId === req.userId ? exchange.receiverId : exchange.senderId

    const message = await prisma.message.create({
      data: {
        exchangeId: exchange.id,
        senderId: req.userId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: { select: publicUserSelect },
      },
    })

    res.status(201).json(message)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'envoi du message' })
  }
})

// Transitions autorisées via cette route : SHIPPED/RECEIVED ne passent que par
// /ship et /receive, qui appliquent leurs propres règles de progression.
const ALLOWED_TRANSITIONS = {
  PROPOSED: ['DISCUSSION', 'ACCEPTED', 'CANCELLED'],
  DISCUSSION: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['CANCELLED'],
}

// PUT /exchanges/:id/status - Update exchange status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, skipPointsCompensation } = req.body

    const exchange = await prisma.exchange.findUnique({
      where: { id: req.params.id },
    })

    if (!exchange) {
      return res.status(404).json({ message: 'Échange introuvable' })
    }

    if (exchange.senderId !== req.userId && exchange.receiverId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    const allowedNext = ALLOWED_TRANSITIONS[exchange.status] || []
    if (!allowedNext.includes(status)) {
      return res.status(400).json({ message: 'Ce changement de statut n\'est pas autorisé à cette étape' })
    }

    if (status === 'CANCELLED' && (exchange.shippedBySender || exchange.shippedByReceiver)) {
      return res.status(400).json({ message: 'Impossible d\'annuler un échange dont l\'expédition a déjà commencé' })
    }

    const updated = await prisma.exchange.update({
      where: { id: req.params.id },
      data: { status },
    })

    // Règlement automatique des points quand l'échange passe à "Validé" (ACCEPTED),
    // sauf si les deux opticiens ont choisi de valider sans compensation.
    if (status === 'ACCEPTED') {
      await prisma.exchange.update({ where: { id: req.params.id }, data: { acceptedAt: new Date() } })
      if (!skipPointsCompensation) {
        await settleExchangePoints(updated)
      }
    }

    // Si l'échange avait déjà été validé avec compensation en points avant d'être
    // annulé, on rembourse intégralement les deux camps.
    if (status === 'CANCELLED' && exchange.status === 'ACCEPTED') {
      await reverseExchangePoints(exchange.id)
    }

    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du statut' })
  }
})

// POST /exchanges/:id/ship - Confirm shipping for the connected user's side
router.post('/:id/ship', verifyToken, async (req, res) => {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: req.params.id },
    })

    if (!exchange) {
      return res.status(404).json({ message: 'Échange introuvable' })
    }

    const isSender = exchange.senderId === req.userId
    const isReceiver = exchange.receiverId === req.userId
    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    if (!['ACCEPTED', 'SHIPPED'].includes(exchange.status)) {
      return res.status(400).json({ message: "L'échange doit être validé avant l'expédition" })
    }

    const data = isSender ? { shippedBySender: true } : { shippedByReceiver: true }
    const nowBothShipped = isSender
      ? exchange.shippedByReceiver
      : exchange.shippedBySender

    if (nowBothShipped) {
      data.status = 'SHIPPED'
      data.shippedAt = new Date()
    }

    const updated = await prisma.exchange.update({
      where: { id: req.params.id },
      data,
    })

    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la confirmation d\'expédition' })
  }
})

// POST /exchanges/:id/receive - Confirm reception (with photo) for the connected user's side
router.post('/:id/receive', verifyToken, async (req, res) => {
  try {
    const { photo } = req.body

    if (!photo) {
      return res.status(400).json({ message: 'Photo de réception obligatoire' })
    }

    const exchange = await prisma.exchange.findUnique({
      where: { id: req.params.id },
    })

    if (!exchange) {
      return res.status(404).json({ message: 'Échange introuvable' })
    }

    const isSender = exchange.senderId === req.userId
    const isReceiver = exchange.receiverId === req.userId
    if (!isSender && !isReceiver) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    if (!(exchange.shippedBySender && exchange.shippedByReceiver)) {
      return res.status(400).json({ message: 'Les deux colis doivent être expédiés avant la réception' })
    }

    const data = isSender
      ? { receivedBySender: true, receptionPhotoSender: photo }
      : { receivedByReceiver: true, receptionPhotoReceiver: photo }

    const nowBothReceived = isSender
      ? exchange.receivedByReceiver
      : exchange.receivedBySender

    if (nowBothReceived) {
      data.status = 'RECEIVED'
      data.receivedAt = new Date()
    }

    const updated = await prisma.exchange.update({
      where: { id: req.params.id },
      data,
    })

    // Échange entièrement terminé des deux côtés : l'annonce n'est plus disponible.
    if (data.status === 'RECEIVED') {
      await prisma.listing.update({
        where: { id: exchange.listingId },
        data: { status: 'exchanged' },
      })
    }

    res.json(updated)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la confirmation de réception' })
  }
})

// GET /exchanges/:id/review - Get the connected user's review for this exchange, if any
router.get('/:id/review', verifyToken, async (req, res) => {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: req.params.id },
    })

    if (!exchange) {
      return res.status(404).json({ message: 'Échange introuvable' })
    }

    if (exchange.senderId !== req.userId && exchange.receiverId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    const review = await prisma.review.findFirst({
      where: { exchangeId: exchange.id, reviewerId: req.userId },
    })

    res.json(review)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement de l\'avis' })
  }
})

// POST /exchanges/:id/review - Leave a review about the other party of a completed exchange
router.post('/:id/review', verifyToken, async (req, res) => {
  try {
    const { rating, comment, compliance, shippingSpeed, itemCondition } = req.body

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La note doit être comprise entre 1 et 5' })
    }

    const exchange = await prisma.exchange.findUnique({
      where: { id: req.params.id },
    })

    if (!exchange) {
      return res.status(404).json({ message: 'Échange introuvable' })
    }

    if (exchange.senderId !== req.userId && exchange.receiverId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    if (!(exchange.receivedBySender && exchange.receivedByReceiver)) {
      return res.status(400).json({ message: 'L\'échange doit être entièrement finalisé avant de laisser un avis' })
    }

    const existing = await prisma.review.findFirst({
      where: { exchangeId: exchange.id, reviewerId: req.userId },
    })
    if (existing) {
      return res.status(400).json({ message: 'Vous avez déjà laissé un avis pour cet échange' })
    }

    const reviewedId = exchange.senderId === req.userId ? exchange.receiverId : exchange.senderId

    const review = await prisma.review.create({
      data: {
        reviewerId: req.userId,
        reviewedId,
        exchangeId: exchange.id,
        rating,
        comment: comment?.trim() || null,
        compliance: typeof compliance === 'boolean' ? compliance : null,
        shippingSpeed: typeof shippingSpeed === 'boolean' ? shippingSpeed : null,
        itemCondition: typeof itemCondition === 'boolean' ? itemCondition : null,
      },
    })

    res.status(201).json(review)
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'envoi de l\'avis' })
  }
})

// GET /exchanges/:id/justificatif - Generate a PDF summary of a completed exchange
router.get('/:id/justificatif', verifyToken, async (req, res) => {
  try {
    const exchange = await prisma.exchange.findUnique({
      where: { id: req.params.id },
      include: {
        listing: true,
        sender: { select: { id: true, shopName: true, address: true } },
        receiver: { select: { id: true, shopName: true, address: true } },
      },
    })

    if (!exchange) {
      return res.status(404).json({ message: 'Échange introuvable' })
    }

    if (exchange.senderId !== req.userId && exchange.receiverId !== req.userId) {
      return res.status(403).json({ message: 'Action non autorisée' })
    }

    if (exchange.status !== 'RECEIVED') {
      return res.status(400).json({ message: "Cet échange n'est pas encore terminé" })
    }

    // Les points ne sont réellement réglés que si l'échange n'a pas été validé "sans compensation".
    const settlement = await prisma.pointTransaction.findFirst({
      where: { exchangeId: exchange.id },
    })
    const pointsSettled = settlement ? exchange.pointsNeeded : 0

    const doc = new PDFDocument({ margin: 0, size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=justificatif-echange-${exchange.id}.pdf`)
    doc.pipe(res)

    const pageWidth = doc.page.width
    const margin = 50

    // --- Bandeau d'en-tête ---
    // Le logo est un dessin noir sur fond transparent : sur un bandeau sombre il serait
    // invisible, donc on le pose sur un médaillon clair pour garder le contraste.
    doc.rect(0, 0, pageWidth, 130).fill(BRAND.ink)
    doc.circle(margin + 27, 65, 27).fill(BRAND.paper)
    doc.image(logoBuffer, margin + 8, 46, { width: 38 })

    doc.fillColor(BRAND.paper)
      .font('Helvetica-Bold').fontSize(22)
      .text('Troc', margin + 70, 42)
    doc.font('Helvetica').fontSize(11).fillColor('#9aa39e')
      .text("Justificatif d'échange entre opticiens", margin + 70, 70)

    // --- Corps du document ---
    let y = 165

    doc.fillColor(BRAND.inkDim).fontSize(9).font('Helvetica')
      .text(
        'Ce document récapitule un échange conclu entre deux opticiens membres du réseau Troc. ' +
        "Il ne remplace pas une facture ni un conseil comptable ou fiscal.",
        margin, y, { width: pageWidth - margin * 2 }
      )
    y += 50

    // Bloc référence, dans un encadré clair
    doc.roundedRect(margin, y, pageWidth - margin * 2, 60, 8).fill(BRAND.paper)
    doc.fillColor(BRAND.ink).font('Helvetica-Bold').fontSize(10)
      .text("RÉFÉRENCE DE L'ÉCHANGE", margin + 20, y + 14)
    doc.font('Helvetica').fontSize(11)
      .text(exchange.id, margin + 20, y + 30)
    doc.font('Helvetica-Bold').fontSize(10)
      .text('DATE DE FINALISATION', margin + 300, y + 14)
    doc.font('Helvetica').fontSize(11)
      .text(formatDate(exchange.receivedAt), margin + 300, y + 30)
    y += 90

    // Titre de section avec liseré coloré
    const sectionTitle = (label, color) => {
      doc.rect(margin, y, 4, 16).fill(color)
      doc.fillColor(BRAND.ink).font('Helvetica-Bold').fontSize(13)
        .text(label, margin + 14, y)
      y += 30
    }

    sectionTitle('Parties concernées', BRAND.violet)
    doc.font('Helvetica').fontSize(11).fillColor(BRAND.ink)
    doc.text(`Opticien expéditeur — ${exchange.sender.shopName} (${exchange.sender.address || 'zone non précisée'})`, margin, y)
    y += 18
    doc.text(`Opticien destinataire — ${exchange.receiver.shopName} (${exchange.receiver.address || 'zone non précisée'})`, margin, y)
    y += 40

    sectionTitle('Montures échangées', BRAND.teal)
    doc.font('Helvetica').fontSize(11).fillColor(BRAND.ink)
    doc.text(
      `${exchange.receiver.shopName} a cédé : ${exchange.listing.title} — valeur indicative ${exchange.listing.indicativeValue ?? 'non précisée'}€`,
      margin, y, { width: pageWidth - margin * 2 }
    )
    y += 18
    doc.text(
      `${exchange.sender.shopName} a proposé en retour : ${exchange.listing.searchingFor || 'non précisé'}`,
      margin, y, { width: pageWidth - margin * 2 }
    )
    y += 40

    sectionTitle('Écart réglé en points', BRAND.violet)
    doc.font('Helvetica').fontSize(11).fillColor(BRAND.ink)
    if (pointsSettled > 0) {
      const payerName = exchange.pointsDirection === 'sender_to_receiver' ? exchange.sender.shopName : exchange.receiver.shopName
      const payeeName = exchange.pointsDirection === 'sender_to_receiver' ? exchange.receiver.shopName : exchange.sender.shopName
      doc.text(`${pointsSettled} points, réglés de ${payerName} vers ${payeeName}, sans aucune contrepartie en argent réel.`, margin, y, { width: pageWidth - margin * 2 })
    } else {
      doc.text('Aucun point transféré — échange validé sans compensation par les deux parties.', margin, y, { width: pageWidth - margin * 2 })
    }
    y += 60

    // --- Pied de page ---
    const footerY = doc.page.height - 70
    doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).strokeColor(BRAND.line).stroke()
    doc.fontSize(8).fillColor('#9aa39e').font('Helvetica')
      .text("Généré automatiquement par Troc — réseau d'échange entre opticiens.", margin, footerY + 12)
      .text(`Document généré le ${formatDate(new Date())}`, margin, footerY + 24)

    doc.end()
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la génération du justificatif' })
  }
})

export default router
