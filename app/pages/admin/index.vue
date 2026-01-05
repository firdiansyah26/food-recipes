<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { query } = useGraphQL()

// Stats query
const STATS_QUERY = `
  query AdminStats {
    recipesCount(filter: {})
    articlesCount(filter: {})
    categories {
      id
    }
    users(take: 1) {
      id
    }
  }
`

// Recent recipes query
const RECENT_RECIPES_QUERY = `
  query RecentRecipes {
    recipes(take: 5) {
      id
      title
      slug
      published
      createdAt
      author {
        name
      }
    }
  }
`

const { data: statsData } = await useAsyncData('admin-stats', () =>
  query<{ recipesCount: number, articlesCount: number, categories: any[], users: any[] }>(STATS_QUERY)
)

const { data: recentData } = await useAsyncData('admin-recent-recipes', () =>
  query<{ recipes: any[] }>(RECENT_RECIPES_QUERY)
)

const stats = computed(() => [
  {
    label: 'Total Recipes',
    value: statsData.value?.recipesCount || 0,
    icon: 'i-lucide-chef-hat',
    color: 'primary',
    to: '/admin/recipes',
  },
  {
    label: 'Total Articles',
    value: statsData.value?.articlesCount || 0,
    icon: 'i-lucide-file-text',
    color: 'blue',
    to: '/admin/articles',
  },
  {
    label: 'Categories',
    value: statsData.value?.categories?.length || 0,
    icon: 'i-lucide-folder',
    color: 'green',
    to: '/admin/categories',
  },
  {
    label: 'Users',
    value: statsData.value?.users?.length || 0,
    icon: 'i-lucide-users',
    color: 'purple',
    to: '/admin/users',
  },
])

const recentRecipes = computed(() => recentData.value?.recipes || [])

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
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-gray-600">Welcome back! Here's what's happening with your site.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <NuxtLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.to"
        class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div
            :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              `bg-${stat.color}-100`,
            ]"
          >
            <UIcon :name="stat.icon" :class="`w-6 h-6 text-${stat.color}-500`" />
          </div>
          <div>
            <div class="text-2xl font-bold text-gray-900">{{ stat.value }}</div>
            <div class="text-sm text-gray-500">{{ stat.label }}</div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Recent Recipes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-gray-900">Recent Recipes</h2>
            <UButton
              to="/admin/recipes"
              variant="ghost"
              color="neutral"
              size="sm"
            >
              View All
            </UButton>
          </div>
        </div>
        <div class="divide-y divide-gray-100">
          <div
            v-for="recipe in recentRecipes"
            :key="recipe.id"
            class="p-4 hover:bg-gray-50"
          >
            <div class="flex items-center justify-between">
              <div>
                <NuxtLink
                  :to="`/admin/recipes/${recipe.id}`"
                  class="font-medium text-gray-900 hover:text-primary-500"
                >
                  {{ recipe.title }}
                </NuxtLink>
                <div class="text-sm text-gray-500">
                  by {{ recipe.author.name }} &bull; {{ formatDate(recipe.createdAt) }}
                </div>
              </div>
              <UBadge
                :color="recipe.published ? 'success' : 'warning'"
                variant="subtle"
              >
                {{ recipe.published ? 'Published' : 'Draft' }}
              </UBadge>
            </div>
          </div>
          <div
            v-if="recentRecipes.length === 0"
            class="p-8 text-center text-gray-500"
          >
            No recipes yet
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100">
          <h2 class="font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div class="p-6 space-y-3">
          <UButton
            to="/admin/recipes/create"
            icon="i-lucide-plus"
            color="primary"
            block
          >
            Create New Recipe
          </UButton>
          <UButton
            to="/admin/articles/create"
            icon="i-lucide-plus"
            color="neutral"
            variant="outline"
            block
          >
            Create New Article
          </UButton>
          <UButton
            to="/admin/categories"
            icon="i-lucide-folder-plus"
            color="neutral"
            variant="outline"
            block
          >
            Manage Categories
          </UButton>
          <UButton
            to="/admin/tags"
            icon="i-lucide-tags"
            color="neutral"
            variant="outline"
            block
          >
            Manage Tags
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
