<script setup lang="ts">
const { fetchUser } = useAuth()

// Fetch user on app load
onMounted(async () => {
  await fetchUser()
})

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'FoodRecipes - Discover Delicious Recipes'
const description = 'Discover thousands of delicious recipes from around the world. From quick weeknight dinners to impressive weekend feasts.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/og-image.jpg',
  twitterImage: '/og-image.jpg',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <UNotifications />
  </UApp>
</template>
