<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const { query } = useGraphQL()

// Queries
const ARTICLES_QUERY = `
  query Articles($filter: ArticleFilterInput, $skip: Int, $take: Int) {
    articles(filter: $filter, skip: $skip, take: $take) {
      id
      title
      slug
      excerpt
      image
      createdAt
      author {
        name
        avatar
      }
      category {
        name
        slug
      }
      commentsCount
    }
    articlesCount(filter: $filter)
  }
`

// State
const currentPage = ref(1)
const itemsPerPage = 9
const searchQuery = ref((route.query.search as string) || '')
const selectedCategory = ref((route.query.category as string) || '')

const filter = computed(() => ({
  ...(searchQuery.value && { search: searchQuery.value }),
  ...(selectedCategory.value && { categorySlug: selectedCategory.value }),
}))

// Fetch articles
const { data } = await useAsyncData(
  'articles-list',
  () => query<{ articles: any[], articlesCount: number }>(ARTICLES_QUERY, {
    filter: filter.value,
    skip: (currentPage.value - 1) * itemsPerPage,
    take: itemsPerPage,
  }),
  { watch: [filter, currentPage] }
)

const articles = computed(() => data.value?.articles || [])
const totalCount = computed(() => data.value?.articlesCount || 0)
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage))

// Update URL on filter change
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
  router.push({
    query: {
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedCategory.value && { category: selectedCategory.value }),
    },
  })
})

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 lg:px-8 py-12">
        <h1 class="text-4xl font-bold text-gray-900 font-serif">Blog & Articles</h1>
        <p class="mt-3 text-lg text-gray-600 max-w-2xl">
          Cooking tips, food culture, and culinary insights from our kitchen to yours.
        </p>

        <!-- Search -->
        <div class="mt-6 max-w-md">
          <UInput
            v-model="searchQuery"
            placeholder="Search articles..."
            icon="i-lucide-search"
            size="lg"
          />
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 lg:px-8 py-12">
      <!-- Articles Grid -->
      <div
        v-if="articles.length > 0"
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <NuxtLink
          v-for="article in articles"
          :key="article.id"
          :to="`/articles/${article.slug}`"
          class="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
        >
          <!-- Image -->
          <div class="aspect-video bg-gray-100 overflow-hidden">
            <img
              v-if="article.image"
              :src="article.image"
              :alt="article.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
              <UIcon name="i-lucide-file-text" class="w-12 h-12 text-gray-300" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <div class="flex items-center gap-2 mb-3">
              <UBadge
                v-if="article.category"
                color="primary"
                variant="subtle"
                size="sm"
              >
                {{ article.category.name }}
              </UBadge>
              <span class="text-sm text-gray-500">{{ formatDate(article.createdAt) }}</span>
            </div>

            <h2 class="text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-500 transition-colors">
              {{ article.title }}
            </h2>

            <p class="mt-2 text-gray-600 line-clamp-3">
              {{ article.excerpt }}
            </p>

            <!-- Footer -->
            <div class="mt-4 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UAvatar
                  :src="article.author.avatar || undefined"
                  :alt="article.author.name"
                  size="xs"
                />
                <span class="text-sm text-gray-600">{{ article.author.name }}</span>
              </div>

              <div class="flex items-center gap-1 text-sm text-gray-500">
                <UIcon name="i-lucide-message-circle" class="w-4 h-4" />
                <span>{{ article.commentsCount }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-16 bg-white rounded-xl border border-gray-100"
      >
        <UIcon name="i-lucide-file-text" class="w-16 h-16 text-gray-300 mx-auto" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No articles found</h3>
        <p class="mt-2 text-gray-500">Check back later for new content!</p>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="mt-12 flex justify-center"
      >
        <UPagination
          v-model="currentPage"
          :total="totalCount"
          :items-per-page="itemsPerPage"
        />
      </div>
    </div>
  </div>
</template>
