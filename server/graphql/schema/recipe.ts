import { builder } from '../builder'

// Difficulty enum
builder.enumType('Difficulty', {
  values: ['EASY', 'MEDIUM', 'HARD'] as const,
})

// Ingredient type
builder.prismaObject('Ingredient', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    amount: t.exposeString('amount'),
    unit: t.exposeString('unit', { nullable: true }),
    order: t.exposeInt('order'),
  }),
})

// Step type
builder.prismaObject('Step', {
  fields: (t) => ({
    id: t.exposeID('id'),
    order: t.exposeInt('order'),
    instruction: t.exposeString('instruction'),
    image: t.exposeString('image', { nullable: true }),
  }),
})

// Recipe type
builder.prismaObject('Recipe', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    slug: t.exposeString('slug'),
    description: t.exposeString('description'),
    image: t.exposeString('image', { nullable: true }),
    prepTime: t.exposeInt('prepTime'),
    cookTime: t.exposeInt('cookTime'),
    servings: t.exposeInt('servings'),
    difficulty: t.exposeString('difficulty'),
    published: t.exposeBoolean('published'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    author: t.relation('author'),
    category: t.relation('category'),
    ingredients: t.relation('ingredients', {
      query: { orderBy: { order: 'asc' } },
    }),
    steps: t.relation('steps', {
      query: { orderBy: { order: 'asc' } },
    }),
    tags: t.relation('tags'),
    comments: t.relation('comments', {
      query: { orderBy: { createdAt: 'desc' } },
    }),
    ratings: t.relation('ratings'),
    favorites: t.relation('favorites'),
    // Computed fields
    totalTime: t.int({
      resolve: (recipe) => recipe.prepTime + recipe.cookTime,
    }),
    averageRating: t.float({
      nullable: true,
      resolve: async (recipe, _args, ctx) => {
        const result = await ctx.prisma.rating.aggregate({
          where: { recipeId: recipe.id },
          _avg: { value: true },
        })
        return result._avg.value
      },
    }),
    ratingsCount: t.int({
      resolve: async (recipe, _args, ctx) => {
        return ctx.prisma.rating.count({ where: { recipeId: recipe.id } })
      },
    }),
    commentsCount: t.int({
      resolve: async (recipe, _args, ctx) => {
        return ctx.prisma.comment.count({ where: { recipeId: recipe.id } })
      },
    }),
    isFavorited: t.boolean({
      resolve: async (recipe, _args, ctx) => {
        if (!ctx.user) return false
        const favorite = await ctx.prisma.favorite.findUnique({
          where: {
            userId_recipeId: {
              userId: ctx.user.id,
              recipeId: recipe.id,
            },
          },
        })
        return !!favorite
      },
    }),
  }),
})

// Input types
const IngredientInput = builder.inputType('IngredientInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    amount: t.string({ required: true }),
    unit: t.string(),
  }),
})

const StepInput = builder.inputType('StepInput', {
  fields: (t) => ({
    instruction: t.string({ required: true }),
    image: t.string(),
  }),
})

const CreateRecipeInput = builder.inputType('CreateRecipeInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    description: t.string({ required: true }),
    image: t.string(),
    prepTime: t.int({ required: true }),
    cookTime: t.int({ required: true }),
    servings: t.int({ required: true }),
    difficulty: t.string({ required: true }),
    categoryId: t.string({ required: true }),
    ingredients: t.field({ type: [IngredientInput], required: true }),
    steps: t.field({ type: [StepInput], required: true }),
    tagIds: t.stringList(),
    published: t.boolean({ defaultValue: false }),
  }),
})

const UpdateRecipeInput = builder.inputType('UpdateRecipeInput', {
  fields: (t) => ({
    title: t.string(),
    description: t.string(),
    image: t.string(),
    prepTime: t.int(),
    cookTime: t.int(),
    servings: t.int(),
    difficulty: t.string(),
    categoryId: t.string(),
    ingredients: t.field({ type: [IngredientInput] }),
    steps: t.field({ type: [StepInput] }),
    tagIds: t.stringList(),
    published: t.boolean(),
  }),
})

const RecipeFilterInput = builder.inputType('RecipeFilterInput', {
  fields: (t) => ({
    categorySlug: t.string(),
    difficulty: t.string(),
    tagSlugs: t.stringList(),
    search: t.string(),
    authorId: t.string(),
    published: t.boolean(),
  }),
})

