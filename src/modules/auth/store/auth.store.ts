import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { AuthUser, LoginPayload } from '../types/auth.types'
import { authApi } from '../api/auth.api'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const user = ref<AuthUser | null>(null)

    const isAuthenticated = computed(() => !!token.value)
    const userRole = computed(() => user.value?.role ?? null)

    async function login(payload: LoginPayload) {
      const response = await authApi.login(payload)
      token.value = response.token
      refreshToken.value = response.refreshToken
      user.value = response.user
    }

    async function refresh() {
      if (!refreshToken.value) throw new Error('No refresh token')
      const response = await authApi.refresh(refreshToken.value)
      token.value = response.token
    }

    function logout() {
      token.value = null
      refreshToken.value = null
      user.value = null
    }

    return { token, refreshToken, user, isAuthenticated, userRole, login, refresh, logout }
  },
  {
    persist: {
      pick: ['token', 'refreshToken', 'user'],
    },
  },
)
