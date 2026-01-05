import { builder } from '../builder'

// User type definition
builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name'),
    avatar: t.exposeString('avatar', { nullable: true }),
    role: t.exposeString('role'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    recipes: t.relation('recipes'),
    articles: t.relation('articles'),
    comments: t.relation('comments'),
    favorites: t.relation('favorites'),
    _count: t.relationCount('recipes', {
      description: 'Number of recipes created by this user',
    }),
  }),
})

// Session type for active sessions list
const Session = builder.objectRef<{
  id: string
  userAgent: string | null
  ipAddress: string | null
  createdAt: Date
  expiresAt: Date
}>('Session')

builder.objectType(Session, {
  fields: (t) => ({
    id: t.exposeID('id'),
    userAgent: t.exposeString('userAgent', { nullable: true }),
    ipAddress: t.exposeString('ipAddress', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime' }),
  }),
})

// Input types
const RegisterInput = builder.inputType('RegisterInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    name: t.string({ required: true }),
  }),
})

const LoginInput = builder.inputType('LoginInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
})

// Auth response type with both tokens
const AuthResponse = builder.objectRef<{
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar: string | null
  }
}>('AuthResponse')

builder.objectType(AuthResponse, {
  fields: (t) => ({
    accessToken: t.exposeString('accessToken'),
    refreshToken: t.exposeString('refreshToken'),
    expiresIn: t.exposeInt('expiresIn', {
      description: 'Access token expiry in seconds',
    }),
    user: t.field({
      type: 'User',
      resolve: (parent, _args, ctx) =>
        ctx.prisma.user.findUniqueOrThrow({ where: { id: parent.user.id } }),
    }),
  }),
})

// Token refresh response
const RefreshResponse = builder.objectRef<{
  accessToken: string
  refreshToken: string
  expiresIn: number
}>('RefreshResponse')

builder.objectType(RefreshResponse, {
  fields: (t) => ({
    accessToken: t.exposeString('accessToken'),
    refreshToken: t.exposeString('refreshToken'),
    expiresIn: t.exposeInt('expiresIn', {
      description: 'Access token expiry in seconds',
    }),
  }),
})

// Queries
builder.queryFields((t) => ({
  // Get current authenticated user
  me: t.prismaField({
    type: 'User',
    nullable: true,
    resolve: async (_query, _root, _args, ctx) => {
      if (!ctx.user) return null
      return ctx.prisma.user.findUnique({ where: { id: ctx.user.id } })
    },
  }),

  // Get user by ID (admin only)
  user: t.prismaField({
    type: 'User',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
      return ctx.prisma.user.findUnique({
        ...query,
        where: { id: args.id },
      })
    },
  }),

  // List all users (admin only)
  users: t.prismaField({
    type: ['User'],
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }
      return ctx.prisma.user.findMany({
        ...query,
        skip: args.skip ?? 0,
        take: args.take ?? 10,
        orderBy: { createdAt: 'desc' },
      })
    },
  }),

  // Get active sessions for current user
  mySessions: t.field({
    type: [Session],
    resolve: async (_root, _args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      const { getUserSessions } = await import('../../utils/auth')
      return getUserSessions(ctx.user.id)
    },
  }),
}))

// Mutations
builder.mutationFields((t) => ({
  // Register a new user
  register: t.field({
    type: AuthResponse,
    args: {
      input: t.arg({ type: RegisterInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const { hashPassword, generateTokenPair } = await import('../../utils/auth')

      // Check if email already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: args.input.email },
      })

      if (existingUser) {
        throw new Error('Email already registered')
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(args.input.password)
      const user = await ctx.prisma.user.create({
        data: {
          email: args.input.email,
          password: hashedPassword,
          name: args.input.name,
        },
      })

      // Generate token pair
      const tokens = await generateTokenPair(user)

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      }
    },
  }),

  // Login user
  login: t.field({
    type: AuthResponse,
    args: {
      input: t.arg({ type: LoginInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const { comparePassword, generateTokenPair } = await import('../../utils/auth')

      // Find user by email
      const user = await ctx.prisma.user.findUnique({
        where: { email: args.input.email },
      })

      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Verify password
      const validPassword = await comparePassword(args.input.password, user.password)
      if (!validPassword) {
        throw new Error('Invalid email or password')
      }

      // Generate token pair
      const tokens = await generateTokenPair(user)

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
      }
    },
  }),

  // Refresh access token using refresh token
  refreshToken: t.field({
    type: RefreshResponse,
    nullable: true,
    args: {
      refreshToken: t.arg.string({ required: true }),
    },
    resolve: async (_root, args) => {
      const { rotateRefreshToken } = await import('../../utils/auth')

      const result = await rotateRefreshToken(args.refreshToken)

      if (!result) {
        throw new Error('Invalid or expired refresh token')
      }

      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: 900, // 15 minutes
      }
    },
  }),

  // Logout (revoke refresh token)
  logout: t.boolean({
    args: {
      refreshToken: t.arg.string({ required: true }),
    },
    resolve: async (_root, args) => {
      const { revokeRefreshToken } = await import('../../utils/auth')
      return revokeRefreshToken(args.refreshToken)
    },
  }),

  // Logout from all devices
  logoutAll: t.int({
    description: 'Returns number of sessions revoked',
    resolve: async (_root, _args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      const { revokeAllUserRefreshTokens } = await import('../../utils/auth')
      return revokeAllUserRefreshTokens(ctx.user.id)
    },
  }),

  // Revoke a specific session
  revokeSession: t.boolean({
    args: {
      sessionId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      // Verify session belongs to user
      const session = await ctx.prisma.refreshToken.findUnique({
        where: { id: args.sessionId },
      })

      if (!session || session.userId !== ctx.user.id) {
        throw new Error('Session not found')
      }

      await ctx.prisma.refreshToken.update({
        where: { id: args.sessionId },
        data: { isRevoked: true },
      })

      return true
    },
  }),

  // Update user profile
  updateProfile: t.prismaField({
    type: 'User',
    args: {
      name: t.arg.string(),
      avatar: t.arg.string(),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      return ctx.prisma.user.update({
        ...query,
        where: { id: ctx.user.id },
        data: {
          ...(args.name && { name: args.name }),
          ...(args.avatar && { avatar: args.avatar }),
        },
      })
    },
  }),

  // Change password
  changePassword: t.boolean({
    args: {
      currentPassword: t.arg.string({ required: true }),
      newPassword: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      const { comparePassword, hashPassword, revokeAllUserRefreshTokens } = await import('../../utils/auth')

      // Get user with password
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verify current password
      const validPassword = await comparePassword(args.currentPassword, user.password)
      if (!validPassword) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password and update
      const hashedPassword = await hashPassword(args.newPassword)
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { password: hashedPassword },
      })

      // Revoke all refresh tokens (force re-login)
      await revokeAllUserRefreshTokens(ctx.user.id)

      return true
    },
  }),
}))
