<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  auth.logout()
  await router.push({ name: 'Login' })
}
</script>

<template>
  <div class="ops-layout">
    <header class="ops-header">
      <span class="ops-logo">bed!OK</span>
      <div class="ops-header-right">
        <span v-if="auth.user" class="ops-user">{{ auth.user.name }}</span>
        <button class="ops-logout" @click="handleLogout">{{ t('auth.logout') }}</button>
      </div>
    </header>
    <main class="ops-content">
      <RouterView />
    </main>
    <nav class="ops-bottom-nav">
      <RouterLink to="/ops/arrivals" class="ops-nav-item">
        <span class="ops-nav-icon">&#8595;</span>
        <span class="ops-nav-label">{{ t('nav.arrivals') }}</span>
      </RouterLink>
      <RouterLink to="/ops/occupancy" class="ops-nav-item">
        <span class="ops-nav-icon">&#9632;</span>
        <span class="ops-nav-label">{{ t('nav.occupancy') }}</span>
      </RouterLink>
      <RouterLink to="/ops/inspection" class="ops-nav-item">
        <span class="ops-nav-icon">&#10003;</span>
        <span class="ops-nav-label">{{ t('nav.inspection') }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.ops-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.ops-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #1a1a2e;
  color: #fff;
}

.ops-logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e66e00;
}

.ops-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ops-user {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.ops-logout {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
}

.ops-content {
  flex: 1;
  padding: 1rem;
  background: #f5f5f5;
  overflow-y: auto;
  padding-bottom: 4.5rem;
}

.ops-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.ops-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.625rem 0;
  text-decoration: none;
  color: #9ca3af;
  font-size: 0.7rem;
  gap: 0.25rem;
  transition: color 0.15s;

  &.router-link-active {
    color: #e66e00;
  }

  &:hover {
    color: #e66e00;
  }
}

.ops-nav-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.ops-nav-label {
  font-weight: 600;
}
</style>
