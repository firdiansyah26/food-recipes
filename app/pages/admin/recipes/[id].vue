<script setup lang="ts">
import { useForm, useFieldArray } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { recipeSchema, difficultyOptions, type RecipeFormData } from '~/schemas/recipe'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const router = useRouter()
const { query, mutate } = useGraphQL()
const toast = useToast()

const recipeId = route.params.id as string

// Queries
const RECIPE_QUERY = `
  query Recipe($id: String!) {
    recipeById(id: $id) {
      id
      title
      slug
      description
      image
      prepTime
      cookTime
      servings
      difficulty
      published
      categoryId
      ingredients {
        id
        name
        amount
        unit
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
        }
      }
    }
  }
`

const CATEGORIES_QUERY = `
  query Categories {
    categories {
      id
      name
    }
  }
`

const TAGS_QUERY = `
  query Tags {
    tags {
      id
      name
    }
  }
`

const UPDATE_RECIPE_MUTATION = `
  mutation UpdateRecipe($id: String!, $input: UpdateRecipeInput!) {
    updateRecipe(id: $id, input: $input) {
      id
      slug
    }
  }
`

// Fetch recipe
const { data: recipeData } = await useAsyncData(`admin-recipe-${recipeId}`, () =>
  query<{ recipeById: any }>(RECIPE_QUERY, { id: recipeId })
)

const recipe = computed(() => recipeData.value?.recipeById)

// 404 if not found
if (!recipe.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Recipe not found',
  })
}

// Fetch categories and tags
const { data: categoriesData } = await useAsyncData('admin-categories', () =>
  query<{ categories: any[] }>(CATEGORIES_QUERY)
)

const { data: tagsData } = await useAsyncData('admin-tags', () =>
  query<{ tags: any[] }>(TAGS_QUERY)
)

const categories = computed(() =>
  categoriesData.value?.categories.map(c => ({ label: c.name, value: c.id })) || []
)

const tags = computed(() =>
  tagsData.value?.tags.map(t => ({ label: t.name, value: t.id })) || []
)

// Form setup with existing data
const { handleSubmit, errors, defineField, isSubmitting } = useForm<RecipeFormData>({
  validationSchema: toTypedSchema(recipeSchema),
  initialValues: {
    title: recipe.value.title,
    description: recipe.value.description,
    image: recipe.value.image || '',
    prepTime: recipe.value.prepTime,
    cookTime: recipe.value.cookTime,
    servings: recipe.value.servings,
    difficulty: recipe.value.difficulty,
    categoryId: recipe.value.categoryId,
    ingredients: recipe.value.ingredients.map((ing: any) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit || '',
    })),
    steps: recipe.value.steps.map((step: any) => ({
      instruction: step.instruction,
      image: step.image || '',
    })),
    tagIds: recipe.value.tags?.map((t: any) => t.tag.id) || [],
    published: recipe.value.published,
  },
})

// Field bindings
const [title] = defineField('title')
const [description] = defineField('description')
const [image] = defineField('image')
const [prepTime] = defineField('prepTime')
const [cookTime] = defineField('cookTime')
const [servings] = defineField('servings')
const [difficulty] = defineField('difficulty')
const [categoryId] = defineField('categoryId')
const [tagIds] = defineField('tagIds')
const [published] = defineField('published')

// Field arrays
const { fields: ingredientFields, push: addIngredient, remove: removeIngredient } = useFieldArray('ingredients')
const { fields: stepFields, push: addStep, remove: removeStep } = useFieldArray('steps')

