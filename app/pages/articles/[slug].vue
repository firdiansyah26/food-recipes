<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const { query, mutate } = useGraphQL()
const { isAuthenticated } = useAuth()
const toast = useToast()

const slug = route.params.slug as string

// Queries
const ARTICLE_QUERY = `
  query Article($slug: String!) {
    article(slug: $slug) {
      id
      title
      slug
      excerpt
      content
      image
      createdAt
      updatedAt
      commentsCount
      author {
        id
        name
        avatar
      }
      category {
        name
        slug
      }
      comments {
        id
        content
        createdAt
        user {
          id
          name
          avatar
        }
      }
    }
  }
`

const CREATE_COMMENT_MUTATION = `
  mutation CreateComment($content: String!, $articleId: String) {
    createComment(content: $content, articleId: $articleId) {
      id
      content
      createdAt
      user {
        id
        name
        avatar
      }
    }
  }
`

// Fetch article
const { data, refresh } = await useAsyncData(`article-${slug}`, () =>
  query<{ article: any }>(ARTICLE_QUERY, { slug })
)

const article = computed(() => data.value?.article)

// 404 if not found
if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found',
  })
}

// SEO
useSeoMeta({
  title: article.value?.title,
  description: article.value?.excerpt,
  ogTitle: article.value?.title,
  ogDescription: article.value?.excerpt,
  ogImage: article.value?.image,
})

// Comments
const newComment = ref('')
const isSubmittingComment = ref(false)

async function submitComment() {
  if (!isAuthenticated.value) {
    navigateTo('/auth/login?redirect=' + route.fullPath)
    return
  }

  if (!newComment.value.trim()) return

  isSubmittingComment.value = true
  try {
    await mutate(CREATE_COMMENT_MUTATION, {
      content: newComment.value,
      articleId: article.value.id,
    })
    newComment.value = ''
    await refresh()
    toast.add({
      title: 'Comment posted',
      color: 'success',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error',
    })
  } finally {
    isSubmittingComment.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div v-if="article" class="min-h-screen bg-gray-50">
    <!-- Hero -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 lg:px-8 py-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <NuxtLink to="/" class="hover:text-primary-500">Home</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <NuxtLink to="/articles" class="hover:text-primary-500">Articles</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <span class="text-gray-900 truncate">{{ article.title }}</span>
        </nav>

        <!-- Header -->
        <div class="max-w-3xl">
          <div class="flex items-center gap-2 mb-4">
            <UBadge
              v-if="article.category"
              color="primary"
              size="sm"
            >
              {{ article.category.name }}
            </UBadge>
            <span class="text-sm text-gray-500">{{ formatDate(article.createdAt) }}</span>
          </div>

          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 font-serif">
            {{ article.title }}
          </h1>

          <p class="mt-4 text-xl text-gray-600">
            {{ article.excerpt }}
          </p>

          <!-- Author -->
          <div class="mt-6 flex items-center gap-3">
            <UAvatar
              :src="article.author.avatar || undefined"
              :alt="article.author.name"
              size="md"
            />
            <div>
              <div class="font-medium text-gray-900">{{ article.author.name }}</div>
              <div class="text-sm text-gray-500">Author</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 lg:px-8 py-12">
      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Main Content -->
        <main class="flex-1 max-w-3xl">
          <!-- Featured Image -->
          <div
            v-if="article.image"
            class="mb-8 rounded-xl overflow-hidden"
          >
            <img
              :src="article.image"
              :alt="article.title"
              class="w-full"
            />
          </div>

          <!-- Article Content -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div
              class="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-primary-500"
              v-html="article.content"
            />
          </div>

          <!-- Share -->
          <div class="mt-8 flex items-center gap-4">
            <span class="text-sm font-medium text-gray-500">Share:</span>
            <UButton
              icon="i-simple-icons-twitter"
              color="neutral"
              variant="ghost"
              size="sm"
            />
            <UButton
              icon="i-simple-icons-facebook"
              color="neutral"
              variant="ghost"
              size="sm"
            />
            <UButton
              icon="i-simple-icons-linkedin"
              color="neutral"
              variant="ghost"
              size="sm"
            />
            <UButton
              icon="i-lucide-link"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </div>

          <!-- Comments -->
          <div class="mt-12 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Comments ({{ article.commentsCount }})
            </h2>

            <!-- New Comment -->
            <div class="mb-8">
              <UTextarea
                v-model="newComment"
                placeholder="Share your thoughts..."
                :rows="3"
              />
              <div class="mt-2 flex justify-end">
                <UButton
                  color="primary"
                  :loading="isSubmittingComment"
                  :disabled="!newComment.trim()"
                  @click="submitComment"
                >
                  Post Comment
                </UButton>
              </div>
            </div>

            <!-- Comments List -->
            <div class="space-y-4">
              <div
                v-for="comment in article.comments"
                :key="comment.id"
                class="flex gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <UAvatar
                  :src="comment.user.avatar || undefined"
                  :alt="comment.user.name"
                  size="sm"
                />
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900">{{ comment.user.name }}</span>
                    <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                  </div>
                  <p class="mt-1 text-gray-600">{{ comment.content }}</p>
                </div>
              </div>

              <p
                v-if="article.comments?.length === 0"
                class="text-center text-gray-500 py-8"
              >
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          </div>
        </main>

        <!-- Sidebar -->
        <aside class="lg:w-80 flex-shrink-0">
          <div class="sticky top-24 space-y-6">
            <!-- Table of Contents (placeholder) -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 class="font-semibold text-gray-900 mb-4">In This Article</h3>
              <nav class="space-y-2 text-sm">
                <p class="text-gray-500">Table of contents will be generated from headings.</p>
              </nav>
            </div>

            <!-- Related Articles (placeholder) -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 class="font-semibold text-gray-900 mb-4">Related Articles</h3>
              <p class="text-sm text-gray-500">More articles coming soon!</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
