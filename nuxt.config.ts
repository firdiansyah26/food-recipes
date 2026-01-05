// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // Runtime config for environment variables
  runtimeConfig: {
    // Server-side only
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    algoliaAppId: process.env.ALGOLIA_APP_ID,
    algoliaApiKey: process.env.ALGOLIA_API_KEY,

    // Public (client-side available)
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      algoliaSearchKey: process.env.ALGOLIA_SEARCH_KEY
    }
  },

  // Route rules for ISR and caching
  routeRules: {
    '/': { prerender: true },
    '/recipes': { isr: 60 }, // Revalidate every 60 seconds
    '/recipes/**': { isr: 300 }, // Revalidate every 5 minutes
    '/articles': { isr: 60 },
    '/articles/**': { isr: 300 },
    '/admin/**': { ssr: false }, // SPA mode for admin
    '/api/**': { cors: true }
  },

  // App configuration
  app: {
    head: {
      title: 'FoodRecipes - Discover Delicious Recipes',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Discover thousands of delicious recipes from around the world. From quick weeknight dinners to impressive weekend feasts.' },
        { name: 'theme-color', content: '#F97316' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Preconnect to external fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap' }
      ]
    }
  },

  compatibilityDate: '2025-01-15',

  // TypeScript configuration
  typescript: {
    strict: true
  },

  // ESLint configuration
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
