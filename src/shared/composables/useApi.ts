import axios from 'axios'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import router from '@/app/router'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    // Prevent simple-request CSRF — browsers do not auto-send this header,
    // so its presence signals an intentional XHR/fetch call from our app.
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Track whether a token refresh is already in progress to prevent
// multiple concurrent refresh calls when parallel requests all 401.
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function notifyRefreshSubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const auth = useAuthStore()

    // If no refresh token, go straight to login (device revoked / never logged in)
    if (!auth.refreshToken) {
      auth.logout()
      await router.push({ name: 'Login' })
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(api(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      await auth.refresh()
      notifyRefreshSubscribers(auth.token!)
      originalRequest.headers.Authorization = `Bearer ${auth.token}`
      return api(originalRequest)
    } catch {
      // Refresh failed — device revoked or refresh token expired
      auth.logout()
      await router.push({ name: 'Login' })
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)
