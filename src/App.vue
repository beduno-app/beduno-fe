<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useIdleTimeout } from '@/shared/composables/useIdleTimeout'
import { useToast } from '@/shared/composables/useToast'
import ToastNotifications from '@/shared/components/ToastNotifications.vue'

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToast()

// Only run idle timeout when logged in
const { isWarning, secondsRemaining } = useIdleTimeout()

watch(isWarning, (warning) => {
  if (warning && auth.isAuthenticated) {
    toast.warning(t('auth.sessionExpiringSoon', { seconds: secondsRemaining.value }), secondsRemaining.value * 1000)
  }
})
</script>

<template>
  <RouterView />
  <ToastNotifications />
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c2c2c;
}
</style>
