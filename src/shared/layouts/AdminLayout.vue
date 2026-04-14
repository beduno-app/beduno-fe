<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()

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
          bed!OK
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
      </nav>
      <div class="sidebar-footer">
        <div
          v-if="auth.user"
          class="user-info"
        >
          <span class="user-name">{{ auth.user.firstName }} {{ auth.user.lastName }}</span>
          <span class="user-role">{{ auth.user.role }}</span>
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
  &.router-link-active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
}

.sidebar-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  margin-bottom: 0.75rem;
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
