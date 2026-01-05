<script setup lang="ts">
interface Recipe {
  id: string
  title: string
  slug: string
  description: string
  image: string | null
  prepTime: number
  cookTime: number
  totalTime: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  averageRating: number | null
  ratingsCount: number
  category: {
    name: string
    slug: string
  }
  author: {
    name: string
    avatar: string | null
  }
}

defineProps<{
  recipe: Recipe
}>()

const difficultyColor = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'error',
} as const

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
</script>

<template>
  <NuxtLink
    :to="`/recipes/${recipe.slug}`"
    class="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
  >
    <!-- Image -->
    <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
      <img
        v-if="recipe.image"
        :src="recipe.image"
        :alt="recipe.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gray-200"
      >
        <UIcon name="i-lucide-image" class="w-12 h-12 text-gray-400" />
      </div>

      <!-- Category Badge -->
      <UBadge
        color="primary"
        size="sm"
        class="absolute top-3 left-3"
      >
        {{ recipe.category.name }}
      </UBadge>

      <!-- Rating -->
      <div
        v-if="recipe.averageRating"
        class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1"
      >
        <UIcon name="i-lucide-star" class="w-4 h-4 text-yellow-500" />
        <span class="text-sm font-medium">{{ recipe.averageRating.toFixed(1) }}</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 text-lg line-clamp-2 group-hover:text-primary-500 transition-colors">
        {{ recipe.title }}
      </h3>

      <p class="mt-2 text-gray-500 text-sm line-clamp-2">
        {{ recipe.description }}
      </p>

      <!-- Meta -->
      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center gap-3 text-sm text-gray-500">
          <!-- Time -->
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-clock" class="w-4 h-4" />
            <span>{{ formatTime(recipe.totalTime) }}</span>
          </div>

          <!-- Difficulty -->
          <UBadge
            :color="difficultyColor[recipe.difficulty]"
            variant="subtle"
            size="xs"
          >
            {{ recipe.difficulty.toLowerCase() }}
          </UBadge>
        </div>

        <!-- Author -->
        <div class="flex items-center gap-2">
          <UAvatar
            :src="recipe.author.avatar || undefined"
            :alt="recipe.author.name"
            size="xs"
          />
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
