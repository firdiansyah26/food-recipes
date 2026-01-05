<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute()
const { query, mutate } = useGraphQL()
const { isAuthenticated, user } = useAuth()
const toast = useToast()

const slug = route.params.slug as string

// Queries
const RECIPE_QUERY = `
  query Recipe($slug: String!) {
    recipe(slug: $slug) {
      id
      title
      slug
      description
      image
      prepTime
      cookTime
      totalTime
      servings
      difficulty
      published
      createdAt
      averageRating
      ratingsCount
      commentsCount
      isFavorited
      author {
        id
        name
        avatar
      }
      category {
        name
        slug
      }
      ingredients {
        id
        name
        amount
        unit
        order
      }
      steps {
        id
        order
        instruction
        image
      }
      tags {
        tag {
          id
          name
          slug
        }
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

const TOGGLE_FAVORITE_MUTATION = `
  mutation ToggleFavorite($recipeId: String!) {
    toggleFavorite(recipeId: $recipeId)
  }
`

const RATE_RECIPE_MUTATION = `
  mutation RateRecipe($recipeId: String!, $value: Int!) {
    rateRecipe(recipeId: $recipeId, value: $value) {
      id
      value
    }
  }
`

const CREATE_COMMENT_MUTATION = `
  mutation CreateComment($content: String!, $recipeId: String) {
    createComment(content: $content, recipeId: $recipeId) {
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

// Fetch recipe
const { data, refresh } = await useAsyncData(`recipe-${slug}`, () =>
  query<{ recipe: any }>(RECIPE_QUERY, { slug })
)

const recipe = computed(() => data.value?.recipe)

// 404 if recipe not found
if (!recipe.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Recipe not found',
  })
}

// SEO
useSeoMeta({
  title: recipe.value?.title,
  description: recipe.value?.description,
  ogTitle: recipe.value?.title,
  ogDescription: recipe.value?.description,
  ogImage: recipe.value?.image,
})

// Local state
const currentServings = ref(recipe.value?.servings || 4)
const userRating = ref(0)
const newComment = ref('')
const isSubmittingComment = ref(false)

// Computed
const servingsMultiplier = computed(() =>
  currentServings.value / (recipe.value?.servings || 1)
)

const adjustedIngredients = computed(() => {
  if (!recipe.value?.ingredients) return []
  return recipe.value.ingredients.map((ing: any) => ({
    ...ing,
    adjustedAmount: parseFloat(ing.amount) * servingsMultiplier.value,
  }))
})

// Methods
function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function toggleFavorite() {
  if (!isAuthenticated.value) {
    navigateTo('/auth/login?redirect=' + route.fullPath)
    return
  }

  try {
    await mutate(TOGGLE_FAVORITE_MUTATION, { recipeId: recipe.value.id })
    await refresh()
    toast.add({
      title: recipe.value.isFavorited ? 'Removed from favorites' : 'Added to favorites',
      color: 'success',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error',
    })
  }
}

async function rateRecipe(value: number) {
  if (!isAuthenticated.value) {
    navigateTo('/auth/login?redirect=' + route.fullPath)
    return
  }

  try {
    await mutate(RATE_RECIPE_MUTATION, { recipeId: recipe.value.id, value })
    userRating.value = value
    await refresh()
    toast.add({
      title: 'Rating saved',
      description: `You rated this recipe ${value} stars`,
      color: 'success',
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error',
    })
  }
}

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
      recipeId: recipe.value.id,
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

const difficultyColor = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'error',
} as const
</script>

