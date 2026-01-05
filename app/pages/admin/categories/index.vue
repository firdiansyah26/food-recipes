<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { query, mutate } = useGraphQL()
const toast = useToast()

// Queries
const CATEGORIES_QUERY = `
  query AdminCategories {
    categories {
      id
      name
      slug
      image
      recipesCount
    }
  }
`

const CREATE_CATEGORY_MUTATION = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
    }
  }
`

const UPDATE_CATEGORY_MUTATION = `
  mutation UpdateCategory($id: String!, $name: String, $image: String) {
    updateCategory(id: $id, name: $name, image: $image) {
      id
      name
    }
  }
`

const DELETE_CATEGORY_MUTATION = `
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id)
  }
`

// Fetch categories
const { data, refresh } = await useAsyncData('admin-categories-list', () =>
  query<{ categories: any[] }>(CATEGORIES_QUERY)
)

const categories = computed(() => data.value?.categories || [])

// Modal states
const createModal = ref(false)
const editModal = ref(false)
const deleteModal = ref(false)
const categoryToEdit = ref<any>(null)
const categoryToDelete = ref<any>(null)

// Form state
const newCategoryName = ref('')
const newCategoryImage = ref('')
const editCategoryName = ref('')
const editCategoryImage = ref('')
const isSubmitting = ref(false)

// Create
function openCreateModal() {
  newCategoryName.value = ''
  newCategoryImage.value = ''
  createModal.value = true
}

async function createCategory() {
  if (!newCategoryName.value.trim()) return

  isSubmitting.value = true
  try {
    await mutate(CREATE_CATEGORY_MUTATION, {
      input: {
        name: newCategoryName.value,
        image: newCategoryImage.value || null,
      },
    })
    toast.add({ title: 'Category created', color: 'success' })
    createModal.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

// Edit
function openEditModal(category: any) {
  categoryToEdit.value = category
  editCategoryName.value = category.name
  editCategoryImage.value = category.image || ''
  editModal.value = true
}

async function updateCategory() {
  if (!editCategoryName.value.trim() || !categoryToEdit.value) return

  isSubmitting.value = true
  try {
    await mutate(UPDATE_CATEGORY_MUTATION, {
      id: categoryToEdit.value.id,
      name: editCategoryName.value,
      image: editCategoryImage.value || null,
    })
    toast.add({ title: 'Category updated', color: 'success' })
    editModal.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

// Delete
function openDeleteModal(category: any) {
  categoryToDelete.value = category
  deleteModal.value = true
}

async function deleteCategory() {
  if (!categoryToDelete.value) return

  isSubmitting.value = true
  try {
    await mutate(DELETE_CATEGORY_MUTATION, { id: categoryToDelete.value.id })
    toast.add({ title: 'Category deleted', color: 'success' })
    deleteModal.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
        <p class="mt-1 text-gray-600">Manage recipe categories</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Add Category
      </UButton>
    </div>

    <!-- Categories Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="category in categories"
        :key="category.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <!-- Image -->
        <div class="aspect-video bg-gray-100 relative">
          <img
            v-if="category.image"
            :src="category.image"
            :alt="category.name"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
          >
            <UIcon name="i-lucide-image" class="w-12 h-12 text-gray-300" />
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
              <p class="text-sm text-gray-500">{{ category.recipesCount }} recipes</p>
            </div>
            <div class="flex gap-1">
              <UButton
                icon="i-lucide-edit"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="openEditModal(category)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                @click="openDeleteModal(category)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="categories.length === 0"
      class="text-center py-12 bg-white rounded-xl border border-gray-100"
    >
      <UIcon name="i-lucide-folder" class="w-12 h-12 text-gray-300 mx-auto" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">No categories</h3>
      <p class="mt-2 text-gray-500">Get started by creating a category.</p>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        class="mt-4"
        @click="openCreateModal"
      >
        Add Category
      </UButton>
    </div>

    <!-- Create Modal -->
    <UModal v-model:open="createModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Create Category</h3>
          <div class="space-y-4">
            <UFormField label="Name" required>
              <UInput
                v-model="newCategoryName"
                placeholder="Category name"
              />
            </UFormField>
            <UFormField label="Image URL">
              <UInput
                v-model="newCategoryImage"
                placeholder="https://example.com/image.jpg"
                icon="i-lucide-image"
              />
            </UFormField>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              @click="createModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isSubmitting"
              @click="createCategory"
            >
              Create
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Edit Modal -->
    <UModal v-model:open="editModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Edit Category</h3>
          <div class="space-y-4">
            <UFormField label="Name" required>
              <UInput
                v-model="editCategoryName"
                placeholder="Category name"
              />
            </UFormField>
            <UFormField label="Image URL">
              <UInput
                v-model="editCategoryImage"
                placeholder="https://example.com/image.jpg"
                icon="i-lucide-image"
              />
            </UFormField>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              @click="editModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isSubmitting"
              @click="updateCategory"
            >
              Save Changes
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Delete Modal -->
    <UModal v-model:open="deleteModal">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <UIcon name="i-lucide-trash-2" class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Delete Category</h3>
              <p class="text-gray-600">
                Are you sure you want to delete "{{ categoryToDelete?.name }}"?
              </p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <UButton
              color="neutral"
              variant="outline"
              @click="deleteModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              :loading="isSubmitting"
              @click="deleteCategory"
            >
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
