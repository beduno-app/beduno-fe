/**
 * Idle session timeout — tracks user activity and auto-logs out after
 * a configurable period of inactivity, with a countdown warning.
 *
 * Usage:
 *   const { isWarning, secondsRemaining, reset } = useIdleTimeout()
 *
 * Mount once at app root (App.vue) while user is authenticated.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import router from '@/app/router'

// Default: 30 min idle → 2 min warning → logout at 32 min total inactivity
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000
export const WARNING_BEFORE_MS = 2 * 60 * 1000

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

export function useIdleTimeout(
  idleMs = IDLE_TIMEOUT_MS,
  warnBeforeMs = WARNING_BEFORE_MS,
) {
  const isWarning = ref(false)
  const secondsRemaining = ref(0)

  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let warnTimer: ReturnType<typeof setTimeout> | null = null
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  function clearTimers() {
    if (idleTimer) clearTimeout(idleTimer)
    if (warnTimer) clearTimeout(warnTimer)
    if (countdownInterval) clearInterval(countdownInterval)
    idleTimer = null
    warnTimer = null
    countdownInterval = null
  }

  async function logout() {
    clearTimers()
    isWarning.value = false
    const auth = useAuthStore()
    auth.logout()
    await router.push({ name: 'Login' })
  }

  function startCountdown(durationMs: number) {
    secondsRemaining.value = Math.round(durationMs / 1000)
    countdownInterval = setInterval(() => {
      secondsRemaining.value--
      if (secondsRemaining.value <= 0) {
        if (countdownInterval) clearInterval(countdownInterval)
      }
    }, 1000)
  }

  function reset() {
    clearTimers()
    isWarning.value = false

    // Schedule the warning
    warnTimer = setTimeout(() => {
      isWarning.value = true
      startCountdown(warnBeforeMs)

      // Schedule the final logout after the warning period
      idleTimer = setTimeout(() => {
        logout()
      }, warnBeforeMs)
    }, idleMs)
  }

  function onActivity() {
    if (!isWarning.value) {
      reset()
    }
  }

  onMounted(() => {
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }))
    reset()
  })

  onUnmounted(() => {
    clearTimers()
    ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity))
  })

  return {
    isWarning,
    secondsRemaining,
    reset,
  }
}
