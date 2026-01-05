<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const { query } = useGraphQL()

// GraphQL queries
const FEATURED_RECIPES_QUERY = `
  query FeaturedRecipes {
    featuredRecipes(take: 6) {
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
`

const CATEGORIES_QUERY = `
  query Categories {
    categories {
      id
      name
      slug
      image
      recipesCount
    }
  }
`

// Fetch data
const { data: recipesData } = await useAsyncData('featured-recipes', () =>
  query<{ featuredRecipes: any[] }>(FEATURED_RECIPES_QUERY)
)

const { data: categoriesData } = await useAsyncData('categories', () =>
  query<{ categories: any[] }>(CATEGORIES_QUERY)
)

const featuredRecipes = computed(() => recipesData.value?.featuredRecipes || [])
const categories = computed(() => categoriesData.value?.categories || [])
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-primary-500 to-primary-700 text-white">
      <div class="container mx-auto px-4 lg:px-8 py-20 lg:py-32">
        <div class="max-w-3xl">
          <h1 class="text-4xl lg:text-6xl font-bold font-serif leading-tight">
            Discover Delicious
            <span class="text-primary-200">Recipes</span>
            From Around the World
          </h1>
          <p class="mt-6 text-lg lg:text-xl text-primary-100 max-w-2xl">
            From quick weeknight dinners to impressive weekend feasts.
            Find the perfect recipe for any occasion.
          </p>

          <!-- Search Bar -->
          <div class="mt-8 flex gap-3">
            <UInput
              placeholder="Search recipes..."
              icon="i-lucide-search"
              size="xl"
              class="flex-1 max-w-md"
            />
            <UButton
              color="white"
              size="xl"
              to="/recipes"
            >
              Browse All
            </UButton>
          </div>

          <!-- Quick Stats -->
          <div class="mt-12 flex gap-8">
            <div>
              <div class="text-3xl font-bold">500+</div>
              <div class="text-primary-200">Recipes</div>
            </div>
            <div>
              <div class="text-3xl font-bold">50+</div>
              <div class="text-primary-200">Categories</div>
            </div>
            <div>
              <div class="text-3xl font-bold">10k+</div>
              <div class="text-primary-200">Happy Cooks</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Decorative -->
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-gray-50" style="clip-path: polygon(0 100%, 100% 100%, 100% 0, 0 100%)" />
    </section>

    <!-- Categories Section -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 font-serif">
              Browse by Category
            </h2>
            <p class="mt-2 text-gray-600">
              Find recipes by your favorite cuisine or meal type
            </p>
          </div>
          <UButton
            to="/recipes"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-arrow-right"
          >
            View All
          </UButton>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <NuxtLink
            v-for="category in categories.slice(0, 6)"
            :key="category.id"
            :to="`/recipes?category=${category.slug}`"
            class="group relative aspect-square rounded-xl overflow-hidden bg-gray-200"
          >
            <img
              v-if="category.image"
              :src="category.image"
              :alt="category.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 class="font-semibold">{{ category.name }}</h3>
              <p class="text-sm text-white/80">{{ category.recipesCount }} recipes</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Featured Recipes Section -->
    <section class="py-16">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 font-serif">
              Featured Recipes
            </h2>
            <p class="mt-2 text-gray-600">
              Hand-picked recipes by our culinary team
            </p>
          </div>
          <UButton
            to="/recipes"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-arrow-right"
          >
            View All
          </UButton>
        </div>

        <!-- Recipes Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RecipeRecipeCard
            v-for="recipe in featuredRecipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>

        <!-- Empty State -->
        <div
          v-if="featuredRecipes.length === 0"
          class="text-center py-12"
        >
          <UIcon name="i-lucide-chef-hat" class="w-16 h-16 text-gray-300 mx-auto" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">No recipes yet</h3>
          <p class="mt-2 text-gray-500">Check back later for delicious recipes!</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 font-serif">
            How It Works
          </h2>
          <p class="mt-2 text-gray-600">
            Start cooking in three simple steps
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <UIcon name="i-lucide-search" class="w-8 h-8 text-primary-500" />
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Find a Recipe</h3>
            <p class="mt-2 text-gray-600">
              Search our collection of recipes by ingredients, cuisine, or cooking time.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <UIcon name="i-lucide-shopping-basket" class="w-8 h-8 text-primary-500" />
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Gather Ingredients</h3>
            <p class="mt-2 text-gray-600">
              Check the ingredient list and make sure you have everything you need.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <UIcon name="i-lucide-chef-hat" class="w-8 h-8 text-primary-500" />
            </div>
            <h3 class="mt-4 text-lg font-semibold text-gray-900">Start Cooking</h3>
            <p class="mt-2 text-gray-600">
              Follow the step-by-step instructions and enjoy your delicious meal!
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-primary-500 text-white">
      <div class="container mx-auto px-4 lg:px-8 text-center">
        <h2 class="text-2xl lg:text-3xl font-bold font-serif">
          Ready to Start Cooking?
        </h2>
        <p class="mt-4 text-primary-100 max-w-2xl mx-auto">
          Join our community of food lovers and get access to exclusive recipes, cooking tips, and more.
        </p>
        <div class="mt-8 flex justify-center gap-4">
          <UButton
            to="/auth/register"
            color="white"
            size="lg"
          >
            Create Free Account
          </UButton>
          <UButton
            to="/recipes"
            variant="outline"
            color="white"
            size="lg"
          >
            Browse Recipes
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>
