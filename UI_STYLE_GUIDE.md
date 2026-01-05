# Nuxt Food Recipes - UI Style Guide

## Theme: Sweet & Foodies

A warm, appetizing design that makes users hungry! Inspired by fresh ingredients, cozy kitchens, and the joy of cooking.

---

## Color Palette

### Primary Colors
```css
:root {
  /* Main Brand - Warm Orange (Appetizing, Energetic) */
  --primary-50: #FFF7ED;
  --primary-100: #FFEDD5;
  --primary-200: #FED7AA;
  --primary-300: #FDBA74;
  --primary-400: #FB923C;
  --primary-500: #F97316;  /* Main Brand Color */
  --primary-600: #EA580C;
  --primary-700: #C2410C;
  --primary-800: #9A3412;
  --primary-900: #7C2D12;

  /* Secondary - Warm Brown (Coffee, Chocolate) */
  --secondary-50: #FEFCE8;
  --secondary-100: #FEF9C3;
  --secondary-200: #FEF08A;
  --secondary-300: #FDE047;
  --secondary-400: #FACC15;
  --secondary-500: #EAB308;  /* Honey Gold */
  --secondary-600: #CA8A04;
  --secondary-700: #A16207;
  --secondary-800: #854D0E;
  --secondary-900: #713F12;
}
```

### Accent Colors
```css
:root {
  /* Fresh Green - Vegetables, Herbs */
  --accent-green-light: #DCFCE7;
  --accent-green: #22C55E;
  --accent-green-dark: #166534;

  /* Berry Red - Fruits, Desserts */
  --accent-red-light: #FEE2E2;
  --accent-red: #EF4444;
  --accent-red-dark: #991B1B;

  /* Cream - Background, Cards */
  --cream-50: #FFFBEB;
  --cream-100: #FEF3C7;
  --cream-200: #FDE68A;
}
```

### Neutral Colors
```css
:root {
  /* Warm Grays */
  --gray-50: #FAFAF9;
  --gray-100: #F5F5F4;
  --gray-200: #E7E5E4;
  --gray-300: #D6D3D1;
  --gray-400: #A8A29E;
  --gray-500: #78716C;
  --gray-600: #57534E;
  --gray-700: #44403C;
  --gray-800: #292524;
  --gray-900: #1C1917;
}
```

### Semantic Colors
```css
:root {
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}
```

---

## Typography

### Font Family
```css
:root {
  /* Headings - Playful & Warm */
  --font-display: 'DM Serif Display', 'Playfair Display', Georgia, serif;

  /* Body - Clean & Readable */
  --font-body: 'Inter', 'DM Sans', -apple-system, sans-serif;

  /* Accent - Handwritten feel for quotes/highlights */
  --font-accent: 'Caveat', 'Dancing Script', cursive;
}
```

### Type Scale
```css
/* Headings */
.h1 { font-size: 3rem; font-weight: 700; line-height: 1.2; }      /* 48px */
.h2 { font-size: 2.25rem; font-weight: 700; line-height: 1.25; }  /* 36px */
.h3 { font-size: 1.5rem; font-weight: 600; line-height: 1.3; }    /* 24px */
.h4 { font-size: 1.25rem; font-weight: 600; line-height: 1.4; }   /* 20px */
.h5 { font-size: 1.125rem; font-weight: 500; line-height: 1.5; }  /* 18px */

/* Body */
.body-lg { font-size: 1.125rem; line-height: 1.75; }  /* 18px */
.body { font-size: 1rem; line-height: 1.75; }          /* 16px */
.body-sm { font-size: 0.875rem; line-height: 1.5; }    /* 14px */
.caption { font-size: 0.75rem; line-height: 1.5; }     /* 12px */
```

---

