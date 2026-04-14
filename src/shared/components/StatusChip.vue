<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StayStatus } from '@/modules/stays/types/stay.types'

const props = defineProps<{
  status: StayStatus
}>()

const { t } = useI18n()

const variant = computed(() => {
  const map: Record<StayStatus, string> = {
    PLANNED: 'default',
    EXPECTED_TODAY: 'info',
    CHECKED_IN: 'success',
    CHECKED_OUT: 'default',
    NO_SHOW: 'danger',
    MOVED: 'warning',
    CANCELLED: 'danger',
  }
  return map[props.status]
})
</script>

<template>
  <span
    class="chip"
    :class="`chip--${variant}`"
  >
    {{ t(`status.${status}`) }}
  </span>
</template>

<style scoped lang="scss">
.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.1875rem 0.625rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;

  &--default {
    background: #f3f4f6;
    color: #4b5563;
  }
  &--success {
    background: #dcfce7;
    color: #166534;
  }
  &--warning {
    background: #fef3c7;
    color: #92400e;
  }
  &--danger {
    background: #fee2e2;
    color: #991b1b;
  }
  &--info {
    background: #dbeafe;
    color: #1e40af;
  }
}
</style>
