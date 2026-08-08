import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { WELCOME_POINTS } from './pointsService.js'

const prisma = new PrismaClient()
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1h

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

export async function signup(data) {
  const { email, password, shopName, city, exchangeZone, professionalNumber } = data

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('Un compte existe déjà avec cet email')
  }

  // Hash password
  const hashedPassword = await hashPassword(password)
  const address = [city, exchangeZone].filter(Boolean).join(' · ') || null

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      shopName,
      address,
    },
  })

  // Capital de points de bienvenue à la création du compte : accordé dès
  // l'inscription, indépendamment du statut de vérification professionnelle.
  // La transaction est tracée pour que l'historique des points reste complet
  // (sinon le solde de départ n'aurait aucune ligne d'origine).
  const userPoints = await prisma.userPoints.create({
    data: {
      userId: user.id,
      balance: WELCOME_POINTS,
    },
  })
  await prisma.pointTransaction.create({
    data: {
      pointsId: userPoints.id,
      amount: WELCOME_POINTS,
      reason: 'welcome_bonus',
    },
  })

  // Le numéro Adeli/RPPS saisi à l'inscription crée une demande de
  // vérification "pending", à valider manuellement côté admin.
  if (professionalNumber) {
    await prisma.verification.create({
      data: {
        userId: user.id,
        adeliNumber: professionalNumber,
        status: 'pending',
      },
    })
  }

  // Generate token
  const token = generateToken(user.id)

  return { user, token }
}

export async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('Email ou mot de passe incorrect')
  }

  const passwordMatch = await comparePassword(password, user.password)
  if (!passwordMatch) {
    throw new Error('Email ou mot de passe incorrect')
  }

  const token = generateToken(user.id)

  return { user, token }
}

export async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('Aucun compte associé à cet email')
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiresAt },
  })

  return resetToken
}

export async function resetPassword(token, newPassword) {
  const user = await prisma.user.findUnique({ where: { resetToken: token } })

  if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    throw new Error('Lien de réinitialisation invalide ou expiré')
  }

  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiresAt: null },
  })
}

export async function getUser(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      shopName: true,
      avatar: true,
      address: true,
      phone: true,
      isAdmin: true,
      createdAt: true,
      points: true,
      verification: { select: { status: true, adeliNumber: true, rejectionReason: true } },
    },
  })
}
