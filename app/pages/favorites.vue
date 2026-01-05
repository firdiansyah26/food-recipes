<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const { query } = useGraphQL()
const { isAuthenticated, user } = useAuth()

// Redirect if not authenticated
if (!isAuthenticated.value) {
  navigateTo('/auth/login?redirect=/favorites')
}

// Query
const FAVORITES_QUERY = `
  query MyFavorites {
    me {
      favorites {
        createdAt
        recipe {
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
      }
    }
  }
`

const { data, refresh } = await useAsyncData('my-favorites', () =>
  query<{ me: { favorites: any[] } }>(FAVORITES_QUERY)
)

const favorites = computed(() => data.value?.me?.favorites || [])

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 font-serif">My Favorites</h1>
        <p class="mt-2 text-gray-600">
          {{ favorites.length }} saved recipes
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4 lg:px-8 py-8">
      <!-- Favorites Grid -->
      <div
        v-if="favorites.length > 0"
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="favorite in favorites"
          :key="favorite.recipe.id"
          class="relative"
        >
          <RecipeRecipeCard :recipe="favorite.recipe" />
          <div class="absolute bottom-4 right-4">
            <span class="text-xs text-gray-500 bg-white/90 px-2 py-1 rounded">
              Saved {{ formatDate(favorite.createdAt) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-16 bg-white rounded-xl border border-gray-100"
      >
        <UIcon name="i-lucide-heart" class="w-16 h-16 text-gray-300 mx-auto" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No favorites yet</h3>
        <p class="mt-2 text-gray-500 max-w-md mx-auto">
          Start exploring recipes and save your favorites to access them quickly later.
        </p>
        <UButton
          to="/recipes"
          color="primary"
          class="mt-6"
        >
          Browse Recipes
        </UButton>
      </div>
    </div>
  </div>
</template>