## Tailwind Config

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        secondary: {
          50: '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
        },
        cream: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
        },
      },
      fontFamily: {
        display: ['DM Serif Display', 'Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'DM Sans', 'sans-serif'],
        accent: ['Caveat', 'Dancing Script', 'cursive'],
      },
      borderRadius: {
        'card': '1rem',
        'button': '0.75rem',
        'input': '0.5rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'button': '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
      },
    },
  },
}
```

---

## Component Styles

### Recipe Card

```vue
<!-- components/recipe/RecipeCard.vue -->
<template>
  <article class="recipe-card group cursor-pointer">
    <!-- Image Container -->
    <div class="relative overflow-hidden rounded-t-card">
      <img
        :src="recipe.image"
        :alt="recipe.title"
        class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
      />

      <!-- Favorite Button -->
      <button class="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors">
        <HeartIcon class="w-5 h-5 text-gray-400 group-hover:text-red-500" />
      </button>

      <!-- Difficulty Badge -->
      <span class="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-primary-600">
        {{ recipe.difficulty }}
      </span>
    </div>

    <!-- Content -->
    <div class="p-4 bg-white rounded-b-card">
      <!-- Category -->
      <span class="text-xs font-medium text-primary-500 uppercase tracking-wider">
        {{ recipe.category.name }}
      </span>

      <!-- Title -->
      <h3 class="mt-1 font-display text-xl text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
        {{ recipe.title }}
      </h3>

      <!-- Meta Info -->
      <div class="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <div class="flex items-center gap-1">
          <ClockIcon class="w-4 h-4" />
          <span>{{ recipe.prepTime + recipe.cookTime }} min</span>
        </div>
        <div class="flex items-center gap-1">
          <UsersIcon class="w-4 h-4" />
          <span>{{ recipe.servings }} servings</span>
        </div>
      </div>

      <!-- Rating -->
      <div class="mt-3 flex items-center gap-2">
        <div class="flex">
          <StarIcon
            v-for="i in 5"
            :key="i"
            class="w-4 h-4"
            :class="i <= recipe.rating ? 'text-secondary-400 fill-secondary-400' : 'text-gray-200'"
          />
        </div>
        <span class="text-sm text-gray-500">({{ recipe.reviewCount }})</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.recipe-card {
  @apply bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow duration-300;
}
</style>
```

### Button Styles

```vue
<!-- components/ui/AppButton.vue -->
<template>
  <button :class="buttonClasses">
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  }
})

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-button focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-button focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
  }

  return [base, variants[props.variant], sizes[props.size]]
})
</script>
```

### Form Input

```vue
<!-- components/ui/AppInput.vue -->
<template>
  <div class="form-group">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :class="inputClasses"
      />
      <slot name="icon" />
    </div>

    <p v-if="error" class="mt-1.5 text-sm text-red-500">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-sm text-gray-400">
      {{ hint }}
    </p>
  </div>
</template>

<style scoped>
input {
  @apply w-full px-4 py-3
         bg-gray-50 border border-gray-200 rounded-input
         text-gray-900 placeholder-gray-400
         transition-all duration-200
         focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none;
}

input.error {
  @apply border-red-500 focus:border-red-500 focus:ring-red-500/20;
}
</style>
```

---

## Page Layouts

### Homepage Hero

```vue
<!-- components/home/HeroSection.vue -->
<template>
  <section class="relative min-h-[80vh] flex items-center bg-cream-50 overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <svg class="w-full h-full" viewBox="0 0 100 100">
        <!-- Food icons pattern -->
      </svg>
    </div>

    <div class="container mx-auto px-4 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Content -->
        <div class="space-y-6">
          <span class="inline-block px-4 py-2 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
            Discover Delicious Recipes
          </span>

          <h1 class="font-display text-5xl lg:text-6xl text-gray-900 leading-tight">
            Cook with
            <span class="text-primary-500">Love</span>,
            <br />
            Eat with <span class="text-secondary-500">Joy</span>
          </h1>

          <p class="text-lg text-gray-600 max-w-lg">
            Explore thousands of mouth-watering recipes from around the world.
            From quick weeknight dinners to impressive weekend feasts.
          </p>

          <!-- Search Bar -->
          <div class="flex gap-3 max-w-md">
            <div class="flex-1 relative">
              <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                class="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-button shadow-card focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button class="px-6 py-4 bg-primary-500 text-white rounded-button shadow-button hover:bg-primary-600 transition-colors">
              Search
            </button>
          </div>

          <!-- Stats -->
          <div class="flex gap-8 pt-4">
            <div>
              <p class="font-display text-3xl text-gray-900">10K+</p>
              <p class="text-sm text-gray-500">Recipes</p>
            </div>
            <div>
              <p class="font-display text-3xl text-gray-900">50K+</p>
              <p class="text-sm text-gray-500">Users</p>
            </div>
            <div>
              <p class="font-display text-3xl text-gray-900">4.9</p>
              <p class="text-sm text-gray-500">Rating</p>
            </div>
          </div>
        </div>

        <!-- Hero Image -->
        <div class="relative">
          <div class="relative z-10">
            <img
              src="/images/hero-food.png"
              alt="Delicious Food"
              class="w-full max-w-lg mx-auto drop-shadow-2xl"
            />
          </div>

          <!-- Floating Cards -->
          <div class="absolute top-10 -left-4 bg-white p-3 rounded-xl shadow-card animate-float">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🍕</span>
              <div>
                <p class="text-sm font-medium">Pizza</p>
                <p class="text-xs text-gray-400">120+ recipes</p>
              </div>
            </div>
          </div>

          <div class="absolute bottom-20 -right-4 bg-white p-3 rounded-xl shadow-card animate-float-delayed">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🍰</span>
              <div>
                <p class="text-sm font-medium">Desserts</p>
                <p class="text-xs text-gray-400">200+ recipes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float 3s ease-in-out infinite 1.5s;
}
</style>
```

### Category Section

```vue
<!-- components/home/CategorySection.vue -->
<template>
  <section class="py-16 bg-white">
    <div class="container mx-auto px-4 lg:px-8">
      <div class="text-center mb-12">
        <h2 class="font-display text-3xl text-gray-900">
          Browse by Category
        </h2>
        <p class="mt-2 text-gray-500">
          Explore recipes organized by your favorite cuisines and meal types
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <NuxtLink
          v-for="category in categories"
          :key="category.slug"
          :to="`/recipes?category=${category.slug}`"
          class="category-card group"
        >
          <div class="relative h-32 overflow-hidden rounded-xl">
            <img
              :src="category.image"
              :alt="category.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
              <p class="font-medium text-sm">{{ category.name }}</p>
              <p class="text-xs text-white/70">{{ category.count }} recipes</p>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
