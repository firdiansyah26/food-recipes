import type { Ref } from 'vue'

interface GraphQLResponse<T> {
  data: T
  errors?: Array<{
    message: string
    extensions?: {
      code: string
    }
  }>
}

interface UseGraphQLOptions {
  immediate?: boolean
}

/**
 * Composable for making GraphQL requests
 */
export function useGraphQL() {
  const toast = useToast()

  /**
   * Execute a GraphQL query
   */
  async function query<T>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const token = useCookie('auth_token')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    try {
      const response = await $fetch<GraphQLResponse<T>>('/api/graphql', {
        method: 'POST',
        headers,
        body: {
          query: document,
          variables,
        },
      })

      if (response.errors && response.errors.length > 0) {
        const error = response.errors[0]

        // Handle specific error codes
        switch (error.extensions?.code) {
          case 'UNAUTHORIZED':
            // Clear token and redirect to login
            token.value = null
            await navigateTo('/auth/login')
            break
          case 'FORBIDDEN':
            toast.add({
              title: 'Access Denied',
              description: 'You do not have permission to perform this action.',
              color: 'error',
            })
            break
          default:
            toast.add({
              title: 'Error',
              description: error.message,
              color: 'error',
            })
        }

        throw new Error(error.message)
      }

      return response.data
    }
    catch (e: any) {
      if (e.data?.errors) {
        throw new Error(e.data.errors[0].message)
      }
      throw e
    }
  }

  /**
   * Execute a GraphQL mutation
   */
  async function mutate<T>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    return query<T>(document, variables)
  }

  return {
    query,
    mutate,
  }
}

/**
 * Composable for async GraphQL data fetching (with SSR support)
 */
export function useAsyncGraphQL<T>(
  key: string,
  document: string,
  variables?: Ref<Record<string, unknown>> | Record<string, unknown>,
  options?: UseGraphQLOptions,
) {
  const { query } = useGraphQL()

  return useAsyncData<T>(
    key,
    () => {
      const vars = isRef(variables) ? variables.value : variables
      return query<T>(document, vars)
    },
    {
      immediate: options?.immediate ?? true,
      watch: isRef(variables) ? [variables] : undefined,
    },
  )
}
