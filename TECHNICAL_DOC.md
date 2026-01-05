# Nuxt Food Recipes - Technical Documentation

## Overview
A full-stack recipe web application with CMS, blog articles, and user engagement features built with Nuxt 3, GraphQL, PostgreSQL, and Prisma.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Nuxt 3 Frontend (Vue 3)                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │   │
│  │  │  Pages   │  │Components│  │Composables│  │ VeeValidate+Zod │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    │ GraphQL Queries/Mutations           │
│                                    ▼                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTP POST /api/graphql
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SERVER (Nuxt Server Routes)                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    GraphQL Yoga + Pothos                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │   │
│  │  │ Schema   │  │ Resolvers│  │   Auth   │  │   Middleware     │ │   │
│  │  │ (Pothos) │  │          │  │  (JWT)   │  │                  │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    │ Prisma Client                       │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         Prisma ORM                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ SQL Queries
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database (Neon)                          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │
│  │ Users  │ │Recipes │ │Articles│ │Comments│ │Ratings │ │  Tags  │    │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

                    EXTERNAL SERVICES
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   Cloudinary   │  │    Algolia     │  │     Vercel     │
│  (Images)      │  │   (Search)     │  │  (Deployment)  │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## Data Flow Diagrams

### 1. Recipe Creation Flow (Admin)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  Admin   │     │  RecipeForm  │     │   GraphQL    │     │ Database │
│  User    │     │  (VeeValidate)│     │   Server     │     │          │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                  │                    │                  │
     │ 1. Fill form     │                    │                  │
     │─────────────────>│                    │                  │
     │                  │                    │                  │
     │                  │ 2. Validate (Zod)  │                  │
     │                  │──────────────────┐ │                  │
     │                  │                  │ │                  │
     │                  │<─────────────────┘ │                  │
     │                  │                    │                  │
     │                  │ 3. createRecipe    │                  │
     │                  │    mutation        │                  │
     │                  │───────────────────>│                  │
     │                  │                    │                  │
     │                  │                    │ 4. Prisma        │
     │                  │                    │    create()      │
     │                  │                    │─────────────────>│
     │                  │                    │                  │
     │                  │                    │ 5. Recipe data   │
     │                  │                    │<─────────────────│
     │                  │                    │                  │
     │                  │ 6. Response        │                  │
     │                  │<───────────────────│                  │
     │                  │                    │                  │
     │ 7. Success msg   │                    │                  │
     │<─────────────────│                    │                  │
     │                  │                    │                  │
```

### 2. Recipe Viewing Flow (Public)

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  User    │     │  Recipe Page │     │   GraphQL    │     │ Database │
│ (Browser)│     │   [slug].vue │     │   Server     │     │          │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                  │                    │                  │
     │ 1. Visit         │                    │                  │
     │    /recipes/xyz  │                    │                  │
     │─────────────────>│                    │                  │
     │                  │                    │                  │
     │                  │ 2. useAsyncData    │                  │
     │                  │    recipe(slug)    │                  │
     │                  │───────────────────>│                  │
     │                  │                    │                  │
     │                  │                    │ 3. Prisma        │
     │                  │                    │    findUnique()  │
     │                  │                    │─────────────────>│
     │                  │                    │                  │
     │                  │                    │ 4. Recipe +      │
     │                  │                    │    ingredients   │
     │                  │                    │    + steps       │
     │                  │                    │<─────────────────│
     │                  │                    │                  │
     │                  │ 5. Recipe data     │                  │
     │                  │<───────────────────│                  │
     │                  │                    │                  │
     │ 6. Rendered page │                    │                  │
     │    (SSR)         │                    │                  │
     │<─────────────────│                    │                  │
```

### 3. Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  User    │     │  Login Page  │     │   GraphQL    │     │ Database │
│          │     │              │     │   + Auth     │     │          │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                  │                    │                  │
     │ 1. Submit        │                    │                  │
     │    credentials   │                    │                  │
     │─────────────────>│                    │                  │
     │                  │                    │                  │
     │                  │ 2. login mutation  │                  │
     │                  │───────────────────>│                  │
     │                  │                    │                  │
     │                  │                    │ 3. Find user     │
     │                  │                    │─────────────────>│
     │                  │                    │                  │
     │                  │                    │ 4. User data     │
     │                  │                    │<─────────────────│
     │                  │                    │                  │
     │                  │                    │ 5. Verify bcrypt │
     │                  │                    │    password      │
     │                  │                    │                  │
     │                  │                    │ 6. Generate JWT  │
     │                  │                    │                  │
     │                  │ 7. JWT Token       │                  │
     │                  │<───────────────────│                  │
     │                  │                    │                  │
     │ 8. Store token   │                    │                  │
     │    (cookie)      │                    │                  │
     │    Redirect      │                    │                  │
     │<─────────────────│                    │                  │
