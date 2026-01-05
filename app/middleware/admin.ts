export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
