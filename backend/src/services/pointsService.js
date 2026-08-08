import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Règles du système de points : tolérance de découvert légère, plafonné, jamais acheté/converti en argent réel.
export const WELCOME_POINTS = 40
const MIN_BALANCE = -50
const MAX_BALANCE = 500

export async function adjustUserPoints(userId, delta, reason, exchangeId = null) {
  const existing = await prisma.userPoints.upsert({
    where: { userId },
    update: {},
    create: { userId, balance: 0 },
  })

  const rawBalance = existing.balance + delta
  const clampedBalance = Math.min(MAX_BALANCE, Math.max(MIN_BALANCE, rawBalance))
  const appliedDelta = clampedBalance - existing.balance

  const updated = await prisma.userPoints.update({
    where: { userId },
    data: { balance: clampedBalance },
  })

  if (appliedDelta !== 0) {
    await prisma.pointTransaction.create({
      data: {
        pointsId: existing.id,
        amount: appliedDelta,
        reason,
        exchangeId,
      },
    })
  }

  return updated
}

export async function settleExchangePoints(exchange) {
  const pointsToTransfer = Math.round(Math.abs(exchange.pointsNeeded || 0))

  if (pointsToTransfer === 0 || !exchange.pointsDirection) {
    return
  }

  // Empêche un double règlement si la route est appelée plusieurs fois pour le même échange.
  const alreadySettled = await prisma.pointTransaction.findFirst({
    where: { exchangeId: exchange.id },
  })
  if (alreadySettled) {
    return
  }

  if (exchange.pointsDirection === 'sender_to_receiver') {
    // L'expéditeur comble l'écart : il paie, le destinataire reçoit.
    await adjustUserPoints(exchange.senderId, -pointsToTransfer, 'exchange_settlement', exchange.id)
    await adjustUserPoints(exchange.receiverId, +pointsToTransfer, 'exchange_settlement', exchange.id)
  } else if (exchange.pointsDirection === 'receiver_to_sender') {
    await adjustUserPoints(exchange.receiverId, -pointsToTransfer, 'exchange_settlement', exchange.id)
    await adjustUserPoints(exchange.senderId, +pointsToTransfer, 'exchange_settlement', exchange.id)
  }
}

// Annule le règlement de points d'un échange (utilisé quand un échange déjà validé
// est annulé) en appliquant l'inverse exact de chaque transaction 'exchange_settlement'.
export async function reverseExchangePoints(exchangeId) {
  const settlements = await prisma.pointTransaction.findMany({
    where: { exchangeId, reason: 'exchange_settlement' },
    include: { points: true },
  })

  for (const tx of settlements) {
    await adjustUserPoints(tx.points.userId, -tx.amount, 'exchange_cancelled', exchangeId)
  }
}
