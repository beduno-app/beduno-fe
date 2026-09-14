<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../store/auth.store'
import { useDashboardStore } from '../store/dashboard.store'

const auth = useAuthStore()
const dashboard = useDashboardStore()
const { t } = useI18n()

onMounted(() => {
  dashboard.fetchSummary()
})
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <h2>{{ t('nav.dashboard') }}</h2>
      <p
        v-if="auth.user"
        class="greeting"
      >
        {{ t('dashboard.greeting', { name: `${auth.user.firstName} ${auth.user.lastName}` }) }}
      </p>
    </div>

    <div
      v-if="dashboard.isLoading && !dashboard.summary"
      class="loading"
    >
      {{ t('common.loading') }}
    </div>
    <div
      v-else-if="dashboard.error"
      class="error"
    >
      {{ dashboard.error }}
    </div>
    <div
      v-else-if="dashboard.summary"
      class="summary-grid"
    >
      <div class="summary-card">
        <span class="summary-label">{{ t('dashboard.properties') }}</span>
        <span class="summary-value">{{ dashboard.summary.propertiesTotal }}</span>
        <span class="summary-sub">
          {{ dashboard.summary.propertiesActive }} {{ t('dashboard.propertiesActive') }}
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-label">{{ t('dashboard.workers') }}</span>
        <span class="summary-value">{{ dashboard.summary.workersTotal }}</span>
        <span class="summary-sub">
          {{ dashboard.summary.workersActive }} {{ t('dashboard.workersActive') }}
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-label">{{ t('dashboard.currentlyHoused') }}</span>
        <span class="summary-value">{{ dashboard.summary.currentlyHoused }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">{{ t('dashboard.expectedToday') }}</span>
        <span class="summary-value">{{ dashboard.summary.expectedToday }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">{{ t('dashboard.noShowsToday') }}</span>
        <span class="summary-value">{{ dashboard.summary.noShowsToday }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 1.5rem;

  h2 {
    margin: 0 0 0.25rem;
  }
}

.greeting {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.summary-sub {
  font-size: 0.75rem;
  color: #9ca3af;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #dc2626;
}
</style>