```

### 4. Search Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  User    │     │ Search Input │     │   Algolia    │     │ Results  │
│          │     │              │     │   Client     │     │   Page   │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └────┬─────┘
     │                  │                    │                  │
     │ 1. Type query    │                    │                  │
     │─────────────────>│                    │                  │
     │                  │                    │                  │
     │                  │ 2. Debounce        │                  │
     │                  │    (300ms)         │                  │
     │                  │                    │                  │
     │                  │ 3. search()        │                  │
     │                  │───────────────────>│                  │
     │                  │                    │                  │
     │                  │ 4. Hits + facets   │                  │
     │                  │<───────────────────│                  │
     │                  │                    │                  │
     │                  │ 5. Display results │                  │
     │                  │───────────────────────────────────────>│
     │                  │                    │                  │
     │ 6. See results   │                    │                  │
     │<─────────────────────────────────────────────────────────│
```

---

## API Request/Response Examples

### GraphQL Endpoint
**URL:** `POST /api/graphql`

### Query: Get Recipe by Slug

**Request:**
```graphql
query GetRecipe($slug: String!) {
  recipe(slug: $slug) {
    id
    title
    description
    image
    prepTime
    cookTime
    servings
    difficulty
    author {
      name
      avatar
    }
    category {
      name
      slug
    }
    ingredients {
      name
      amount
      unit
    }
    steps {
      order
      instruction
      image
    }
    tags {
      name
      slug
    }
    ratings {
      value
    }
    averageRating
    commentsCount
  }
}
```

**Response:**
```json
{
  "data": {
    "recipe": {
      "id": "clx123abc",
      "title": "Classic Spaghetti Carbonara",
      "description": "A creamy Italian pasta dish...",
      "image": "https://res.cloudinary.com/.../carbonara.jpg",
      "prepTime": 15,
      "cookTime": 20,
      "servings": 4,
      "difficulty": "MEDIUM",
      "author": {
        "name": "Chef Mario",
        "avatar": "https://..."
      },
      "category": {
        "name": "Italian",
        "slug": "italian"
      },
      "ingredients": [
        { "name": "Spaghetti", "amount": "400", "unit": "g" },
        { "name": "Guanciale", "amount": "200", "unit": "g" }
      ],
      "steps": [
        { "order": 1, "instruction": "Boil pasta...", "image": null }
      ],
      "tags": [
        { "name": "Pasta", "slug": "pasta" }
      ],
      "ratings": [{ "value": 5 }, { "value": 4 }],
      "averageRating": 4.5,
      "commentsCount": 12
    }
  }
}
```

### Mutation: Create Recipe

**Request:**
```graphql
mutation CreateRecipe($input: CreateRecipeInput!) {
  createRecipe(input: $input) {
    id
    title
    slug
  }
}
```

**Variables:**
```json
{
  "input": {
    "title": "Homemade Pizza",
    "description": "Crispy thin crust pizza...",
    "prepTime": 30,
    "cookTime": 15,
    "servings": 4,
    "difficulty": "MEDIUM",
    "categoryId": "clx456def",
    "ingredients": [
      { "name": "Pizza dough", "amount": "500", "unit": "g" }
    ],
    "steps": [
      { "instruction": "Preheat oven to 250°C..." }
    ],
    "tagIds": ["clx789ghi"]
  }
}
```

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Framework** | Nuxt 3 | Vue 3, SSR, API routes |
| **Database** | PostgreSQL (Neon) | Serverless-compatible, free tier |
| **ORM** | Prisma | Type-safe, GraphQL-friendly |
| **GraphQL** | graphql-yoga + Pothos | Lightweight, type-safe schema |
| **Auth** | nuxt-auth-utils + JWT | Session-based for users, role-based for admins |
| **Forms** | VeeValidate + Zod | Form state, validation (like React Hook Form) |
| **Styling** | Tailwind CSS + Nuxt UI | Rapid UI development |
| **Search** | Algolia (or Meilisearch Cloud) | Fast recipe/article search |
| **Image Upload** | Cloudinary | Optimized images, free tier |
| **Deployment** | Vercel | Serverless, edge functions |