// Submit
const onSubmit = handleSubmit(async (formValues) => {
  try {
    const input = {
      title: formValues.title,
      description: formValues.description,
      image: formValues.image || null,
      prepTime: formValues.prepTime,
      cookTime: formValues.cookTime,
      servings: formValues.servings,
      difficulty: formValues.difficulty,
      categoryId: formValues.categoryId,
      ingredients: formValues.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit || null,
      })),
      steps: formValues.steps.map(step => ({
        instruction: step.instruction,
        image: step.image || null,
      })),
      tagIds: formValues.tagIds || [],
      published: formValues.published,
    }

    await mutate(UPDATE_RECIPE_MUTATION, { id: recipeId, input })

    toast.add({
      title: 'Recipe updated',
      description: 'Your changes have been saved.',
      color: 'success',
    })

    router.push('/admin/recipes')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'error',
    })
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Edit Recipe</h1>
        <p class="mt-1 text-gray-600">Update your recipe details</p>
      </div>
      <div class="flex gap-3">
        <UButton
          :to="`/recipes/${recipe.slug}`"
          icon="i-lucide-eye"
          color="neutral"
          variant="outline"
          target="_blank"
        >
          View
        </UButton>
        <UButton
          to="/admin/recipes"
          color="neutral"
          variant="outline"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          :loading="isSubmitting"
          @click="onSubmit"
        >
          Save Changes
        </UButton>
      </div>
    </div>

    <form @submit.prevent="onSubmit" class="space-y-8">
      <!-- Basic Info -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>

        <div class="grid gap-6">
          <UFormField label="Title" :error="errors.title" required>
            <UInput
              v-model="title"
              placeholder="Enter recipe title"
              size="lg"
            />
          </UFormField>

          <UFormField label="Description" :error="errors.description" required>
            <UTextarea
              v-model="description"
              placeholder="Describe your recipe..."
              :rows="4"
            />
          </UFormField>

          <UFormField label="Image URL" :error="errors.image">
            <UInput
              v-model="image"
              placeholder="https://example.com/image.jpg"
              icon="i-lucide-image"
            />
          </UFormField>

          <div class="grid sm:grid-cols-2 gap-6">
            <UFormField label="Category" :error="errors.categoryId" required>
              <USelectMenu
                v-model="categoryId"
                :items="categories"
                value-key="value"
                placeholder="Select category"
              />
            </UFormField>

            <UFormField label="Difficulty" :error="errors.difficulty" required>
              <USelectMenu
                v-model="difficulty"
                :items="difficultyOptions"
                value-key="value"
              />
            </UFormField>
          </div>

          <div class="grid sm:grid-cols-3 gap-6">
            <UFormField label="Prep Time (min)" :error="errors.prepTime" required>
              <UInput
                v-model.number="prepTime"
                type="number"
                min="1"
              />
            </UFormField>

            <UFormField label="Cook Time (min)" :error="errors.cookTime" required>
              <UInput
                v-model.number="cookTime"
                type="number"
                min="0"
              />
            </UFormField>

            <UFormField label="Servings" :error="errors.servings" required>
              <UInput
                v-model.number="servings"
                type="number"
                min="1"
              />
            </UFormField>
          </div>

          <UFormField label="Tags">
            <USelectMenu
              v-model="tagIds"
              :items="tags"
              value-key="value"
              multiple
              placeholder="Select tags"
            />
          </UFormField>
        </div>
      </div>

      <!-- Ingredients -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Ingredients</h2>
          <UButton
            icon="i-lucide-plus"
            color="primary"
            variant="outline"
            size="sm"
            @click="addIngredient({ name: '', amount: '', unit: '' })"
          >
            Add Ingredient
          </UButton>
        </div>

        <div class="space-y-4">
          <div
            v-for="(field, index) in ingredientFields"
            :key="field.key"
            class="flex gap-4 items-start"
          >
            <div class="flex-1 grid sm:grid-cols-3 gap-4">
              <UFormField :error="errors[`ingredients[${index}].name`]">
                <UInput
                  v-model="field.value.name"
                  placeholder="Ingredient name"
                />
              </UFormField>
              <UFormField :error="errors[`ingredients[${index}].amount`]">
                <UInput
                  v-model="field.value.amount"
                  placeholder="Amount"
                />
              </UFormField>
              <UFormField :error="errors[`ingredients[${index}].unit`]">
                <UInput
                  v-model="field.value.unit"
                  placeholder="Unit (optional)"
                />
              </UFormField>
            </div>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              :disabled="ingredientFields.length <= 1"
              @click="removeIngredient(index)"
            />
          </div>
        </div>
      </div>

      <!-- Steps -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Instructions</h2>
          <UButton
            icon="i-lucide-plus"
            color="primary"
            variant="outline"
            size="sm"
            @click="addStep({ instruction: '', image: '' })"
          >
            Add Step
          </UButton>
        </div>

        <div class="space-y-6">
          <div
            v-for="(field, index) in stepFields"
            :key="field.key"
            class="flex gap-4"
          >
            <div class="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
              {{ index + 1 }}
            </div>
            <div class="flex-1 space-y-3">
              <UFormField :error="errors[`steps[${index}].instruction`]">
                <UTextarea
                  v-model="field.value.instruction"
                  placeholder="Describe this step..."
                  :rows="3"
                />
              </UFormField>
              <UFormField :error="errors[`steps[${index}].image`]">
                <UInput
                  v-model="field.value.image"
                  placeholder="Step image URL (optional)"
                  icon="i-lucide-image"
                />
              </UFormField>
            </div>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              size="sm"
              :disabled="stepFields.length <= 1"
              @click="removeStep(index)"
            />
          </div>
        </div>
      </div>

      <!-- Publish Settings -->
      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Publish Settings</h2>

        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900">Publish Recipe</div>
            <div class="text-sm text-gray-500">Make this recipe visible to the public</div>
          </div>
          <USwitch v-model="published" />
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <UButton
          to="/admin/recipes"
          color="neutral"
          variant="outline"
          size="lg"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          color="primary"
          size="lg"
          :loading="isSubmitting"
        >
          Save Changes
        </UButton>
      </div>
    </form>
  </div>
</template>