```

---

## Recipe Detail Page

```vue
<!-- pages/recipes/[slug].vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Image -->
    <div class="relative h-[50vh] bg-gray-900">
      <img
        :src="recipe.image"
        :alt="recipe.title"
        class="w-full h-full object-cover opacity-90"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

      <!-- Content Overlay -->
      <div class="absolute bottom-0 left-0 right-0 p-8">
        <div class="container mx-auto">
          <span class="inline-block px-3 py-1 bg-primary-500 text-white text-sm rounded-full mb-4">
            {{ recipe.category.name }}
          </span>
          <h1 class="font-display text-4xl lg:text-5xl text-white mb-4">
            {{ recipe.title }}
          </h1>

          <div class="flex items-center gap-6 text-white/80">
            <div class="flex items-center gap-2">
              <ClockIcon class="w-5 h-5" />
              <span>{{ recipe.prepTime + recipe.cookTime }} min</span>
            </div>
            <div class="flex items-center gap-2">
              <FireIcon class="w-5 h-5" />
              <span>{{ recipe.difficulty }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UsersIcon class="w-5 h-5" />
              <span>{{ recipe.servings }} servings</span>
            </div>
            <div class="flex items-center gap-1">
              <StarIcon class="w-5 h-5 text-secondary-400 fill-secondary-400" />
              <span>{{ recipe.rating }} ({{ recipe.reviewCount }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto px-4 lg:px-8 py-12">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Description -->
          <div class="bg-white p-6 rounded-card shadow-card">
            <p class="text-gray-600 leading-relaxed">
              {{ recipe.description }}
            </p>
          </div>

          <!-- Ingredients -->
          <div class="bg-white p-6 rounded-card shadow-card">
            <h2 class="font-display text-2xl text-gray-900 mb-4">
              Ingredients
            </h2>
            <ul class="space-y-3">
              <li
                v-for="ingredient in recipe.ingredients"
                :key="ingredient.id"
                class="flex items-center gap-3 p-3 bg-cream-50 rounded-lg"
              >
                <span class="w-8 h-8 flex items-center justify-center bg-primary-100 rounded-full text-primary-600 text-sm font-medium">
                  {{ ingredient.amount }}
                </span>
                <span class="text-gray-700">
                  {{ ingredient.unit }} {{ ingredient.name }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Steps -->
          <div class="bg-white p-6 rounded-card shadow-card">
            <h2 class="font-display text-2xl text-gray-900 mb-6">
              Instructions
            </h2>
            <ol class="space-y-6">
              <li
                v-for="step in recipe.steps"
                :key="step.order"
                class="flex gap-4"
              >
                <span class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary-500 text-white rounded-full font-bold">
                  {{ step.order }}
                </span>
                <div class="flex-1 pt-2">
                  <p class="text-gray-700 leading-relaxed">
                    {{ step.instruction }}
                  </p>
                  <img
                    v-if="step.image"
                    :src="step.image"
                    class="mt-4 rounded-lg"
                  />
                </div>
              </li>
            </ol>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Author Card -->
          <div class="bg-white p-6 rounded-card shadow-card text-center">
            <img
              :src="recipe.author.avatar"
              :alt="recipe.author.name"
              class="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-primary-100"
            />
            <h3 class="font-display text-xl text-gray-900">
              {{ recipe.author.name }}
            </h3>
            <p class="text-sm text-gray-500 mb-4">Recipe Author</p>
            <button class="w-full px-4 py-2 border-2 border-primary-500 text-primary-500 rounded-button hover:bg-primary-50 transition-colors">
              Follow
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="bg-white p-6 rounded-card shadow-card space-y-3">
            <button class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-button shadow-button hover:bg-primary-600 transition-colors">
              <HeartIcon class="w-5 h-5" />
              Save Recipe
            </button>
            <button class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-button hover:bg-gray-50 transition-colors">
              <ShareIcon class="w-5 h-5" />
              Share
            </button>
            <button class="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-button hover:bg-gray-50 transition-colors">
              <PrinterIcon class="w-5 h-5" />
              Print
            </button>
          </div>

          <!-- Nutrition Info -->
          <div class="bg-white p-6 rounded-card shadow-card">
            <h3 class="font-display text-lg text-gray-900 mb-4">
              Nutrition Facts
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between py-2 border-b border-gray-100">
                <span class="text-gray-500">Calories</span>
                <span class="font-medium text-gray-900">450 kcal</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100">
                <span class="text-gray-500">Protein</span>
                <span class="font-medium text-gray-900">25g</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-100">
                <span class="text-gray-500">Carbs</span>
                <span class="font-medium text-gray-900">45g</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-gray-500">Fat</span>
                <span class="font-medium text-gray-900">18g</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## Admin Dashboard Styles

```vue
<!-- layouts/admin.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-800">
        <span class="font-display text-xl">FoodRecipes</span>
        <span class="ml-2 px-2 py-0.5 bg-primary-500 text-xs rounded">Admin</span>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-1">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
          :class="isActive(item.path) ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="ml-64">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
        <h1 class="text-xl font-medium text-gray-900">{{ pageTitle }}</h1>

        <div class="flex items-center gap-4">
          <button class="p-2 text-gray-400 hover:text-gray-600">
            <BellIcon class="w-6 h-6" />
          </button>
          <div class="flex items-center gap-3">
            <img
              :src="user.avatar"
              class="w-8 h-8 rounded-full"
            />
            <span class="text-sm text-gray-700">{{ user.name }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-8">
        <slot />
      </div>
    </main>
  </div>
</template>
```

### Admin Data Table

```vue
<!-- components/admin/DataTable.vue -->
<template>
  <div class="bg-white rounded-card shadow-card overflow-hidden">
    <!-- Table Header -->
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="font-display text-lg text-gray-900">{{ title }}</h2>
      <slot name="actions" />
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="row in data"
            :key="row.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap"
            >
              <slot :name="column.key" :row="row">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Showing {{ from }}-{{ to }} of {{ total }} results
      </p>
      <div class="flex gap-2">
        <button
          class="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          :disabled="currentPage === 1"
        >
          Previous
        </button>
        <button
          class="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          :disabled="currentPage === lastPage"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
```

---

## Animation & Transitions

```css
/* assets/css/transitions.css */

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Up */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Scale */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Skeleton Loading */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## Icons Used

Recommended: **Heroicons** or **Lucide Icons**

```bash
npm install @heroicons/vue
# or
npm install lucide-vue-next
```

Common icons for the project:
- `HeartIcon` - Favorites
- `ClockIcon` - Time
- `UsersIcon` - Servings
- `StarIcon` - Rating
- `SearchIcon` - Search
- `FireIcon` - Difficulty
- `ShareIcon` - Share
- `PrinterIcon` - Print
- `HomeIcon` - Dashboard
- `BookOpenIcon` - Recipes
- `DocumentTextIcon` - Articles
- `TagIcon` - Categories
- `UserGroupIcon` - Users
- `PhotoIcon` - Media

---

## Summary

This UI style guide provides:
- **Warm, appetizing color palette** inspired by food
- **Typography** with display serif for headings and clean sans-serif for body
- **Component styles** for cards, buttons, inputs, and tables
- **Page layouts** for homepage, recipe detail, and admin dashboard
- **Animations & transitions** for smooth user experience
- **Consistent spacing and shadows** for visual hierarchy

The design is optimized for:
- Mobile-first responsive layouts
- Accessibility with proper contrast ratios
- Performance with optimized images and lazy loading
- User engagement with hover effects and micro-interactions