---

## Project Structure

```
nuxt-food-recipes/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── server/
│   ├── api/
│   │   └── graphql.ts         # GraphQL endpoint
│   ├── graphql/
│   │   ├── schema/            # Pothos schema definitions
│   │   ├── resolvers/         # GraphQL resolvers
│   │   └── builder.ts         # Pothos schema builder
│   ├── middleware/
│   │   └── auth.ts            # Auth middleware
│   └── utils/
│       ├── prisma.ts          # Prisma client
│       └── auth.ts            # Auth utilities
├── pages/
│   ├── index.vue              # Homepage
│   ├── recipes/
│   │   ├── index.vue          # Recipe listing
│   │   └── [slug].vue         # Recipe detail
│   ├── articles/
│   │   ├── index.vue          # Blog listing
│   │   └── [slug].vue         # Article detail
│   ├── auth/
│   │   ├── login.vue          # Login page
│   │   └── register.vue       # Register page
│   └── admin/                 # CMS Dashboard
│       ├── index.vue          # Dashboard home
│       ├── recipes/
│       │   ├── index.vue      # Manage recipes
│       │   ├── create.vue     # Create recipe
│       │   └── [id].vue       # Edit recipe
│       ├── articles/
│       ├── categories/
│       ├── users/
│       └── media/
├── components/
│   ├── recipe/                # Recipe components
│   ├── article/               # Article components
│   ├── admin/                 # Admin components
│   └── common/                # Shared components
├── composables/
│   ├── useAuth.ts             # Auth composable
│   ├── useRecipes.ts          # Recipe queries
│   └── useSearch.ts           # Search functionality
├── schemas/                   # Zod validation schemas
│   ├── auth.ts                # Login/register schemas
│   ├── recipe.ts              # Recipe form schemas
│   └── article.ts             # Article form schemas
├── layouts/
│   ├── default.vue            # Public layout
│   └── admin.vue              # Admin layout
└── assets/
    └── css/
        └── main.css           # Global styles
```

---

## Database Schema (Prisma)

```prisma
// Core Models
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  avatar        String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())

  recipes       Recipe[]  @relation("RecipeAuthor")
  articles      Article[] @relation("ArticleAuthor")
  comments      Comment[]
  ratings       Rating[]
  favorites     Favorite[]
}

enum Role {
  USER
  ADMIN
}

model Recipe {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  description   String
  image         String?
  prepTime      Int       // minutes
  cookTime      Int       // minutes
  servings      Int
  difficulty    Difficulty
  published     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  authorId      String
  author        User      @relation("RecipeAuthor", fields: [authorId], references: [id])
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])

  ingredients   Ingredient[]
  steps         Step[]
  tags          TagsOnRecipes[]
  comments      Comment[]
  ratings       Rating[]
  favorites     Favorite[]
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

model Ingredient {
  id          String  @id @default(cuid())
  name        String
  amount      String
  unit        String?
  recipeId    String
  recipe      Recipe  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

model Step {
  id          String  @id @default(cuid())
  order       Int
  instruction String
  image       String?
  recipeId    String
  recipe      Recipe  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  image       String?
  recipes     Recipe[]
  articles    Article[]
}

model Tag {
  id          String          @id @default(cuid())
  name        String          @unique
  slug        String          @unique
  recipes     TagsOnRecipes[]
}

model TagsOnRecipes {
  recipeId    String
  recipe      Recipe  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  tagId       String
  tag         Tag     @relation(fields: [tagId], references: [id])

  @@id([recipeId, tagId])
}

model Article {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  excerpt     String
  content     String
  image       String?
  published   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  authorId    String
  author      User      @relation("ArticleAuthor", fields: [authorId], references: [id])
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  comments    Comment[]
}

model Comment {
  id          String    @id @default(cuid())
  content     String
  createdAt   DateTime  @default(now())

  userId      String
  user        User      @relation(fields: [userId], references: [id])
  recipeId    String?
  recipe      Recipe?   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  articleId   String?
  article     Article?  @relation(fields: [articleId], references: [id], onDelete: Cascade)
}

model Rating {
  id          String  @id @default(cuid())
  value       Int     // 1-5

  userId      String
  user        User    @relation(fields: [userId], references: [id])
  recipeId    String
  recipe      Recipe  @relation(fields: [recipeId], references: [id], onDelete: Cascade)

  @@unique([userId, recipeId])
}

model Favorite {
  userId      String
  user        User    @relation(fields: [userId], references: [id])
  recipeId    String
  recipe      Recipe  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@id([userId, recipeId])
}
```

