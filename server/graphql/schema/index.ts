// Import all schema definitions to register types
import './user'
import './recipe'
import './category'
import './article'

// Export the builder for schema generation
import { builder } from '../builder'

// Build and export the schema
export const schema = builder.toSchema()
