<script setup lang="ts">
const { isAuthenticated, user, logout } = useAuth()

const navLinks = [
  { label: 'Recipes', to: '/recipes' },
  { label: 'Articles', to: '/articles' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-2xl font-bold text-primary-500">FoodRecipes</span>
          </NuxtLink>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="text-gray-600 hover:text-primary-500 font-medium transition-colors"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>

          <!-- Right Side -->
          <div class="flex items-center gap-4">
            <!-- Search -->
            <UButton
              icon="i-lucide-search"
              color="neutral"
              variant="ghost"
              size="sm"
              to="/search"
            />

            <!-- Auth -->
            <template v-if="isAuthenticated">
              <UDropdownMenu
                :items="[
                  [
                    { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
                    { label: 'Favorites', icon: 'i-lucide-heart', to: '/favorites' },
                  ],
                  [
                    ...(user?.role === 'ADMIN' ? [{ label: 'Admin Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' }] : []),
                  ],
                  [
                    { label: 'Logout', icon: 'i-lucide-log-out', click: logout },
                  ],
                ]"
              >
                <UButton color="neutral" variant="ghost">
                  <UAvatar
                    :src="user?.avatar || undefined"
                    :alt="user?.name"
                    size="sm"
                  />
                  <span class="hidden sm:inline ml-2">{{ user?.name }}</span>
                </UButton>
              </UDropdownMenu>
            </template>
            <template v-else>
              <UButton to="/auth/login" variant="ghost" color="neutral">
                Login
              </UButton>
              <UButton to="/auth/register" color="primary">
                Sign Up
              </UButton>
            </template>

            <!-- Mobile Menu -->
            <UButton
              icon="i-lucide-menu"
              color="neutral"
              variant="ghost"
              class="md:hidden"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-4 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="md:col-span-2">
            <h3 class="text-xl font-bold mb-4">FoodRecipes</h3>
            <p class="text-gray-400 max-w-md">
              Discover delicious recipes from around the world. Cook with love, eat with joy.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2 text-gray-400">
              <li><NuxtLink to="/recipes" class="hover:text-white">Recipes</NuxtLink></li>
              <li><NuxtLink to="/articles" class="hover:text-white">Articles</NuxtLink></li>
              <li><NuxtLink to="/about" class="hover:text-white">About</NuxtLink></li>
              <li><NuxtLink to="/contact" class="hover:text-white">Contact</NuxtLink></li>
            </ul>
          </div>

          <!-- Categories -->
          <div>
            <h4 class="font-semibold mb-4">Categories</h4>
            <ul class="space-y-2 text-gray-400">
              <li><NuxtLink to="/recipes?category=breakfast" class="hover:text-white">Breakfast</NuxtLink></li>
              <li><NuxtLink to="/recipes?category=lunch" class="hover:text-white">Lunch</NuxtLink></li>
              <li><NuxtLink to="/recipes?category=dinner" class="hover:text-white">Dinner</NuxtLink></li>
              <li><NuxtLink to="/recipes?category=desserts" class="hover:text-white">Desserts</NuxtLink></li>
            </ul>
          </div>
        </div>

        <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {{ new Date().getFullYear() }} FoodRecipes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>