---

## Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize Nuxt 3 project with TypeScript
- [ ] Configure Tailwind CSS + Nuxt UI
- [ ] Setup PostgreSQL (Neon) database
- [ ] Configure Prisma ORM with schema
- [ ] Setup GraphQL server (graphql-yoga + Pothos)
- [ ] Configure environment variables

### Phase 2: Authentication System
- [ ] Implement user registration/login
- [ ] Setup JWT token handling
- [ ] Create auth middleware (public/user/admin)
- [ ] Build login/register pages
- [ ] Add password hashing (bcrypt)

### Phase 3: Core Recipe Features
- [ ] GraphQL queries/mutations for recipes
- [ ] Recipe listing page with pagination
- [ ] Recipe detail page
- [ ] Category & tag filtering
- [ ] Ingredient & steps display

### Phase 4: CMS Admin Dashboard
- [ ] Admin layout with sidebar navigation
- [ ] Recipe management (CRUD)
- [ ] Article management (CRUD)
- [ ] Category & tag management
- [ ] User management
- [ ] Media upload integration (Cloudinary)

### Phase 5: Blog/Articles
- [ ] Article listing page
- [ ] Article detail page
- [ ] Rich text editor for content

### Phase 6: User Engagement
- [ ] Comments system
- [ ] Rating system (1-5 stars)
- [ ] Favorites/bookmarks
- [ ] User profile page

### Phase 7: Search & Filters
- [ ] Integrate Algolia/Meilisearch
- [ ] Search recipes by name/ingredients
- [ ] Filter by category, difficulty, time
- [ ] Search articles

### Phase 8: Polish & Deploy
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Deploy to Vercel
- [ ] Setup production database

---

## Key Dependencies

```json
{
  "dependencies": {
    "@nuxt/ui": "^2.x",
    "@prisma/client": "^5.x",
    "graphql": "^16.x",
    "graphql-yoga": "^5.x",
    "@pothos/core": "^3.x",
    "@pothos/plugin-prisma": "^3.x",
    "bcrypt": "^5.x",
    "jsonwebtoken": "^9.x",
    "algoliasearch": "^4.x",
    "cloudinary": "^1.x",
    "vee-validate": "^4.x",
    "@vee-validate/zod": "^4.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "@nuxtjs/tailwindcss": "^6.x"
  }
}
```

---

## GraphQL API Structure

### Queries
- `recipes(filter, pagination)` - List recipes
- `recipe(slug)` - Single recipe
- `articles(filter, pagination)` - List articles
- `article(slug)` - Single article
- `categories` - All categories
- `tags` - All tags
- `me` - Current user
- `search(query)` - Search recipes/articles

### Mutations
- `register(input)` / `login(input)` / `logout`
- `createRecipe` / `updateRecipe` / `deleteRecipe`
- `createArticle` / `updateArticle` / `deleteArticle`
- `createComment` / `deleteComment`
- `rateRecipe(recipeId, value)`
- `toggleFavorite(recipeId)`
- `uploadImage(file)`

---

## Form Handling (VeeValidate + Zod)

VeeValidate is the Vue 3 equivalent of React Hook Form. Combined with Zod for schema validation, it provides type-safe, declarative form handling.

### Zod Schema Example (`schemas/recipe.ts`)
```typescript
import { z } from 'zod'

export const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  prepTime: z.number().min(1, 'Prep time is required'),
  cookTime: z.number().min(1, 'Cook time is required'),
  servings: z.number().min(1).max(100),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  categoryId: z.string().min(1, 'Category is required'),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().min(1),
    unit: z.string().optional()
  })).min(1, 'At least one ingredient required'),
  steps: z.array(z.object({
    instruction: z.string().min(5)
  })).min(1, 'At least one step required')
})

export type RecipeFormData = z.infer<typeof recipeSchema>
```

