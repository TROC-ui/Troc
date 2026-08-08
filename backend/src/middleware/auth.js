import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Session expirée, merci de vous reconnecter' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ message: 'Session expirée, merci de vous reconnecter' })
  }
}

// À utiliser après verifyToken : réservé aux comptes isAdmin=true.
export async function requireAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { isAdmin: true } })
    if (!user?.isAdmin) {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' })
    }
    next()
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification des droits' })
  }
}
