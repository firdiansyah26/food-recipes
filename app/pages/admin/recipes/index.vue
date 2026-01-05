<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { query, mutate } = useGraphQL()
const toast = useToast()

// Queries
const RECIPES_QUERY = `
  query AdminRecipes($filter: RecipeFilterInput, $skip: Int, $take: Int) {
    recipes(filter: $filter, skip: $skip, take: $take) {
      id
      title
      slug
      image
      published
      difficulty
      createdAt
      author {
        name
      }
      category {
        name
      }
    }
    recipesCount(filter: $filter)
  }
`

const DELETE_RECIPE_MUTATION = `
  mutation DeleteRecipe($id: String!) {
    deleteRecipe(id: $id)
  }
`

// State
const currentPage = ref(1)
const itemsPerPage = 10
const searchQuery = ref('')
const publishedFilter = ref<boolean | undefined>(undefined)

const filter = computed(() => ({
  ...(searchQuery.value && { search: searchQuery.value }),
  ...(publishedFilter.value !== undefined && { published: publishedFilter.value }),
}))

// Fetch recipes
const { data, refresh } = await useAsyncData(
  'admin-recipes',
  () => query<{ recipes: any[], recipesCount: number }>(RECIPES_QUERY, {
    filter: filter.value,
    skip: (currentPage.value - 1) * itemsPerPage,
    take: itemsPerPage,
  }),
  { watch: [filter, currentPage] }
)

const recipes = computed(() => data.value?.recipes || [])
const totalCount = computed(() => data.value?.recipesCount || 0)

// Delete recipe
const deleteModal = ref(false)
const recipeToDelete = ref<any>(null)

function confirmDelete(recipe: any) {
  recipeToDelete.value = recipe
  deleteModal.value = true
}

async function deleteRecipe() {
  if (!recipeToDelete.value) return

  try {
    await mutate(DELETE_RECIPE_MUTATION, { id: recipeToDelete.value.id })
    toast.add({
      title: 'Recipe deleted',
      color: 'success',
    })
    deleteModal.value = false
    recipeToDelete.value = null
    await refresh()
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error',
    })
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const statusOptions = [
  { label: 'All Status', value: undefined },
  { label: 'Published', value: true },
  { label: 'Draft', value: false },
]
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Recipes</h1>
        <p class="mt-1 text-gray-600">Manage your recipes</p>
      </div>
      <UButton
        to="/admin/recipes/create"
        icon="i-lucide-plus"
        color="primary"
      >
        Add Recipe
      </UButton>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Search recipes..."
          icon="i-lucide-search"
          class="flex-1"
        />
        <USelectMenu
          v-model="publishedFilter"
          :items="statusOptions"
          value-key="value"
          class="w-40"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipe
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
            v-for="recipe in recipes"
            :key="recipe.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  v-if="recipe.image"
                  :src="recipe.image"
                  :alt="recipe.title"
                  class="w-12 h-12 rounded-lg object-cover"
                />
                <div
                  v-else
                  class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"
                >
                  <UIcon name="i-lucide-image" class="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ recipe.title }}</div>
                  <div class="text-sm text-gray-500">{{ recipe.difficulty.toLowerCase() }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ recipe.category?.name || '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ recipe.author.name }}
            </td>
            <td class="px-6 py-4">
              <UBadge
                :color="recipe.published ? 'success' : 'warning'"
                variant="subtle"
              >
                {{ recipe.published ? 'Published' : 'Draft' }}
              </UBadge>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ formatDate(recipe.createdAt) }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <UButton
                  :to="`/recipes/${recipe.slug}`"
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  target="_blank"
                />
                <UButton
                  :to="`/admin/recipes/${recipe.id}`"
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
                  @click="confirmDelete(recipe)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div
        v-if="recipes.length === 0"
        class="p-12 text-center"
      >
        <UIcon name="i-lucide-chef-hat" class="w-12 h-12 text-gray-300 mx-auto" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No recipes found</h3>
        <p class="mt-2 text-gray-500">Get started by creating a new recipe.</p>
        <UButton
          to="/admin/recipes/create"
          icon="i-lucide-plus"
          color="primary"
          class="mt-4"
        >
          Add Recipe
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
              <h3 class="text-lg font-semibold text-gray-900">Delete Recipe</h3>
              <p class="text-gray-600">
                Are you sure you want to delete "{{ recipeToDelete?.title }}"? This action cannot be undone.
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
              @click="deleteRecipe"
            >
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
