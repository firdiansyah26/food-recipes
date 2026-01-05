import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import type { User } from '@prisma/client'
import type { H3Event } from 'h3'

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-must-be-at-least-32-characters-long'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m' // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30 // Refresh token valid for 30 days
const SALT_ROUNDS = 10

// ==========================================
// Types
// ==========================================

export interface JWTPayload {
  userId: string
  email: string
  role: string
  type: 'access' | 'refresh'
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number // Access token expiry in seconds
}

export interface RefreshTokenInfo {
  userId: string
  userAgent?: string
  ipAddress?: string
}

// ==========================================
// Password Utilities
// ==========================================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ==========================================
// Access Token (JWT) Utilities
// ==========================================

/**
 * Generate a short-lived access token (JWT)
 */
export function generateAccessToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    type: 'access',
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    if (payload.type !== 'access') {
      return null
    }
    return payload
  }
  catch {
    return null
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  }
  catch {
    return null
  }
}

// ==========================================
// Refresh Token Utilities
// ==========================================

/**
 * Generate a secure random refresh token
 */
export function generateRefreshTokenString(): string {
  return crypto.randomBytes(64).toString('hex')
}

/**
 * Calculate refresh token expiry date
 */
export function getRefreshTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS)
  return expiry
}

/**
 * Create and store a refresh token in database
 */
export async function createRefreshToken(
  userId: string,
  options?: { userAgent?: string, ipAddress?: string },
): Promise<string> {
  const { prisma } = await import('./prisma')

  const token = generateRefreshTokenString()
  const expiresAt = getRefreshTokenExpiry()

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
      userAgent: options?.userAgent,
      ipAddress: options?.ipAddress,
    },
  })

  return token
}

/**
 * Verify a refresh token and return user info
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenInfo | null> {
  const { prisma } = await import('./prisma')

  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  })

  // Token not found
  if (!refreshToken) {
    return null
  }

  // Token is revoked
  if (refreshToken.isRevoked) {
    return null
  }

  // Token is expired
  if (refreshToken.expiresAt < new Date()) {
    // Clean up expired token
    await prisma.refreshToken.delete({ where: { id: refreshToken.id } })
    return null
  }

  return {
    userId: refreshToken.userId,
    userAgent: refreshToken.userAgent || undefined,
    ipAddress: refreshToken.ipAddress || undefined,
  }
}

/**
 * Rotate refresh token (invalidate old, create new)
 * This is a security best practice - each refresh token can only be used once
 */
export async function rotateRefreshToken(
  oldToken: string,
  options?: { userAgent?: string, ipAddress?: string },
): Promise<{ accessToken: string, refreshToken: string, user: AuthUser } | null> {
  const { prisma } = await import('./prisma')

  // Verify old token
  const oldRefreshToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  })

  if (!oldRefreshToken || oldRefreshToken.isRevoked || oldRefreshToken.expiresAt < new Date()) {
    // If token was already used (revoked), this might be a token theft attempt
    // Revoke all tokens for this user as a security measure
    if (oldRefreshToken?.isRevoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: oldRefreshToken.userId },
        data: { isRevoked: true },
      })
    }
    return null
  }

  // Revoke old token (mark as used)
  await prisma.refreshToken.update({
    where: { id: oldRefreshToken.id },
    data: { isRevoked: true },
  })

  // Create new tokens
  const newRefreshToken = await createRefreshToken(oldRefreshToken.userId, options)
  const accessToken = generateAccessToken(oldRefreshToken.user)

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: oldRefreshToken.user.id,
      email: oldRefreshToken.user.email,
      name: oldRefreshToken.user.name,
      role: oldRefreshToken.user.role,
      avatar: oldRefreshToken.user.avatar,
    },
  }
}

/**
 * Generate both access and refresh tokens for a user
 */
export async function generateTokenPair(
  user: Pick<User, 'id' | 'email' | 'role'>,
  options?: { userAgent?: string, ipAddress?: string },
): Promise<TokenPair> {
  const accessToken = generateAccessToken(user)
  const refreshToken = await createRefreshToken(user.id, options)

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  }
}

/**
 * Revoke a specific refresh token
 */
export async function revokeRefreshToken(token: string): Promise<boolean> {
  const { prisma } = await import('./prisma')

  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    })
    return true
  }
  catch {
    return false
  }
}

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
export async function revokeAllUserRefreshTokens(userId: string): Promise<number> {
  const { prisma } = await import('./prisma')

  const result = await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  })

  return result.count
}

/**
 * Clean up expired refresh tokens (run periodically)
 */
export async function cleanupExpiredRefreshTokens(): Promise<number> {
  const { prisma } = await import('./prisma')

  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { isRevoked: true, updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Revoked more than 7 days ago
      ],
    },
  })

  return result.count
}

/**
 * Get active sessions for a user
 */
export async function getUserSessions(userId: string) {
  const { prisma } = await import('./prisma')

  return prisma.refreshToken.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ==========================================
// Request Helpers
// ==========================================

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null

  const [type, token] = authHeader.split(' ')

  if (type !== 'Bearer' || !token) return null

  return token
}

/**
 * Get current user from request event (using access token)
 */
export async function getUserFromEvent(event: H3Event): Promise<AuthUser | null> {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)

  if (!token) return null

  const payload = verifyAccessToken(token)
  if (!payload) return null

  // Fetch user from database
  const { prisma } = await import('./prisma')
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
    },
  })

  return user
}

/**
 * Get client info from request event
 */
export function getClientInfo(event: H3Event): { userAgent?: string, ipAddress?: string } {
  return {
    userAgent: getHeader(event, 'user-agent') || undefined,
    ipAddress: getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
      || getHeader(event, 'x-real-ip')
      || event.node.req.socket?.remoteAddress
      || undefined,
  }
}

// ==========================================
// Slug Utilities
// ==========================================

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Create unique slug by appending random string if needed
 */
export function createUniqueSlug(text: string): string {
  const baseSlug = generateSlug(text)
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${baseSlug}-${randomSuffix}`
}