### Form Component Example (`components/admin/RecipeForm.vue`)
```vue
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { recipeSchema, type RecipeFormData } from '~/schemas/recipe'

const { handleSubmit, errors, defineField, isSubmitting } = useForm<RecipeFormData>({
  validationSchema: toTypedSchema(recipeSchema),
  initialValues: {
    title: '',
    description: '',
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    difficulty: 'MEDIUM',
    categoryId: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    steps: [{ instruction: '' }]
  }
})

const [title, titleAttrs] = defineField('title')
const [description, descriptionAttrs] = defineField('description')
// ... other fields

const onSubmit = handleSubmit(async (values) => {
  // values is fully typed as RecipeFormData
  await createRecipe(values)
})
</script>

<template>
  <form @submit="onSubmit">
    <UFormGroup label="Title" :error="errors.title">
      <UInput v-model="title" v-bind="titleAttrs" />
    </UFormGroup>

    <UFormGroup label="Description" :error="errors.description">
      <UTextarea v-model="description" v-bind="descriptionAttrs" />
    </UFormGroup>

    <!-- Dynamic ingredients with useFieldArray -->
    <!-- ... -->

    <UButton type="submit" :loading="isSubmitting">
      Save Recipe
    </UButton>
  </form>
</template>
```

### Key VeeValidate Features Used
- `useForm()` - Main hook for form state (like useForm in RHF)
- `defineField()` - Create reactive field bindings
- `useFieldArray()` - Handle dynamic arrays (ingredients, steps)
- `handleSubmit()` - Form submission with validation
- `errors` - Reactive validation errors object
- `isSubmitting` - Loading state during submission
- `toTypedSchema()` - Zod integration for type-safe validation

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Algolia (Search)
ALGOLIA_APP_ID="your-app-id"
ALGOLIA_API_KEY="your-api-key"
ALGOLIA_SEARCH_KEY="your-search-only-key"

# App
NUXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Security Considerations

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PASSWORD HASHING (bcrypt)                                    │
│     ┌─────────────┐      ┌─────────────┐                        │
│     │  Plain PWD  │ ───> │  bcrypt     │ ───> Stored in DB      │
│     │  "secret"   │      │  10 rounds  │      "$2b$10$..."      │
│     └─────────────┘      └─────────────┘                        │
│                                                                  │
│  2. JWT TOKEN                                                    │
│     ┌─────────────────────────────────────────┐                 │
│     │ Header: { alg: "HS256", typ: "JWT" }    │                 │
│     │ Payload: { userId, role, exp, iat }     │                 │
│     │ Signature: HMAC-SHA256(secret)          │                 │
│     └─────────────────────────────────────────┘                 │
│                                                                  │
│  3. ROLE-BASED ACCESS CONTROL                                    │
│     ┌────────────┐    ┌────────────┐    ┌────────────┐          │
│     │   PUBLIC   │    │    USER    │    │   ADMIN    │          │
│     │  - View    │    │  - Comment │    │  - CRUD    │          │
│     │  - Search  │    │  - Rate    │    │  - Users   │          │
│     │            │    │  - Favorite│    │  - All     │          │
│     └────────────┘    └────────────┘    └────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Protected Routes

| Route Pattern | Access Level | Description |
|---------------|--------------|-------------|
| `/` | Public | Homepage |
| `/recipes/*` | Public | Recipe pages |
| `/articles/*` | Public | Article pages |
| `/auth/*` | Public (Guest only) | Login/Register |
| `/profile/*` | User | User profile |
| `/favorites` | User | User favorites |
| `/admin/*` | Admin only | CMS Dashboard |

### GraphQL Authorization

```typescript
// server/graphql/middleware/auth.ts
export function requireAuth(role?: 'USER' | 'ADMIN') {
  return (resolve, parent, args, context, info) => {
    if (!context.user) {
      throw new GraphQLError('Unauthorized', {
        extensions: { code: 'UNAUTHORIZED' }
      })
    }
    if (role === 'ADMIN' && context.user.role !== 'ADMIN') {
      throw new GraphQLError('Forbidden', {
        extensions: { code: 'FORBIDDEN' }
      })
    }
    return resolve(parent, args, context, info)
  }
}
```

---

## Error Handling

### GraphQL Error Response Format