// Queries
builder.queryFields((t) => ({
  // Get single recipe by slug
  recipe: t.prismaField({
    type: 'Recipe',
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const recipe = await ctx.prisma.recipe.findUnique({
        ...query,
        where: { slug: args.slug },
      })

      // Only return published recipes for non-admin users
      if (recipe && !recipe.published) {
        if (!ctx.user || (ctx.user.role !== 'ADMIN' && ctx.user.id !== recipe.authorId)) {
          return null
        }
      }

      return recipe
    },
  }),

  // Get recipe by ID
  recipeById: t.prismaField({
    type: 'Recipe',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      return ctx.prisma.recipe.findUnique({
        ...query,
        where: { id: args.id },
      })
    },
  }),

  // List recipes with filters
  recipes: t.prismaField({
    type: ['Recipe'],
    args: {
      filter: t.arg({ type: RecipeFilterInput }),
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 12 }),
    },
    resolve: async (query, _root, args, ctx) => {
      const where: any = {}

      // Default to published only for non-admin
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        where.published = true
      }
      else if (args.filter?.published !== undefined) {
        where.published = args.filter.published
      }

      if (args.filter?.categorySlug) {
        where.category = { slug: args.filter.categorySlug }
      }

      if (args.filter?.difficulty) {
        where.difficulty = args.filter.difficulty
      }

      if (args.filter?.authorId) {
        where.authorId = args.filter.authorId
      }

      if (args.filter?.tagSlugs && args.filter.tagSlugs.length > 0) {
        where.tags = {
          some: {
            tag: { slug: { in: args.filter.tagSlugs } },
          },
        }
      }

      if (args.filter?.search) {
        where.OR = [
          { title: { contains: args.filter.search, mode: 'insensitive' } },
          { description: { contains: args.filter.search, mode: 'insensitive' } },
        ]
      }

      return ctx.prisma.recipe.findMany({
        ...query,
        where,
        skip: args.skip ?? 0,
        take: args.take ?? 12,
        orderBy: { createdAt: 'desc' },
      })
    },
  }),

  // Count recipes with filters
  recipesCount: t.int({
    args: {
      filter: t.arg({ type: RecipeFilterInput }),
    },
    resolve: async (_root, args, ctx) => {
      const where: any = {}

      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        where.published = true
      }

      if (args.filter?.categorySlug) {
        where.category = { slug: args.filter.categorySlug }
      }

      if (args.filter?.difficulty) {
        where.difficulty = args.filter.difficulty
      }

      return ctx.prisma.recipe.count({ where })
    },
  }),

  // Featured recipes (for homepage)
  featuredRecipes: t.prismaField({
    type: ['Recipe'],
    args: {
      take: t.arg.int({ defaultValue: 6 }),
    },
    resolve: async (query, _root, args, ctx) => {
      return ctx.prisma.recipe.findMany({
        ...query,
        where: { published: true },
        take: args.take ?? 6,
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
}))

// Mutations
builder.mutationFields((t) => ({
  // Create a new recipe
  createRecipe: t.prismaField({
    type: 'Recipe',
    args: {
      input: t.arg({ type: CreateRecipeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      const { generateSlug } = await import('../../utils/auth')
      let slug = generateSlug(args.input.title)

      // Check if slug exists and make it unique
      const existingRecipe = await ctx.prisma.recipe.findUnique({
        where: { slug },
      })

      if (existingRecipe) {
        slug = `${slug}-${Date.now()}`
      }

      return ctx.prisma.recipe.create({
        ...query,
        data: {
          title: args.input.title,
          slug,
          description: args.input.description,
          image: args.input.image,
          prepTime: args.input.prepTime,
          cookTime: args.input.cookTime,
          servings: args.input.servings,
          difficulty: args.input.difficulty as any,
          published: args.input.published ?? false,
          authorId: ctx.user.id,
          categoryId: args.input.categoryId,
          ingredients: {
            create: args.input.ingredients.map((ing, index) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              order: index,
            })),
          },
          steps: {
            create: args.input.steps.map((step, index) => ({
              instruction: step.instruction,
              image: step.image,
              order: index + 1,
            })),
          },
          ...(args.input.tagIds && {
            tags: {
              create: args.input.tagIds.map(tagId => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
        },
      })
    },
  }),

  // Update a recipe
  updateRecipe: t.prismaField({
    type: 'Recipe',
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateRecipeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      // Check ownership or admin
      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: args.id },
      })

      if (!recipe) {
        throw new Error('Recipe not found')
      }

      if (recipe.authorId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      // Delete existing ingredients and steps if provided
      if (args.input.ingredients) {
        await ctx.prisma.ingredient.deleteMany({
          where: { recipeId: args.id },
        })
      }

      if (args.input.steps) {
        await ctx.prisma.step.deleteMany({
          where: { recipeId: args.id },
        })
      }

      // Update tags if provided
      if (args.input.tagIds) {
        await ctx.prisma.tagsOnRecipes.deleteMany({
          where: { recipeId: args.id },
        })
      }

      return ctx.prisma.recipe.update({
        ...query,
        where: { id: args.id },
        data: {
          ...(args.input.title && { title: args.input.title }),
          ...(args.input.description && { description: args.input.description }),
          ...(args.input.image !== undefined && { image: args.input.image }),
          ...(args.input.prepTime && { prepTime: args.input.prepTime }),
          ...(args.input.cookTime && { cookTime: args.input.cookTime }),
          ...(args.input.servings && { servings: args.input.servings }),
          ...(args.input.difficulty && { difficulty: args.input.difficulty as any }),
          ...(args.input.categoryId && { categoryId: args.input.categoryId }),
          ...(args.input.published !== undefined && { published: args.input.published }),
          ...(args.input.ingredients && {
            ingredients: {
              create: args.input.ingredients.map((ing, index) => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                order: index,
              })),
            },
          }),
          ...(args.input.steps && {
            steps: {
              create: args.input.steps.map((step, index) => ({
                instruction: step.instruction,
                image: step.image,
                order: index + 1,
              })),
            },
          }),
          ...(args.input.tagIds && {
            tags: {
              create: args.input.tagIds.map(tagId => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
        },
      })
    },
  }),

  // Delete a recipe
  deleteRecipe: t.boolean({
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      const recipe = await ctx.prisma.recipe.findUnique({
        where: { id: args.id },
      })

      if (!recipe) {
        throw new Error('Recipe not found')
      }

      if (recipe.authorId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      await ctx.prisma.recipe.delete({ where: { id: args.id } })
      return true
    },
  }),

  // Toggle favorite
  toggleFavorite: t.boolean({
    args: {
      recipeId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      const existing = await ctx.prisma.favorite.findUnique({
        where: {
          userId_recipeId: {
            userId: ctx.user.id,
            recipeId: args.recipeId,
          },
        },
      })

      if (existing) {
        await ctx.prisma.favorite.delete({
          where: {
            userId_recipeId: {
              userId: ctx.user.id,
              recipeId: args.recipeId,
            },
          },
        })
        return false // Not favorited anymore
      }
      else {
        await ctx.prisma.favorite.create({
          data: {
            userId: ctx.user.id,
            recipeId: args.recipeId,
          },
        })
        return true // Now favorited
      }
    },
  }),

  // Rate a recipe
  rateRecipe: t.prismaField({
    type: 'Rating',
    args: {
      recipeId: t.arg.string({ required: true }),
      value: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      if (args.value < 1 || args.value > 5) {
        throw new Error('Rating must be between 1 and 5')
      }

      return ctx.prisma.rating.upsert({
        ...query,
        where: {
          userId_recipeId: {
            userId: ctx.user.id,
            recipeId: args.recipeId,
          },
        },
        create: {
          value: args.value,
          userId: ctx.user.id,
          recipeId: args.recipeId,
        },
        update: {
          value: args.value,
        },
      })
    },
  }),
}))

// Rating type
builder.prismaObject('Rating', {
  fields: (t) => ({
    id: t.exposeID('id'),
    value: t.exposeInt('value'),
    user: t.relation('user'),
    recipe: t.relation('recipe'),
  }),
})

// Favorite type
builder.prismaObject('Favorite', {
  fields: (t) => ({
    userId: t.exposeString('userId'),
    recipeId: t.exposeString('recipeId'),
    user: t.relation('user'),
    recipe: t.relation('recipe'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
})
