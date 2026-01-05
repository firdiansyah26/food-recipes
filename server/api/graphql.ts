import { createYoga } from 'graphql-yoga'
import { schema } from '../graphql/schema'
import { prisma } from '../utils/prisma'
import { getUserFromEvent } from '../utils/auth'
import type { Context } from '../graphql/builder'

// Create GraphQL Yoga instance
const yoga = createYoga<Context>({
  schema,
  graphqlEndpoint: '/api/graphql',
  landingPage: false,
  graphiql: process.env.NODE_ENV === 'development',
})

export default defineEventHandler(async (event) => {
  // Get authenticated user from request
  const user = await getUserFromEvent(event)

  // Create context with prisma and user
  const context: Context = {
    prisma,
    user,
  }

  // Handle the GraphQL request
  const response = await yoga.handle(event.node.req, event.node.res, context)

  // Send response
  event.node.res.statusCode = response.status
  response.headers.forEach((value, key) => {
    event.node.res.setHeader(key, value)
  })

  const body = await response.text()
  return body
})
