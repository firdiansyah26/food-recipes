interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  avatar: string | null
}

interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// GraphQL Mutations
const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        email
        name
        role
        avatar
      }
    }
  }
`

const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        email
        name
        role
        avatar
      }
    }
  }
`

const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      expiresIn
    }
  }
`

const LOGOUT_MUTATION = `
  mutation Logout($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`

const LOGOUT_ALL_MUTATION = `
  mutation LogoutAll {
    logoutAll
  }
`

const ME_QUERY = `
  query Me {
    me {
      id
      email
      name
      role
      avatar
    }
  }
`

const MY_SESSIONS_QUERY = `
  query MySessions {
    mySessions {
      id
      userAgent
      ipAddress
      createdAt
      expiresAt
    }
  }
`

// Token refresh timer
let refreshTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Composable for authentication with refresh token support
 */
export function useAuth() {
  const toast = useToast()

  // State
  const user = useState<User | null>('auth_user', () => null)
  const isRefreshing = useState<boolean>('auth_refreshing', () => false)

  // Cookies for tokens (httpOnly would be better but requires server-side handling)
  const accessToken = useCookie('access_token', {
    maxAge: 60 * 15, // 15 minutes
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const refreshToken = useCookie('refresh_token', {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  /**
   * Make authenticated GraphQL request
   */
  async function authFetch<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (accessToken.value) {
      headers.Authorization = `Bearer ${accessToken.value}`
    }

    const response = await $fetch<{ data: T, errors?: Array<{ message: string }> }>('/api/graphql', {
      method: 'POST',
      headers,
      body: { query, variables },
    })

    if (response.errors?.length) {
      throw new Error(response.errors[0].message)
    }

    return response.data
  }

  /**
   * Schedule token refresh before expiry
   */
  function scheduleTokenRefresh(expiresIn: number) {
    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer)
    }

    // Refresh 1 minute before expiry (or at 80% of lifetime)
    const refreshTime = Math.max((expiresIn * 0.8) * 1000, (expiresIn - 60) * 1000)

    refreshTimer = setTimeout(async () => {
      await silentRefresh()
    }, refreshTime)
  }

  /**
   * Silently refresh the access token
   */
  async function silentRefresh(): Promise<boolean> {
    if (!refreshToken.value || isRefreshing.value) {
      return false
    }

    isRefreshing.value = true

    try {
      const data = await $fetch<{
        data: { refreshToken: AuthTokens | null }
        errors?: Array<{ message: string }>
      }>('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          query: REFRESH_TOKEN_MUTATION,
          variables: { refreshToken: refreshToken.value },
        },
      })

      if (data.errors?.length || !data.data.refreshToken) {
        // Refresh failed - clear tokens and redirect to login
        await clearAuth()
        return false
      }

      // Update tokens
      const tokens = data.data.refreshToken
      accessToken.value = tokens.accessToken
      refreshToken.value = tokens.refreshToken

      // Schedule next refresh
      scheduleTokenRefresh(tokens.expiresIn)

      return true
    }
    catch (error) {
      console.error('Token refresh failed:', error)
      await clearAuth()
      return false
    }
    finally {
      isRefreshing.value = false
    }
  }

  /**
   * Store tokens and set up refresh
   */
  function storeTokens(tokens: AuthTokens) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    scheduleTokenRefresh(tokens.expiresIn)
  }

  /**
   * Clear all auth state
   */
  async function clearAuth() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    accessToken.value = null
    refreshToken.value = null
    user.value = null
  }

  /**
   * Login user
   */
  async function login(email: string, password: string): Promise<boolean> {
    try {
      const data = await authFetch<{
        login: AuthTokens & { user: User }
      }>(LOGIN_MUTATION, {
        input: { email, password },
      })

      // Store tokens
      storeTokens(data.login)

      // Set user
      user.value = data.login.user

      toast.add({
        title: 'Welcome back!',
        description: `Hello, ${data.login.user.name}`,
        color: 'success',
      })

      return true
    }
    catch (e: any) {
      toast.add({
        title: 'Login Failed',
        description: e.message || 'Invalid email or password',
        color: 'error',
      })
      return false
    }
  }

  /**
   * Register new user
   */
  async function register(
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      const data = await authFetch<{
        register: AuthTokens & { user: User }
      }>(REGISTER_MUTATION, {
        input: { name, email, password },
      })

      // Store tokens
      storeTokens(data.register)

      // Set user
      user.value = data.register.user

      toast.add({
        title: 'Welcome!',
        description: 'Your account has been created successfully.',
        color: 'success',
      })

      return true
    }
    catch (e: any) {
      toast.add({
        title: 'Registration Failed',
        description: e.message || 'Could not create account',
        color: 'error',
      })
      return false
    }
  }

  /**
   * Logout user
   */
  async function logout() {
    try {
      if (refreshToken.value) {
        await authFetch(LOGOUT_MUTATION, {
          refreshToken: refreshToken.value,
        })
      }
    }
    catch {
      // Ignore errors - just clear local state
    }

    await clearAuth()

    toast.add({
      title: 'Goodbye!',
      description: 'You have been logged out.',
      color: 'info',
    })

    navigateTo('/')
  }

  /**
   * Logout from all devices
   */
  async function logoutAll(): Promise<number> {
    try {
      const data = await authFetch<{ logoutAll: number }>(LOGOUT_ALL_MUTATION)

      await clearAuth()

      toast.add({
        title: 'Logged out everywhere',
        description: `${data.logoutAll} sessions have been revoked.`,
        color: 'info',
      })

      navigateTo('/auth/login')

      return data.logoutAll
    }
    catch (e: any) {
      toast.add({
        title: 'Error',
        description: e.message || 'Could not logout from all devices',
        color: 'error',
      })
      return 0
    }
  }

  /**
   * Fetch current user (for initial load or refresh)
   */
  async function fetchUser(): Promise<User | null> {
    // First try to refresh token if we have one but no access token
    if (!accessToken.value && refreshToken.value) {
      const refreshed = await silentRefresh()
      if (!refreshed) {
        return null
      }
    }

    if (!accessToken.value) {
      user.value = null
      return null
    }

    try {
      const data = await authFetch<{ me: User | null }>(ME_QUERY)
      user.value = data.me

      // If we have a valid user, make sure refresh is scheduled
      if (data.me && refreshToken.value) {
        scheduleTokenRefresh(900) // Default 15 min
      }

      return data.me
    }
    catch {
      // Token might be expired, try to refresh
      const refreshed = await silentRefresh()
      if (refreshed) {
        // Retry fetching user
        try {
          const data = await authFetch<{ me: User | null }>(ME_QUERY)
          user.value = data.me
          return data.me
        }
        catch {
          await clearAuth()
          return null
        }
      }

      await clearAuth()
      return null
    }
  }

  /**
   * Get active sessions
   */
  async function getSessions() {
    try {
      const data = await authFetch<{
        mySessions: Array<{
          id: string
          userAgent: string | null
          ipAddress: string | null
          createdAt: string
          expiresAt: string
        }>
      }>(MY_SESSIONS_QUERY)

      return data.mySessions
    }
    catch {
      return []
    }
  }

  /**
   * Check if user has required role
   */
  function hasRole(role: 'USER' | 'ADMIN'): boolean {
    if (!user.value) return false
    if (role === 'USER') return true
    return user.value.role === role
  }

  /**
   * Get access token for external use
   */
  function getAccessToken(): string | null {
    return accessToken.value
  }

  /**
   * Manual token refresh (exposed for edge cases)
   */
  async function refreshAccessToken(): Promise<boolean> {
    return silentRefresh()
  }

  return {
    // State
    user: readonly(user),
    isAuthenticated,
    isAdmin,
    isRefreshing: readonly(isRefreshing),

    // Actions
    login,
    register,
    logout,
    logoutAll,
    fetchUser,
    getSessions,
    hasRole,
    getAccessToken,
    refreshAccessToken,
  }
}
