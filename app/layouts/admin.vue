<script setup lang="ts">
const { user, logout, isAdmin } = useAuth()

// Redirect if not admin
if (!isAdmin.value) {
  navigateTo('/')
}

const sidebarLinks = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin' },
  { label: 'Recipes', icon: 'i-lucide-chef-hat', to: '/admin/recipes' },
  { label: 'Articles', icon: 'i-lucide-file-text', to: '/admin/articles' },
  { label: 'Categories', icon: 'i-lucide-folder', to: '/admin/categories' },
  { label: 'Tags', icon: 'i-lucide-tags', to: '/admin/tags' },
  { label: 'Users', icon: 'i-lucide-users', to: '/admin/users' },
  { label: 'Media', icon: 'i-lucide-image', to: '/admin/media' },
]

const isSidebarOpen = ref(true)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 bg-gray-900 text-white transition-all duration-300',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        <NuxtLink to="/admin" class="flex items-center gap-2">
          <span class="text-xl font-bold text-primary-400">
            {{ isSidebarOpen ? 'FoodRecipes' : 'FR' }}
          </span>
          <UBadge v-if="isSidebarOpen" color="primary" size="xs">
            Admin
          </UBadge>
        </NuxtLink>
        <UButton
          :icon="isSidebarOpen ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="toggleSidebar"
        />
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1">
        <NuxtLink
          v-for="link in sidebarLinks"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="[
            $route.path === link.to || ($route.path.startsWith(link.to) && link.to !== '/admin')
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
          ]"
        >
          <UIcon :name="link.icon" class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen">{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Bottom Actions -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <UIcon name="i-lucide-home" class="w-5 h-5" />
          <span v-if="isSidebarOpen">View Site</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content -->
    <div
      :class="[
        'transition-all duration-300',
        isSidebarOpen ? 'ml-64' : 'ml-20',
      ]"
    >
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-semibold text-gray-900">
            <!-- Page title will be set by each page -->
            Admin Dashboard
          </h1>
        </div>

        <div class="flex items-center gap-4">
          <!-- Notifications -->
          <UButton
            icon="i-lucide-bell"
            color="neutral"
            variant="ghost"
            size="sm"
          />

          <!-- User Menu -->
          <UDropdownMenu
            :items="[
              [
                { label: 'Profile', icon: 'i-lucide-user', to: '/profile' },
                { label: 'Settings', icon: 'i-lucide-settings', to: '/admin/settings' },
              ],
              [
                { label: 'Logout', icon: 'i-lucide-log-out', click: logout },
              ],
            ]"
          >
            <UButton color="neutral" variant="ghost" size="sm">
              <UAvatar
                :src="user?.avatar || undefined"
                :alt="user?.name"
                size="xs"
              />
              <span class="ml-2">{{ user?.name }}</span>
            </UButton>
          </UDropdownMenu>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