```json
{
  "data": null,
  "errors": [
    {
      "message": "Recipe not found",
      "path": ["recipe"],
      "extensions": {
        "code": "NOT_FOUND",
        "statusCode": 404
      }
    }
  ]
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Duplicate entry |
| `INTERNAL_ERROR` | 500 | Server error |

### Frontend Error Handling

```typescript
// composables/useGraphQL.ts
export function useGraphQL() {
  const toast = useToast()

  async function query<T>(document: string, variables?: object): Promise<T> {
    try {
      const { data, errors } = await $fetch('/api/graphql', {
        method: 'POST',
        body: { query: document, variables }
      })

      if (errors?.length) {
        const error = errors[0]

        switch (error.extensions?.code) {
          case 'UNAUTHORIZED':
            navigateTo('/auth/login')
            break
          case 'FORBIDDEN':
            toast.add({ title: 'Access denied', color: 'red' })
            break
          default:
            toast.add({ title: error.message, color: 'red' })
        }

        throw new Error(error.message)
      }

      return data
    } catch (e) {
      toast.add({ title: 'Network error', color: 'red' })
      throw e
    }
  }

  return { query }
}
```

---

## Image Upload Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  User    │     │  Upload      │     │  Server      │     │ Cloudinary │
│  (Admin) │     │  Component   │     │  API         │     │            │
└────┬─────┘     └──────┬───────┘     └──────┬───────┘     └─────┬──────┘
     │                  │                    │                   │
     │ 1. Select file   │                    │                   │
     │─────────────────>│                    │                   │
     │                  │                    │                   │
     │                  │ 2. Validate        │                   │
     │                  │    (type, size)    │                   │
     │                  │                    │                   │
     │                  │ 3. Upload to       │                   │
     │                  │    /api/upload     │                   │
     │                  │───────────────────>│                   │
     │                  │                    │                   │
     │                  │                    │ 4. Upload to      │
     │                  │                    │    Cloudinary     │
     │                  │                    │──────────────────>│
     │                  │                    │                   │
     │                  │                    │ 5. Transform      │
     │                  │                    │    (resize, etc)  │
     │                  │                    │                   │
     │                  │                    │ 6. CDN URL        │
     │                  │                    │<──────────────────│
     │                  │                    │                   │
     │                  │ 7. Image URL       │                   │
     │                  │<───────────────────│                   │
     │                  │                    │                   │
     │ 8. Preview       │                    │                   │
     │<─────────────────│                    │                   │
```

### Cloudinary Upload Code

```typescript
// server/api/upload.post.ts
import { v2 as cloudinary } from 'cloudinary'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  const file = formData?.find(f => f.name === 'file')

  if (!file) throw createError({ statusCode: 400, message: 'No file' })

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(
    `data:${file.type};base64,${file.data.toString('base64')}`,
    {
      folder: 'recipes',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    }
  )

  return { url: result.secure_url }
})
```

---

## Database Entity Relationship

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                                   │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐          ┌──────────────┐
    │    User      │          │   Category   │
    ├──────────────┤          ├──────────────┤
    │ id           │          │ id           │
    │ email        │          │ name         │
    │ password     │          │ slug         │
    │ name         │          │ image        │
    │ avatar       │          └──────┬───────┘
    │ role         │                 │
    └──────┬───────┘                 │
           │                         │
           │ 1:N                     │ 1:N
           │                         │
           ▼                         ▼
    ┌──────────────┐          ┌──────────────┐
    │   Recipe     │◄─────────│   Article    │
    ├──────────────┤          ├──────────────┤
    │ id           │          │ id           │
    │ title        │          │ title        │
    │ slug         │          │ slug         │
    │ description  │          │ excerpt      │
    │ image        │          │ content      │
    │ prepTime     │          │ image        │
    │ cookTime     │          │ published    │
    │ servings     │          │ authorId ────┼─────┐
    │ difficulty   │          │ categoryId   │     │
    │ published    │          └──────────────┘     │
    │ authorId ────┼─────────────────────────────┘
    │ categoryId   │
    └──────┬───────┘
           │
           │ 1:N
           ▼
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │  Ingredient  │     │    Step      │     │ TagsOnRecipes│
    ├──────────────┤     ├──────────────┤     ├──────────────┤
    │ id           │     │ id           │     │ recipeId     │◄───┐
    │ name         │     │ order        │     │ tagId        │    │
    │ amount       │     │ instruction  │     └──────────────┘    │
    │ unit         │     │ image        │           │             │
    │ recipeId     │     │ recipeId     │           │             │
    └──────────────┘     └──────────────┘           ▼             │
                                              ┌──────────────┐    │
                                              │    Tag       │    │
                                              ├──────────────┤    │
                                              │ id           │    │
                                              │ name         │    │
                                              │ slug         │    │
                                              └──────────────┘    │
                                                                  │
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
    │   Comment    │     │   Rating     │     │  Favorite    │    │
    ├──────────────┤     ├──────────────┤     ├──────────────┤    │
    │ id           │     │ id           │     │ userId       │    │
    │ content      │     │ value (1-5)  │     │ recipeId ────┼────┘
    │ userId       │     │ userId       │     │ createdAt    │
    │ recipeId?    │     │ recipeId     │     └──────────────┘
    │ articleId?   │     └──────────────┘
    └──────────────┘
