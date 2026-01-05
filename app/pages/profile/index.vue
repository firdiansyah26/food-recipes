<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

definePageMeta({
  layout: 'default',
})

const { user, isAuthenticated, getSessions, logoutAll } = useAuth()
const { mutate } = useGraphQL()
const toast = useToast()

// Redirect if not authenticated
if (!isAuthenticated.value) {
  navigateTo('/auth/login?redirect=/profile')
}

// Update profile mutation
const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($name: String, $avatar: String) {
    updateProfile(name: $name, avatar: $avatar) {
      id
      name
      avatar
    }
  }
`

const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`

// Profile form
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

const { handleSubmit: handleProfileSubmit, errors: profileErrors, defineField: defineProfileField, isSubmitting: isProfileSubmitting } = useForm({
  validationSchema: toTypedSchema(profileSchema),
  initialValues: {
    name: user.value?.name || '',
    avatar: user.value?.avatar || '',
  },
})

const [profileName] = defineProfileField('name')
const [profileAvatar] = defineProfileField('avatar')

const onProfileSubmit = handleProfileSubmit(async (values) => {
  try {
    await mutate(UPDATE_PROFILE_MUTATION, {
      name: values.name,
      avatar: values.avatar || null,
    })
    toast.add({ title: 'Profile updated', color: 'success' })
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
})

// Password form
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

const { handleSubmit: handlePasswordSubmit, errors: passwordErrors, defineField: definePasswordField, isSubmitting: isPasswordSubmitting, resetForm: resetPasswordForm } = useForm({
  validationSchema: toTypedSchema(passwordSchema),
})

const [currentPassword] = definePasswordField('currentPassword')
const [newPassword] = definePasswordField('newPassword')
const [confirmPassword] = definePasswordField('confirmPassword')

const onPasswordSubmit = handlePasswordSubmit(async (values) => {
  try {
    await mutate(CHANGE_PASSWORD_MUTATION, {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
    toast.add({
      title: 'Password changed',
      description: 'You will need to log in again.',
      color: 'success',
    })
    resetPasswordForm()
  } catch (error: any) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  }
})

// Sessions
const sessions = ref<any[]>([])
const loadingSessions = ref(false)

async function loadSessions() {
  loadingSessions.value = true
  sessions.value = await getSessions()
  loadingSessions.value = false
}

onMounted(() => {
  loadSessions()
})

async function handleLogoutAll() {
  await logoutAll()
}

// Tabs
const activeTab = ref('profile')
const tabs = [
  { value: 'profile', label: 'Profile', icon: 'i-lucide-user' },
  { value: 'security', label: 'Security', icon: 'i-lucide-shield' },
  { value: 'sessions', label: 'Sessions', icon: 'i-lucide-smartphone' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="container mx-auto px-4 lg:px-8 py-8">
        <div class="flex items-center gap-4">
          <UAvatar
            :src="user?.avatar || undefined"
            :alt="user?.name"
            size="xl"
          />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ user?.name }}</h1>
            <p class="text-gray-600">{{ user?.email }}</p>
            <UBadge
              :color="user?.role === 'ADMIN' ? 'primary' : 'neutral'"
              variant="subtle"
              class="mt-1"
            >
              {{ user?.role }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Tabs -->
        <aside class="lg:w-64 flex-shrink-0">
          <nav class="bg-white rounded-xl p-2 shadow-sm border border-gray-100 space-y-1">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
              :class="[
                activeTab === tab.value
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50',
              ]"
              @click="activeTab = tab.value"
            >
              <UIcon :name="tab.icon" class="w-5 h-5" />
              <span class="font-medium">{{ tab.label }}</span>
            </button>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="flex-1">
          <!-- Profile Tab -->
          <div v-show="activeTab === 'profile'" class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h2>

            <form @submit.prevent="onProfileSubmit" class="space-y-6 max-w-md">
              <UFormField label="Full Name" :error="profileErrors.name">
                <UInput
                  v-model="profileName"
                  placeholder="Your name"
                />
              </UFormField>

              <UFormField label="Avatar URL" :error="profileErrors.avatar">
                <UInput
                  v-model="profileAvatar"
                  placeholder="https://example.com/avatar.jpg"
                  icon="i-lucide-image"
                />
              </UFormField>

              <UFormField label="Email">
                <UInput
                  :model-value="user?.email"
                  disabled
                />
                <template #hint>
                  Email cannot be changed
                </template>
              </UFormField>

              <UButton
                type="submit"
                color="primary"
                :loading="isProfileSubmitting"
              >
                Save Changes
              </UButton>
            </form>
          </div>

          <!-- Security Tab -->
          <div v-show="activeTab === 'security'" class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>

            <form @submit.prevent="onPasswordSubmit" class="space-y-6 max-w-md">
              <UFormField label="Current Password" :error="passwordErrors.currentPassword">
                <UInput
                  v-model="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                />
              </UFormField>

              <UFormField label="New Password" :error="passwordErrors.newPassword">
                <UInput
                  v-model="newPassword"
                  type="password"
                  placeholder="Enter new password"
                />
              </UFormField>

              <UFormField label="Confirm New Password" :error="passwordErrors.confirmPassword">
                <UInput
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                />
              </UFormField>

              <UButton
                type="submit"
                color="primary"
                :loading="isPasswordSubmitting"
              >
                Change Password
              </UButton>
            </form>
          </div>

          <!-- Sessions Tab -->
          <div v-show="activeTab === 'sessions'" class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Active Sessions</h2>
                <p class="text-sm text-gray-500">Manage your active login sessions</p>
              </div>
              <UButton
                color="error"
                variant="outline"
                @click="handleLogoutAll"
              >
                Logout All Devices
              </UButton>
            </div>

            <div v-if="loadingSessions" class="py-8 text-center">
              <UIcon name="i-lucide-loader-2" class="w-8 h-8 text-gray-400 animate-spin mx-auto" />
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="session in sessions"
                :key="session.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <UIcon name="i-lucide-monitor" class="w-8 h-8 text-gray-400" />
                  <div>
                    <div class="font-medium text-gray-900 text-sm">
                      {{ session.userAgent || 'Unknown Device' }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ session.ipAddress || 'Unknown IP' }}
                    </div>
                  </div>
                </div>
                <div class="text-right text-sm text-gray-500">
                  <div>Created: {{ new Date(session.createdAt).toLocaleDateString() }}</div>
                  <div>Expires: {{ new Date(session.expiresAt).toLocaleDateString() }}</div>
                </div>
              </div>

              <p
                v-if="sessions.length === 0"
                class="text-center text-gray-500 py-4"
              >
                No active sessions found
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