<template>
  <div v-if="recipe" class="min-h-screen bg-gray-50">
    <!-- Hero Image -->
    <div class="relative h-[400px] lg:h-[500px] bg-gray-200">
      <img
        v-if="recipe.image"
        :src="recipe.image"
        :alt="recipe.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <!-- Back Button -->
      <div class="absolute top-4 left-4">
        <UButton
          icon="i-lucide-arrow-left"
          color="white"
          variant="solid"
          to="/recipes"
        >
          Back to Recipes
        </UButton>
      </div>

      <!-- Actions -->
      <div class="absolute top-4 right-4 flex gap-2">
        <UButton
          :icon="recipe.isFavorited ? 'i-lucide-heart' : 'i-lucide-heart'"
          :color="recipe.isFavorited ? 'error' : 'white'"
          variant="solid"
          @click="toggleFavorite"
        >
          {{ recipe.isFavorited ? 'Saved' : 'Save' }}
        </UButton>
        <UButton
          icon="i-lucide-share"
          color="white"
          variant="solid"
        >
          Share
        </UButton>
      </div>

      <!-- Title Overlay -->
      <div class="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
        <div class="container mx-auto">
          <div class="flex items-center gap-2 mb-3">
            <UBadge color="primary">{{ recipe.category.name }}</UBadge>
            <UBadge :color="difficultyColor[recipe.difficulty as keyof typeof difficultyColor]" variant="subtle">
              {{ recipe.difficulty.toLowerCase() }}
            </UBadge>
          </div>
          <h1 class="text-3xl lg:text-5xl font-bold font-serif">{{ recipe.title }}</h1>

          <!-- Author & Date -->
          <div class="mt-4 flex items-center gap-4">
            <div class="flex items-center gap-2">
              <UAvatar
                :src="recipe.author.avatar || undefined"
                :alt="recipe.author.name"
                size="sm"
              />
              <span>{{ recipe.author.name }}</span>
            </div>
            <span class="text-white/60">{{ formatDate(recipe.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Main Content -->
        <main class="flex-1">
          <!-- Quick Info -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="text-center">
                <UIcon name="i-lucide-clock" class="w-6 h-6 text-primary-500 mx-auto" />
                <div class="mt-2 text-sm text-gray-500">Prep Time</div>
                <div class="font-semibold">{{ formatTime(recipe.prepTime) }}</div>
              </div>
              <div class="text-center">
                <UIcon name="i-lucide-flame" class="w-6 h-6 text-primary-500 mx-auto" />
                <div class="mt-2 text-sm text-gray-500">Cook Time</div>
                <div class="font-semibold">{{ formatTime(recipe.cookTime) }}</div>
              </div>
              <div class="text-center">
                <UIcon name="i-lucide-users" class="w-6 h-6 text-primary-500 mx-auto" />
                <div class="mt-2 text-sm text-gray-500">Servings</div>
                <div class="font-semibold">{{ recipe.servings }}</div>
              </div>
              <div class="text-center">
                <UIcon name="i-lucide-star" class="w-6 h-6 text-yellow-500 mx-auto" />
                <div class="mt-2 text-sm text-gray-500">Rating</div>
                <div class="font-semibold">
                  {{ recipe.averageRating?.toFixed(1) || 'N/A' }}
                  <span class="text-gray-400 text-sm">({{ recipe.ratingsCount }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">About this Recipe</h2>
            <p class="text-gray-600 leading-relaxed">{{ recipe.description }}</p>

            <!-- Tags -->
            <div v-if="recipe.tags?.length" class="mt-4 flex flex-wrap gap-2">
              <UBadge
                v-for="{ tag } in recipe.tags"
                :key="tag.id"
                color="neutral"
                variant="subtle"
              >
                {{ tag.name }}
              </UBadge>
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Instructions</h2>
            <ol class="space-y-6">
              <li
                v-for="step in recipe.steps"
                :key="step.id"
                class="flex gap-4"
              >
                <div class="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {{ step.order }}
                </div>
                <div class="flex-1">
                  <p class="text-gray-700 leading-relaxed">{{ step.instruction }}</p>
                  <img
                    v-if="step.image"
                    :src="step.image"
                    :alt="`Step ${step.order}`"
                    class="mt-3 rounded-lg max-w-md"
                  />
                </div>
              </li>
            </ol>
          </div>

          <!-- Rating Section -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Rate this Recipe</h2>
            <div class="flex items-center gap-2">
              <button
                v-for="star in 5"
                :key="star"
                class="focus:outline-none"
                @click="rateRecipe(star)"
              >
                <UIcon
                  name="i-lucide-star"
                  :class="[
                    'w-8 h-8 transition-colors',
                    star <= userRating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                  ]"
                />
              </button>
              <span class="ml-2 text-gray-500">Click to rate</span>
            </div>
          </div>

          <!-- Comments -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">
              Comments ({{ recipe.commentsCount }})
            </h2>

            <!-- New Comment -->
            <div class="mb-6">
              <UTextarea
                v-model="newComment"
                placeholder="Share your thoughts about this recipe..."
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
                v-for="comment in recipe.comments"
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
                v-if="recipe.comments?.length === 0"
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
            <!-- Ingredients -->
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900">Ingredients</h2>
              </div>

              <!-- Servings Adjuster -->
              <div class="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Servings:</span>
                <UButton
                  icon="i-lucide-minus"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  :disabled="currentServings <= 1"
                  @click="currentServings--"
                />
                <span class="font-semibold w-8 text-center">{{ currentServings }}</span>
                <UButton
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  @click="currentServings++"
                />
              </div>

              <ul class="space-y-3">
                <li
                  v-for="ingredient in adjustedIngredients"
                  :key="ingredient.id"
                  class="flex items-start gap-2"
                >
                  <UIcon name="i-lucide-check" class="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span class="text-gray-700">
                    <span class="font-medium">
                      {{ ingredient.adjustedAmount % 1 === 0 ? ingredient.adjustedAmount : ingredient.adjustedAmount.toFixed(1) }}
                      {{ ingredient.unit }}
                    </span>
                    {{ ingredient.name }}
                  </span>
                </li>
              </ul>
            </div>

            <!-- Print Button -->
            <UButton
              icon="i-lucide-printer"
              color="neutral"
              variant="outline"
              block
              @click="window.print()"
            >
              Print Recipe
            </UButton>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
