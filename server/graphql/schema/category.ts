import { builder } from '../builder'

// Category type
builder.prismaObject('Category', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    image: t.exposeString('image', { nullable: true }),
    recipes: t.relation('recipes', {
      query: { where: { published: true }, orderBy: { createdAt: 'desc' } },
    }),
    articles: t.relation('articles', {
      query: { where: { published: true }, orderBy: { createdAt: 'desc' } },
    }),
    recipesCount: t.int({
      resolve: async (category, _args, ctx) => {
        return ctx.prisma.recipe.count({
          where: { categoryId: category.id, published: true },
        })
      },
    }),
  }),
})

// Tag type
builder.prismaObject('Tag', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    recipes: t.relation('recipes'),
    recipesCount: t.int({
      resolve: async (tag, _args, ctx) => {
        return ctx.prisma.tagsOnRecipes.count({
          where: { tagId: tag.id },
        })
      },
    }),
  }),
})

// TagsOnRecipes type
builder.prismaObject('TagsOnRecipes', {
  fields: (t) => ({
    recipe: t.relation('recipe'),
    tag: t.relation('tag'),
  }),
})

// Input types
const CreateCategoryInput = builder.inputType('CreateCategoryInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    image: t.string(),
  }),
})

const CreateTagInput = builder.inputType('CreateTagInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
  }),
})

// Queries
builder.queryFields((t) => ({
  // Get all categories
  categories: t.prismaField({
    type: ['Category'],
    resolve: async (query, _root, _args, ctx) => {
      return ctx.prisma.category.findMany({
        ...query,
        orderBy: { name: 'asc' },
      })
    },
  }),

  // Get category by slug
  category: t.prismaField({
    type: 'Category',
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      return ctx.prisma.category.findUnique({
        ...query,
        where: { slug: args.slug },
      })
    },
  }),

  // Get all tags
  tags: t.prismaField({
    type: ['Tag'],
    resolve: async (query, _root, _args, ctx) => {
      return ctx.prisma.tag.findMany({
        ...query,
        orderBy: { name: 'asc' },
      })
    },
  }),

  // Get tag by slug
  tag: t.prismaField({
    type: 'Tag',
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      return ctx.prisma.tag.findUnique({
        ...query,
        where: { slug: args.slug },
      })
    },
  }),
}))

// Mutations (admin only)
builder.mutationFields((t) => ({
  // Create category
  createCategory: t.prismaField({
    type: 'Category',
    args: {
      input: t.arg({ type: CreateCategoryInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      const { generateSlug } = await import('../../utils/auth')
      const slug = generateSlug(args.input.name)

      return ctx.prisma.category.create({
        ...query,
        data: {
          name: args.input.name,
          slug,
          image: args.input.image,
        },
      })
    },
  }),

  // Update category
  updateCategory: t.prismaField({
    type: 'Category',
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string(),
      image: t.arg.string(),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      const { generateSlug } = await import('../../utils/auth')

      return ctx.prisma.category.update({
        ...query,
        where: { id: args.id },
        data: {
          ...(args.name && { name: args.name, slug: generateSlug(args.name) }),
          ...(args.image !== undefined && { image: args.image }),
        },
      })
    },
  }),

  // Delete category
  deleteCategory: t.boolean({
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      await ctx.prisma.category.delete({ where: { id: args.id } })
      return true
    },
  }),

  // Create tag
  createTag: t.prismaField({
    type: 'Tag',
    args: {
      input: t.arg({ type: CreateTagInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      const { generateSlug } = await import('../../utils/auth')
      const slug = generateSlug(args.input.name)

      return ctx.prisma.tag.create({
        ...query,
        data: {
          name: args.input.name,
          slug,
        },
      })
    },
  }),

  // Delete tag
  deleteTag: t.boolean({
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      await ctx.prisma.tag.delete({ where: { id: args.id } })
      return true
    },
  }),
}))
