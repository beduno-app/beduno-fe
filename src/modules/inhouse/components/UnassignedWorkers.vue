<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { OccupantStay } from '../types/inhouse.types'

defineProps<{
  workers: OccupantStay[]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    v-if="workers.length"
    class="unassigned-section"
  >
    <h3 class="section-title">
      {{ t('inhouse.unassignedWorkers') }} ({{ workers.length }})
    </h3>
    <div class="worker-list">
      <div
        v-for="w in workers"
        :key="w.id"
        class="worker-chip"
      >
        <span class="worker-name">{{ w.worker.lastName }}, {{ w.worker.firstName }}</span>
        <span class="worker-id">{{ w.worker.internalId }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.unassigned-section {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 0.5rem;
  padding: 1rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 0.75rem;
}

.worker-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.worker-chip {
  display: flex;
  flex-direction: column;
  padding: 0.375rem 0.75rem;
  background: #fff;
  border: 1px solid #fde68a;
  border-radius: 0.375rem;
}

.worker-name {
  font-size: 0.8125rem;
  font-weight: 500;
}

.worker-id {
  font-family: monospace;
  font-size: 0.6875rem;
  color: #6b7280;
}
</style>
