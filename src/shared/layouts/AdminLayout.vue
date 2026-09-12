<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ToastNotifications } from '@/shared/components'
import { adminApi } from '@/modules/admin/api/admin.api'
import type { AppLanguage } from '@/modules/auth/types/auth.types'

const LANGUAGES: { code: string; label: string; apiCode: AppLanguage }[] = [
  { code: 'pl', label: 'PL', apiCode: 'PL' },
  { code: 'en', label: 'EN', apiCode: 'EN' },
  { code: 'de', label: 'DE', apiCode: 'DE' },
  { code: 'ua', label: 'UA', apiCode: 'UA' },
  { code: 'ru', label: 'RU', apiCode: 'RU' },
]

const auth = useAuthStore()
const router = useRouter()
const { t, locale } = useI18n()

function setLanguage(lang: (typeof LANGUAGES)[number]) {
  locale.value = lang.code
  adminApi.updateMyLanguage(lang.apiCode).catch(() => undefined)
}

async function handleLogout() {
  auth.logout()
  await router.push({ name: 'Login' })
}
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">
          {{ t('common.appName') }}
        </h1>
      </div>
      <nav class="sidebar-nav">
        <RouterLink
          to="/"
          class="nav-item"
        >
          {{ t('nav.dashboard') }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'AGENCY_ADMIN'"
          to="/users"
          class="nav-item"
        >
          {{
            t('nav.users')
          }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'AGENCY_ADMIN'"
          to="/roles"
          class="nav-item"
        >
          {{
            t('nav.roles')
          }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'AGENCY_ADMIN' || auth.userRole === 'AGENCY_PLANNER'"
          to="/workers"
          class="nav-item"
        >
          {{
            t('nav.workers')
          }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'AGENCY_ADMIN' || auth.userRole === 'AGENCY_PLANNER'"
          to="/properties"
          class="nav-item"
        >
          {{
            t('nav.properties')
          }}
        </RouterLink>
        <RouterLink
          to="/stays"
          class="nav-item"
        >
          {{
            t('nav.stays')
          }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'PROPERTY_ADMIN' || auth.userRole === 'FRONT_DESK'"
          to="/arrivals"
          class="nav-item"
        >
          {{
            t('nav.arrivals')
          }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'PROPERTY_ADMIN' || auth.userRole === 'FRONT_DESK'"
          to="/in-house"
          class="nav-item"
        >
          {{
            t('nav.occupancy')
          }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'PROPERTY_ADMIN' || auth.userRole === 'FRONT_DESK'"
          to="/inspection"
          class="nav-item"
        >
          {{
            t('nav.inspection')
          }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'AGENCY_ADMIN'"
          to="/audit"
          class="nav-item"
        >
          {{ t('nav.audit') }}
        </RouterLink>
        <RouterLink
          v-if="auth.userRole === 'AGENCY_ADMIN' || auth.userRole === 'AGENCY_PLANNER'"
          to="/exports"
          class="nav-item"
        >
          {{ t('nav.exports') }}
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <div
          v-if="auth.user"
          class="user-info"
        >
          <span class="user-name">{{ auth.user.firstName }} {{ auth.user.lastName }}</span>
          <span class="user-role">{{ auth.user.role }}</span>
        </div>
        <div class="lang-switcher">
          <button
            v-for="lang in LANGUAGES"
            :key="lang.code"
            class="lang-btn"
            :class="{ active: locale === lang.code }"
            :aria-label="lang.label"
            @click="setLanguage(lang)"
          >
            {{ lang.label }}
          </button>
        </div>
        <button
          class="logout-btn"
          @click="handleLogout"
        >
          {{ t('auth.logout') }}
        </button>
      </div>
    </aside>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
  <ToastNotifications />
</template>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.sidebar-header {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e66e00;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding-top: 1rem;
}

.nav-item {
  display: block;
  padding: 0.625rem 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 0.375rem;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;

  &:hover,
  &.router-link-exact-active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
}

.sidebar-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.user-info {
  margin-bottom: 0;
}

.lang-switcher {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.lang-btn {
  padding: 0.2rem 0.45rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1.4;

  &.active {
    background: #e66e00;
    border-color: #e66e00;
    color: #fff;
  }

  &:hover:not(.active) {
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

.user-name {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-role {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.logout-btn {
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  background: #f5f5f5;
  overflow-y: auto;
}
</style>
