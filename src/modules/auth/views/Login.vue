<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.store'
import { useI18n } from 'vue-i18n'

const LANGUAGES = [
  { code: 'pl', label: 'PL' },
  { code: 'en', label: 'EN' },
  { code: 'de', label: 'DE' },
  { code: 'ua', label: 'UA' },
  { code: 'ru', label: 'RU' },
] as const

const auth = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

function setLanguage(code: string) {
  locale.value = code
}

async function handleLogin() {
  error.value = ''
  isLoading.value = true

  try {
    await auth.login({ email: email.value, password: password.value })
    if (auth.user?.language) {
      locale.value = auth.user.language
    }
    await router.push({ name: 'Dashboard' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="language-bar">
      <button
        v-for="lang in LANGUAGES"
        :key="lang.code"
        class="lang-btn"
        :class="{ active: locale === lang.code }"
        @click="setLanguage(lang.code)"
      >
        {{ lang.label }}
      </button>
    </div>
    <div class="login-card">
      <h1 class="login-logo">bed!OK</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">{{ t('auth.email') }}</label>
          <input id="email" v-model="email" type="email" required autocomplete="username" />
        </div>
        <div class="form-group">
          <label for="password">{{ t('auth.password') }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
          />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? t('common.loading') : t('auth.login') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.language-bar {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.25rem;
}

.lang-btn {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: #fff;
  color: #666;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;

  &.active {
    background: #e66e00;
    border-color: #e66e00;
    color: #fff;
  }

  &:hover:not(.active) {
    background: #f0f0f0;
  }
}

.login-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.login-logo {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #e66e00;
  margin: 0 0 2rem;
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.375rem;
    color: #333;
  }

  input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #e66e00;
      box-shadow: 0 0 0 2px rgba(230, 110, 0, 0.2);
    }
  }
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.login-btn {
  width: 100%;
  padding: 0.625rem;
  background: #e66e00;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #d46300;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
