<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { query, mutate } = useGraphQL()
const toast = useToast()

// Queries
const ARTICLES_QUERY = `
  query AdminArticles($filter: ArticleFilterInput, $skip: Int, $take: Int) {
    articles(filter: $filter, skip: $skip, take: $take) {
      id
      title
      slug
      image
      published
      createdAt
      author {
        name
      }
      category {
        name
      }
    }
    articlesCount(filter: $filter)
  }
`

const DELETE_ARTICLE_MUTATION = `
  mutation DeleteArticle($id: String!) {
    deleteArticle(id: $id)
  }
`

// State
const currentPage = ref(1)
const itemsPerPage = 10
const searchQuery = ref('')

const filter = computed(() => ({
  ...(searchQuery.value && { search: searchQuery.value }),
}))

// Fetch articles
const { data, refresh } = await useAsyncData(
  'admin-articles',
  () => query<{ articles: any[], articlesCount: number }>(ARTICLES_QUERY, {
    filter: filter.value,
    skip: (currentPage.value - 1) * itemsPerPage,
    take: itemsPerPage,
  }),
  { watch: [filter, currentPage] }
)

const articles = computed(() => data.value?.articles || [])
const totalCount = computed(() => data.value?.articlesCount || 0)

// Delete
const deleteModal = ref(false)
const articleToDelete = ref<any>(null)

function confirmDelete(article: any) {
  articleToDelete.value = article
  deleteModal.value = true
}

async function deleteArticle() {
  if (!articleToDelete.value) return

  try {
    await mutate(DELETE_ARTICLE_MUTATION, { id: articleToDelete.value.id })
    toast.add({ title: 'Article deleted', color: 'success' })
    deleteModal.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Articles</h1>
        <p class="mt-1 text-gray-600">Manage blog articles</p>
      </div>
      <UButton
        to="/admin/articles/create"
        icon="i-lucide-plus"
        color="primary"
      >
        Add Article
      </UButton>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search articles..."
        icon="i-lucide-search"
        class="max-w-md"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Article
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Author
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="article in articles"
            :key="article.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="article.image"
                  :src="article.image"
                  :alt="article.title"
                  class="w-12 h-12 rounded-lg object-cover"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  <UIcon name="i-lucide-file-text" class="w-6 h-6 text-gray-400" />
                </div>
                <div class="font-medium text-gray-900">{{ article.title }}</div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ article.category?.name || '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ article.author.name }}
            </td>
            <td class="px-6 py-4">
              <UBadge
                :color="article.published ? 'success' : 'warning'"
                variant="subtle"
              >
                {{ article.published ? 'Published' : 'Draft' }}
              </UBadge>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ formatDate(article.createdAt) }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <UButton
                  :to="`/articles/${article.slug}`"
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  target="_blank"
                />
                <UButton
                  :to="`/admin/articles/${article.id}`"
                  icon="i-lucide-edit"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                />
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="sm"
                  @click="confirmDelete(article)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div
        v-if="articles.length === 0"
        class="p-12 text-center"
      >
        <UIcon name="i-lucide-file-text" class="w-12 h-12 text-gray-300 mx-auto" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No articles found</h3>
        <p class="mt-2 text-gray-500">Get started by creating a new article.</p>
        <UButton
          to="/admin/articles/create"
          icon="i-lucide-plus"
          color="primary"
          class="mt-4"
        >
          Add Article
        </UButton>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalCount > itemsPerPage"
        class="px-6 py-4 border-t border-gray-100"
      >
        <UPagination
          v-model="currentPage"
          :total="totalCount"
          :items-per-page="itemsPerPage"
        />
      </div>
    </div>

    <!-- Delete Modal -->
    <UModal v-model:open="deleteModal">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <UIcon name="i-lucide-trash-2" class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Delete Article</h3>
              <p class="text-gray-600">
                Are you sure you want to delete "{{ articleToDelete?.title }}"?
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              @click="deleteModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              @click="deleteArticle"
            >
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
