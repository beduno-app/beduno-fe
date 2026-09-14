<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { InspectionSummary } from '../store/inspection.store'

defineProps<{
  summary: InspectionSummary
  completedAt: string | null
}>()

const { t } = useI18n()
</script>

<template>
  <div class="summary-report">
    <h3 class="summary-title">
      {{ t('inspection.summaryTitle') }}
    </h3>

    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-label">{{ t('inspection.summaryRooms') }}</span>
        <span class="summary-value">{{ summary.verifiedRooms }}/{{ summary.totalRooms }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">{{ t('inspection.summaryPresent') }}</span>
        <span class="summary-value summary-value--success">{{ summary.presentCount }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">{{ t('inspection.summaryAbsent') }}</span>
        <span class="summary-value summary-value--danger">{{ summary.absentCount }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">{{ t('inspection.summaryUnexpected') }}</span>
        <span class="summary-value summary-value--warning">{{ summary.unexpectedCount }}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">{{ t('inspection.summaryDiscrepancies') }}</span>
        <span class="summary-value summary-value--warning">{{ summary.discrepancyCount }}</span>
      </div>
    </div>

    <div
      v-if="completedAt"
      class="completed-info"
    >
      {{ t('inspection.completedAt') }}: {{ completedAt }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.summary-report {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;

  &--success {
    color: #166534;
  }
  &--danger {
    color: #991b1b;
  }
  &--warning {
    color: #92400e;
  }
}

.completed-info {
  font-size: 0.8125rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.export-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
