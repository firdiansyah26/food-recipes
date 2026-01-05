import { builder } from '../builder'

// Article type
builder.prismaObject('Article', {
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    slug: t.exposeString('slug'),
    excerpt: t.exposeString('excerpt'),
    content: t.exposeString('content'),
    image: t.exposeString('image', { nullable: true }),
    published: t.exposeBoolean('published'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    author: t.relation('author'),
    category: t.relation('category', { nullable: true }),
    comments: t.relation('comments', {
      query: { orderBy: { createdAt: 'desc' } },
    }),
    commentsCount: t.int({
      resolve: async (article, _args, ctx) => {
        return ctx.prisma.comment.count({ where: { articleId: article.id } })
      },
    }),
  }),
})

// Comment type
builder.prismaObject('Comment', {
  fields: (t) => ({
    id: t.exposeID('id'),
    content: t.exposeString('content'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    user: t.relation('user'),
    recipe: t.relation('recipe', { nullable: true }),
    article: t.relation('article', { nullable: true }),
  }),
})

// Input types
const CreateArticleInput = builder.inputType('CreateArticleInput', {
  fields: (t) => ({
    title: t.string({ required: true }),
    excerpt: t.string({ required: true }),
    content: t.string({ required: true }),
    image: t.string(),
    categoryId: t.string(),
    published: t.boolean({ defaultValue: false }),
  }),
})

const UpdateArticleInput = builder.inputType('UpdateArticleInput', {
  fields: (t) => ({
    title: t.string(),
    excerpt: t.string(),
    content: t.string(),
    image: t.string(),
    categoryId: t.string(),
    published: t.boolean(),
  }),
})

const ArticleFilterInput = builder.inputType('ArticleFilterInput', {
  fields: (t) => ({
    categorySlug: t.string(),
    search: t.string(),
    authorId: t.string(),
    published: t.boolean(),
  }),
})

// Queries
builder.queryFields((t) => ({
  // Get article by slug
  article: t.prismaField({
    type: 'Article',
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const article = await ctx.prisma.article.findUnique({
        ...query,
        where: { slug: args.slug },
      })

      if (article && !article.published) {
        if (!ctx.user || (ctx.user.role !== 'ADMIN' && ctx.user.id !== article.authorId)) {
          return null
        }
      }

      return article
    },
  }),

  // Get article by ID
  articleById: t.prismaField({
    type: 'Article',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      return ctx.prisma.article.findUnique({
        ...query,
        where: { id: args.id },
      })
    },
  }),

  // List articles with filters
  articles: t.prismaField({
    type: ['Article'],
    args: {
      filter: t.arg({ type: ArticleFilterInput }),
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 10 }),
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

      if (args.filter?.authorId) {
        where.authorId = args.filter.authorId
      }

      if (args.filter?.search) {
        where.OR = [
          { title: { contains: args.filter.search, mode: 'insensitive' } },
          { excerpt: { contains: args.filter.search, mode: 'insensitive' } },
          { content: { contains: args.filter.search, mode: 'insensitive' } },
        ]
      }

      return ctx.prisma.article.findMany({
        ...query,
        where,
        skip: args.skip ?? 0,
        take: args.take ?? 10,
        orderBy: { createdAt: 'desc' },
      })
    },
  }),

  // Count articles
  articlesCount: t.int({
    args: {
      filter: t.arg({ type: ArticleFilterInput }),
    },
    resolve: async (_root, args, ctx) => {
      const where: any = {}

      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        where.published = true
      }

      if (args.filter?.categorySlug) {
        where.category = { slug: args.filter.categorySlug }
      }

      return ctx.prisma.article.count({ where })
    },
  }),

  // Featured articles
  featuredArticles: t.prismaField({
    type: ['Article'],
    args: {
      take: t.arg.int({ defaultValue: 4 }),
    },
    resolve: async (query, _root, args, ctx) => {
      return ctx.prisma.article.findMany({
        ...query,
        where: { published: true },
        take: args.take ?? 4,
        orderBy: { createdAt: 'desc' },
      })
    },
  }),
}))

// Mutations
builder.mutationFields((t) => ({
  // Create article
  createArticle: t.prismaField({
    type: 'Article',
    args: {
      input: t.arg({ type: CreateArticleInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      const { generateSlug } = await import('../../utils/auth')
      let slug = generateSlug(args.input.title)

      const existingArticle = await ctx.prisma.article.findUnique({
        where: { slug },
      })

      if (existingArticle) {
        slug = `${slug}-${Date.now()}`
      }

      return ctx.prisma.article.create({
        ...query,
        data: {
          title: args.input.title,
          slug,
          excerpt: args.input.excerpt,
          content: args.input.content,
          image: args.input.image,
          categoryId: args.input.categoryId,
          published: args.input.published ?? false,
          authorId: ctx.user.id,
        },
      })
    },
  }),

  // Update article
  updateArticle: t.prismaField({
    type: 'Article',
    args: {
      id: t.arg.string({ required: true }),
      input: t.arg({ type: UpdateArticleInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      return ctx.prisma.article.update({
        ...query,
        where: { id: args.id },
        data: {
          ...(args.input.title && { title: args.input.title }),
          ...(args.input.excerpt && { excerpt: args.input.excerpt }),
          ...(args.input.content && { content: args.input.content }),
          ...(args.input.image !== undefined && { image: args.input.image }),
          ...(args.input.categoryId !== undefined && { categoryId: args.input.categoryId }),
          ...(args.input.published !== undefined && { published: args.input.published }),
        },
      })
    },
  }),

  // Delete article
  deleteArticle: t.boolean({
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      await ctx.prisma.article.delete({ where: { id: args.id } })
      return true
    },
  }),

  // Create comment
  createComment: t.prismaField({
    type: 'Comment',
    args: {
      content: t.arg.string({ required: true }),
      recipeId: t.arg.string(),
      articleId: t.arg.string(),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      if (!args.recipeId && !args.articleId) {
        throw new Error('Either recipeId or articleId is required')
      }

      return ctx.prisma.comment.create({
        ...query,
        data: {
          content: args.content,
          userId: ctx.user.id,
          recipeId: args.recipeId,
          articleId: args.articleId,
        },
      })
    },
  }),

  // Delete comment
  deleteComment: t.boolean({
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Unauthorized')
      }

      const comment = await ctx.prisma.comment.findUnique({
        where: { id: args.id },
      })

      if (!comment) {
        throw new Error('Comment not found')
      }

      if (comment.userId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new Error('Unauthorized')
      }

      await ctx.prisma.comment.delete({ where: { id: args.id } })
      return true
    },
  }),
}))
