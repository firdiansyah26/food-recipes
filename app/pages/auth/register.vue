<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { registerSchema, type RegisterFormData } from '~/schemas/auth'

definePageMeta({
  layout: 'default',
})

const { register, isAuthenticated } = useAuth()
const router = useRouter()

// Redirect if already authenticated
if (isAuthenticated.value) {
  navigateTo('/')
}

const { handleSubmit, errors, defineField, isSubmitting } = useForm<RegisterFormData>({
  validationSchema: toTypedSchema(registerSchema),
  initialValues: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
})

const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

const onSubmit = handleSubmit(async (values) => {
  const success = await register(values.name, values.email, values.password)
  if (success) {
    router.push('/')
  }
})
</script>

<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 font-serif">Create Account</h1>
        <p class="mt-2 text-gray-600">
          Join our community of food lovers
        </p>
      </div>

      <!-- Form Card -->
      <UCard>
        <form @submit="onSubmit" class="space-y-5">
          <!-- Name -->
          <UFormField label="Full Name" :error="errors.name">
            <UInput
              v-model="name"
              v-bind="nameAttrs"
              type="text"
              placeholder="John Doe"
              icon="i-lucide-user"
              size="lg"
            />
          </UFormField>

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
              placeholder="Create a password"
              icon="i-lucide-lock"
              size="lg"
            />
          </UFormField>

          <!-- Confirm Password -->
          <UFormField label="Confirm Password" :error="errors.confirmPassword">
            <UInput
              v-model="confirmPassword"
              v-bind="confirmPasswordAttrs"
              type="password"
              placeholder="Confirm your password"
              icon="i-lucide-lock"
              size="lg"
            />
          </UFormField>

          <!-- Terms -->
          <p class="text-sm text-gray-500">
            By creating an account, you agree to our
            <NuxtLink to="/terms" class="text-primary-500 hover:underline">Terms of Service</NuxtLink>
            and
            <NuxtLink to="/privacy" class="text-primary-500 hover:underline">Privacy Policy</NuxtLink>.
          </p>

          <!-- Submit -->
          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="isSubmitting"
          >
            Create Account
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

      <!-- Login Link -->
      <p class="mt-6 text-center text-gray-600">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-primary-500 hover:text-primary-600 font-medium">
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
