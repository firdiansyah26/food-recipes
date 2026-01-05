# Nuxt Food Recipes

A full-stack recipe web application with CMS, blog articles, and user engagement features built with Nuxt 3, GraphQL, PostgreSQL, and Prisma.

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)](https://graphql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

## Features

### Public Features
- Browse and search recipes with filters (category, difficulty, tags)
- View detailed recipe pages with ingredients, step-by-step instructions
- Read blog articles about cooking tips and food culture
- User registration and authentication
- Rate and comment on recipes
- Save favorite recipes

### User Features
- Personal profile management
- Password change with session management
- View and manage favorite recipes
- Comment on recipes and articles
- Rate recipes (1-5 stars)

### Admin CMS Dashboard
- Complete recipe management (CRUD)
- Article/blog management
- Category and tag management
- User management
- Media management (Cloudinary integration ready)

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Nuxt 3 (Vue 3, SSR) |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma |
| **API** | GraphQL (graphql-yoga + Pothos) |
| **Authentication** | JWT with refresh tokens |
| **Forms** | VeeValidate + Zod |
| **Styling** | Tailwind CSS + Nuxt UI |
| **Language** | TypeScript |

## Project Structure

```
nuxt-food-recipes/
├── app/
│   ├── components/
│   │   └── recipe/
│   │       └── RecipeCard.vue      # Recipe card component
│   ├── composables/
│   │   ├── useAuth.ts              # Authentication composable
│   │   └── useGraphQL.ts           # GraphQL client composable
│   ├── layouts/
│   │   ├── default.vue             # Public layout
│   │   └── admin.vue               # Admin dashboard layout
│   ├── middleware/
│   │   ├── auth.ts                 # Auth protection middleware
│   │   └── admin.ts                # Admin protection middleware
│   ├── pages/
│   │   ├── index.vue               # Homepage
│   │   ├── favorites.vue           # User favorites
│   │   ├── auth/
│   │   │   ├── login.vue           # Login page
│   │   │   └── register.vue        # Registration page
│   │   ├── recipes/
│   │   │   ├── index.vue           # Recipe listing
│   │   │   └── [slug].vue          # Recipe detail
│   │   ├── articles/
│   │   │   ├── index.vue           # Article listing
│   │   │   └── [slug].vue          # Article detail
│   │   ├── profile/
│   │   │   └── index.vue           # User profile
│   │   └── admin/
│   │       ├── index.vue           # Admin dashboard
│   │       ├── recipes/            # Recipe management
│   │       ├── articles/           # Article management
│   │       ├── categories/         # Category management
│   │       └── tags/               # Tag management
│   └── schemas/
│       ├── auth.ts                 # Auth validation schemas
│       └── recipe.ts               # Recipe validation schemas
├── server/
│   ├── api/
│   │   └── graphql.ts              # GraphQL endpoint
│   ├── graphql/
│   │   ├── builder.ts              # Pothos schema builder
│   │   └── schema/
│   │       ├── index.ts            # Schema exports
│   │       ├── user.ts             # User type & resolvers
│   │       ├── recipe.ts           # Recipe type & resolvers
│   │       ├── category.ts         # Category type & resolvers
│   │       └── article.ts          # Article type & resolvers
│   └── utils/
│       ├── prisma.ts               # Prisma client
│       └── auth.ts                 # Auth utilities (JWT, bcrypt)
└── prisma/
    └── schema.prisma               # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (or use [Neon](https://neon.tech) for serverless)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nuxt-food-recipes
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
   JWT_EXPIRES_IN="15m"

   # Cloudinary (optional - for image uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # App URL
   NUXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # (Optional) Open Prisma Studio to manage data
   npx prisma studio
   ```

5. **Seed the database (optional)**

   Create some initial categories and an admin user through Prisma Studio or create a seed script.

### Development

Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Production

Build for production:
```bash
pnpm build
```

Preview the production build:
```bash
pnpm preview
```

## API Documentation

### GraphQL Endpoint

The GraphQL API is available at `/api/graphql`

### Key Queries

```graphql
# Get recipes with filters
query Recipes($filter: RecipeFilterInput, $skip: Int, $take: Int) {
  recipes(filter: $filter, skip: $skip, take: $take) {
    id
    title
    slug
    description
    image
    difficulty
    prepTime
    cookTime
    averageRating
    category { name }
    author { name }
  }
}

# Get single recipe
query Recipe($slug: String!) {
  recipe(slug: $slug) {
    id
    title
    description
    ingredients { name, amount, unit }
    steps { order, instruction }
    # ... more fields
  }
}

# Get categories
query Categories {
  categories {
    id
    name
    slug
    recipesCount
  }
}
```

### Key Mutations

```graphql
# User authentication
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    user { id, name, email, role }
  }
}

# Create recipe (authenticated)
mutation CreateRecipe($input: CreateRecipeInput!) {
  createRecipe(input: $input) {
    id
    slug
  }
}

# Rate recipe (authenticated)
mutation RateRecipe($recipeId: String!, $value: Int!) {
  rateRecipe(recipeId: $recipeId, value: $value) {
    id
    value
  }
}

# Toggle favorite (authenticated)
mutation ToggleFavorite($recipeId: String!) {
  toggleFavorite(recipeId: $recipeId)
}
```

## Authentication

The app uses JWT-based authentication with refresh tokens:

- **Access Token**: Short-lived (15 min), used for API requests
- **Refresh Token**: Long-lived (30 days), stored in database, used to get new access tokens
- **Token Rotation**: Refresh tokens are rotated on each use for security

### User Roles

- `USER`: Can view content, comment, rate, and save favorites
- `ADMIN`: Full access to CMS dashboard and all management features

## Database Schema

### Core Models

- **User**: Authentication and profile data
- **Recipe**: Recipe content with metadata
- **Ingredient**: Recipe ingredients
- **Step**: Cooking instructions
- **Category**: Recipe/article categories
- **Tag**: Recipe tags (many-to-many)
- **Article**: Blog posts
- **Comment**: User comments on recipes/articles
- **Rating**: Recipe ratings (1-5)
- **Favorite**: User saved recipes

See `prisma/schema.prisma` for the complete schema.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Nuxt](https://nuxt.com) - The Vue Framework
- [Nuxt UI](https://ui.nuxt.com) - UI Component Library
- [Prisma](https://prisma.io) - Database ORM
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) - GraphQL Server
- [Pothos](https://pothos-graphql.dev) - GraphQL Schema Builder
