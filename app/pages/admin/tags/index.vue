<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { query, mutate } = useGraphQL()
const toast = useToast()

// Queries
const TAGS_QUERY = `
  query AdminTags {
    tags {
      id
      name
      slug
      recipesCount
    }
  }
`

const CREATE_TAG_MUTATION = `
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      name
    }
  }
`

const DELETE_TAG_MUTATION = `
  mutation DeleteTag($id: String!) {
    deleteTag(id: $id)
  }
`

// Fetch tags
const { data, refresh } = await useAsyncData('admin-tags-list', () =>
  query<{ tags: any[] }>(TAGS_QUERY)
)

const tags = computed(() => data.value?.tags || [])

// Modal states
const createModal = ref(false)
const deleteModal = ref(false)
const tagToDelete = ref<any>(null)

// Form state
const newTagName = ref('')
const isSubmitting = ref(false)

// Create
function openCreateModal() {
  newTagName.value = ''
  createModal.value = true
}

async function createTag() {
  if (!newTagName.value.trim()) return

  isSubmitting.value = true
  try {
    await mutate(CREATE_TAG_MUTATION, {
      input: { name: newTagName.value },
    })
    toast.add({ title: 'Tag created', color: 'success' })
    createModal.value = false
    await refresh()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

// Delete
function openDeleteModal(tag: any) {
  tagToDelete.value = tag
  deleteModal.value = true
}

async function deleteTag() {
  if (!tagToDelete.value) return

  isSubmitting.value = true
  try {
    await mutate(DELETE_TAG_MUTATION, { id: tagToDelete.value.id })
    toast.add({ title: 'Tag deleted', color: 'success' })
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
        <h1 class="text-2xl font-bold text-gray-900">Tags</h1>
        <p class="mt-1 text-gray-600">Manage recipe tags</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
      >
        Add Tag
      </UButton>
    </div>

    <!-- Tags Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Slug
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipes
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="tag in tags"
            :key="tag.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-tag" class="w-4 h-4 text-gray-400" />
                <span class="font-medium text-gray-900">{{ tag.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ tag.slug }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ tag.recipesCount }}
            </td>
            <td class="px-6 py-4 text-right">
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                @click="openDeleteModal(tag)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div
        v-if="tags.length === 0"
        class="p-12 text-center"
      >
        <UIcon name="i-lucide-tags" class="w-12 h-12 text-gray-300 mx-auto" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No tags</h3>
        <p class="mt-2 text-gray-500">Get started by creating a tag.</p>
        <UButton
          icon="i-lucide-plus"
          color="primary"
          class="mt-4"
          @click="openCreateModal"
        >
          Add Tag
        </UButton>
      </div>
    </div>

    <!-- Create Modal -->
    <UModal v-model:open="createModal">
      <template #content>
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Create Tag</h3>
          <UFormField label="Name" required>
            <UInput
              v-model="newTagName"
              placeholder="Tag name"
            />
          </UFormField>
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
              @click="createTag"
            >
              Create
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
              <h3 class="text-lg font-semibold text-gray-900">Delete Tag</h3>
              <p class="text-gray-600">
                Are you sure you want to delete "{{ tagToDelete?.name }}"?
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
              @click="deleteTag"
            >
              Delete
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
