<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ConstraintViolation } from '../types/stay.types'

const props = defineProps<{
  hardViolations: ConstraintViolation[]
  softViolations: ConstraintViolation[]
}>()

const emit = defineEmits<{
  override: [reason: string]
}>()

const { t } = useI18n()

const hasHard = computed(() => props.hardViolations.length > 0)
const hasSoft = computed(() => props.softViolations.length > 0)

function formatParams(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
}
</script>

<template>
  <div
    v-if="hasHard || hasSoft"
    class="conflict-banner"
  >
    <div
      v-if="hasHard"
      class="conflict-section conflict-section--hard"
    >
      <div class="conflict-header">
        {{ t('stays.conflicts.hardTitle') }}
      </div>
      <ul class="conflict-list">
        <li
          v-for="(v, i) in hardViolations"
          :key="'hard-' + i"
          class="conflict-item"
        >
          <span class="conflict-type">{{ t(`stays.conflicts.${v.type}`) }}</span>
          <span class="conflict-params">{{ formatParams(v.params) }}</span>
        </li>
      </ul>
    </div>

    <div
      v-if="hasSoft"
      class="conflict-section conflict-section--soft"
    >
      <div class="conflict-header">
        {{ t('stays.conflicts.softTitle') }}
      </div>
      <ul class="conflict-list">
        <li
          v-for="(v, i) in softViolations"
          :key="'soft-' + i"
          class="conflict-item"
        >
          <span class="conflict-type">{{ t(`stays.conflicts.${v.type}`) }}</span>
          <span class="conflict-params">{{ formatParams(v.params) }}</span>
        </li>
      </ul>
      <div
        v-if="!hasHard"
        class="conflict-override"
      >
        <p class="override-hint">
          {{ t('stays.conflicts.overrideHint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.conflict-banner {
  margin-bottom: 1rem;
}

.conflict-section {
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;

  &--hard {
    background: #fee2e2;
    border: 1px solid #fecaca;
  }

  &--soft {
    background: #fef3c7;
    border: 1px solid #fde68a;
  }
}

.conflict-header {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;

  .conflict-section--hard & {
    color: #991b1b;
  }

  .conflict-section--soft & {
    color: #92400e;
  }
}

.conflict-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.conflict-item {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.conflict-type {
  font-weight: 500;
}

.conflict-params {
  color: #6b7280;
  font-size: 0.8125rem;
}

.conflict-override {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #fde68a;
}

.override-hint {
  font-size: 0.8125rem;
  color: #92400e;
  margin: 0;
}
</style>
