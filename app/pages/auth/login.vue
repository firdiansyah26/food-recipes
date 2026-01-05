<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema, type LoginFormData } from '~/schemas/auth'

definePageMeta({
  layout: 'default',
})

const { login, isAuthenticated } = useAuth()
const router = useRouter()
const route = useRoute()

// Redirect if already authenticated
if (isAuthenticated.value) {
  navigateTo('/')
}

const { handleSubmit, errors, defineField, isSubmitting } = useForm<LoginFormData>({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: '',
    password: '',
  },
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  const success = await login(values.email, values.password)
  if (success) {
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  }
})
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 font-serif">Welcome Back</h1>
        <p class="mt-2 text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      <!-- Form Card -->
      <UCard>
        <form @submit="onSubmit" class="space-y-6">
          <!-- Email -->
          <UFormField label="Email" :error="errors.email">
            <UInput
              v-model="email"
              v-bind="emailAttrs"
              type="email"
              placeholder="you@example.com"
              icon="i-lucide-mail"
              size="lg"
            />
          </UFormField>

          <!-- Password -->
          <UFormField label="Password" :error="errors.password">
            <UInput
              v-model="password"
              v-bind="passwordAttrs"
              type="password"
              placeholder="Enter your password"
              icon="i-lucide-lock"
              size="lg"
            />
          </UFormField>

          <!-- Forgot Password -->
          <div class="flex justify-end">
            <NuxtLink
              to="/auth/forgot-password"
              class="text-sm text-primary-500 hover:text-primary-600"
            >
              Forgot password?
            </NuxtLink>
          </div>

          <!-- Submit -->
          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="isSubmitting"
          >
            Sign In
          </UButton>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <!-- Social Login -->
        <div class="grid grid-cols-2 gap-3">
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            disabled
          >
            <UIcon name="i-simple-icons-google" class="w-5 h-5 mr-2" />
            Google
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            disabled
          >
            <UIcon name="i-simple-icons-github" class="w-5 h-5 mr-2" />
            GitHub
          </UButton>
        </div>
      </UCard>

      <!-- Register Link -->
      <p class="mt-6 text-center text-gray-600">
        Don't have an account?
        <NuxtLink to="/auth/register" class="text-primary-500 hover:text-primary-600 font-medium">
          Sign up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
