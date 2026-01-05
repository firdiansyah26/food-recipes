import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import type PrismaTypes from '@pothos/plugin-prisma/generated'
import { prisma } from '../utils/prisma'
import type { AuthUser } from '../utils/auth'

// Context type for GraphQL resolvers
export interface Context {
  prisma: typeof prisma
  user: AuthUser | null
}

// Create the Pothos schema builder
const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes
  Context: Context
  Scalars: {
    DateTime: {
      Input: Date
      Output: Date
    }
  }
}>({
  plugins: [PrismaPlugin],
  prisma: {
    client: prisma,
    filterConnectionTotals: true,
    onUnusedQuery: process.env.NODE_ENV === 'production' ? null : 'warn',
  },
})

// Define custom scalar for DateTime
builder.scalarType('DateTime', {
  serialize: (value) => value.toISOString(),
  parseValue: (value) => new Date(value as string),
})

// Initialize Query type
builder.queryType({
  description: 'The root query type',
})

// Initialize Mutation type
builder.mutationType({
  description: 'The root mutation type',
})

export { builder }
