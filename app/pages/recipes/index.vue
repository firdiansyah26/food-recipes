<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const router = useRouter()
const { query } = useGraphQL()

// Queries
const RECIPES_QUERY = `
  query Recipes($filter: RecipeFilterInput, $skip: Int, $take: Int) {
    recipes(filter: $filter, skip: $skip, take: $take) {
      id
      title
      slug
      description
      image
      prepTime
      cookTime
      totalTime
      difficulty
      averageRating
      ratingsCount
      category {
        name
        slug
      }
      author {
        name
        avatar
      }
    }
    recipesCount(filter: $filter)
  }
`

const CATEGORIES_QUERY = `
  query Categories {
    categories {
      id
      name
      slug
      recipesCount
    }
  }
`

// State
const currentPage = ref(1)
const itemsPerPage = 12
const searchQuery = ref((route.query.search as string) || '')
const selectedCategory = ref((route.query.category as string) || '')
const selectedDifficulty = ref((route.query.difficulty as string) || '')

// Build filter
const filter = computed(() => ({
  ...(searchQuery.value && { search: searchQuery.value }),
  ...(selectedCategory.value && { categorySlug: selectedCategory.value }),
  ...(selectedDifficulty.value && { difficulty: selectedDifficulty.value }),
}))

// Fetch categories
const { data: categoriesData } = await useAsyncData('recipe-categories', () =>
  query<{ categories: any[] }>(CATEGORIES_QUERY)
)

// Fetch recipes
const { data: recipesData, refresh } = await useAsyncData(
  'recipes-list',
  () => query<{ recipes: any[], recipesCount: number }>(RECIPES_QUERY, {
    filter: filter.value,
    skip: (currentPage.value - 1) * itemsPerPage,
    take: itemsPerPage,
  }),
  { watch: [filter, currentPage] }
)

const recipes = computed(() => recipesData.value?.recipes || [])
const totalCount = computed(() => recipesData.value?.recipesCount || 0)
const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage))
const categories = computed(() => categoriesData.value?.categories || [])

// Difficulty options
const difficultyOptions = [
  { label: 'All Difficulties', value: '' },
  { label: 'Easy', value: 'EASY' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Hard', value: 'HARD' },
]

// Update URL on filter change
watch([searchQuery, selectedCategory, selectedDifficulty], () => {
  currentPage.value = 1
  router.push({
    query: {
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(selectedCategory.value && { category: selectedCategory.value }),
      ...(selectedDifficulty.value && { difficulty: selectedDifficulty.value }),
    },
  })
})

// Clear filters
function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedDifficulty.value = ''
}

// Check if filters are active
const hasActiveFilters = computed(() =>
  searchQuery.value || selectedCategory.value || selectedDifficulty.value
)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 font-serif">Recipes</h1>
        <p class="mt-2 text-gray-600">
          Discover {{ totalCount }} delicious recipes
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="lg:w-64 flex-shrink-0">
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-gray-900">Filters</h2>
              <UButton
                v-if="hasActiveFilters"
                variant="ghost"
                color="neutral"
                size="xs"
                @click="clearFilters"
              >
                Clear all
              </UButton>
            </div>

            <!-- Search -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <UInput
                v-model="searchQuery"
                placeholder="Search recipes..."
                icon="i-lucide-search"
              />
            </div>

            <!-- Categories -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <USelectMenu
                v-model="selectedCategory"
                :items="[{ label: 'All Categories', value: '' }, ...categories.map(c => ({ label: `${c.name} (${c.recipesCount})`, value: c.slug }))]"
                value-key="value"
                placeholder="Select category"
              />
            </div>

            <!-- Difficulty -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <USelectMenu
                v-model="selectedDifficulty"
                :items="difficultyOptions"
                value-key="value"
                placeholder="Select difficulty"
              />
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1">
          <!-- Results Header -->
          <div class="flex items-center justify-between mb-6">
            <p class="text-gray-600">
              Showing {{ recipes.length }} of {{ totalCount }} recipes
            </p>
          </div>

          <!-- Recipes Grid -->
          <div
            v-if="recipes.length > 0"
            class="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <RecipeRecipeCard
              v-for="recipe in recipes"
              :key="recipe.id"
              :recipe="recipe"
            />
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="text-center py-16 bg-white rounded-xl border border-gray-100"
          >
            <UIcon name="i-lucide-search-x" class="w-16 h-16 text-gray-300 mx-auto" />
            <h3 class="mt-4 text-lg font-medium text-gray-900">No recipes found</h3>
            <p class="mt-2 text-gray-500">
              Try adjusting your filters or search terms
            </p>
            <UButton
              v-if="hasActiveFilters"
              class="mt-4"
              color="primary"
              @click="clearFilters"
            >
              Clear Filters
            </UButton>
          </div>

          <!-- Pagination -->
          <div
            v-if="totalPages > 1"
            class="mt-8 flex justify-center"
          >
            <UPagination
              v-model="currentPage"
              :total="totalCount"
              :items-per-page="itemsPerPage"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