```

---

## Frontend Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT HIERARCHY                               │
└─────────────────────────────────────────────────────────────────────────┘

layouts/
├── default.vue ─────────────────────────────────────────────────────────┐
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  AppHeader                                                       │ │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────────┐│ │
│   │  │  Logo   │ │  Nav    │ │ Search  │ │  AuthButtons / Avatar   ││ │
│   │  └─────────┘ └─────────┘ └─────────┘ └─────────────────────────┘│ │
│   └─────────────────────────────────────────────────────────────────┘ │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  <slot /> (Page Content)                                         │ │
│   └─────────────────────────────────────────────────────────────────┘ │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  AppFooter                                                       │ │
│   └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘

├── admin.vue ───────────────────────────────────────────────────────────┐
│   ┌──────────────┐ ┌───────────────────────────────────────────────┐  │
│   │  AdminSidebar│ │  <slot /> (Admin Content)                     │  │
│   │  ┌──────────┐│ │                                               │  │
│   │  │ Dashboard││ │                                               │  │
│   │  │ Recipes  ││ │                                               │  │
│   │  │ Articles ││ │                                               │  │
│   │  │ Category ││ │                                               │  │
│   │  │ Users    ││ │                                               │  │
│   │  │ Media    ││ │                                               │  │
│   │  └──────────┘│ │                                               │  │
│   └──────────────┘ └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

components/recipe/
├── RecipeCard.vue ──────────────────────────────────────────────────────┐
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │  ┌───────────────────────────────────────────────────────────┐  │ │
│   │  │  Image                                                     │  │ │
│   │  └───────────────────────────────────────────────────────────┘  │ │
│   │  ┌───────────────────────────────────────────────────────────┐  │ │
│   │  │  Title                                                     │  │ │
│   │  │  Category Badge                                            │  │ │
│   │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │ │
│   │  │  │ 30min   │ │ Easy    │ │ 4.5     │ │ Fav     │         │  │ │
│   │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │  │ │
│   │  └───────────────────────────────────────────────────────────┘  │ │
│   └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Page Routes Summary

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `pages/index.vue` | Homepage with featured recipes |
| `/recipes` | `pages/recipes/index.vue` | Recipe listing with filters |
| `/recipes/:slug` | `pages/recipes/[slug].vue` | Recipe detail page |
| `/articles` | `pages/articles/index.vue` | Blog listing |
| `/articles/:slug` | `pages/articles/[slug].vue` | Article detail |
| `/auth/login` | `pages/auth/login.vue` | Login page |
| `/auth/register` | `pages/auth/register.vue` | Registration page |
| `/profile` | `pages/profile/index.vue` | User profile |
| `/favorites` | `pages/favorites.vue` | User saved recipes |
| `/admin` | `pages/admin/index.vue` | Admin dashboard |
| `/admin/recipes` | `pages/admin/recipes/index.vue` | Manage recipes |
| `/admin/recipes/create` | `pages/admin/recipes/create.vue` | Create recipe |
| `/admin/recipes/:id` | `pages/admin/recipes/[id].vue` | Edit recipe |
| `/admin/articles` | `pages/admin/articles/index.vue` | Manage articles |
| `/admin/categories` | `pages/admin/categories/index.vue` | Manage categories |
| `/admin/users` | `pages/admin/users/index.vue` | Manage users |

---

## Notes

- **Serverless Considerations**: Using Neon PostgreSQL (serverless-compatible) for Vercel deployment
- **Image Optimization**: Cloudinary handles resizing and optimization automatically
- **Search**: Can start with basic SQL LIKE queries, then migrate to Algolia when needed
- **Caching**: Implement ISR (Incremental Static Regeneration) for recipe pages
