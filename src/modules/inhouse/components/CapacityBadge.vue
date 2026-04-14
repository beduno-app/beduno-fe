<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RoomOccupancyStatus } from '../types/inhouse.types'

const props = defineProps<{
  status: RoomOccupancyStatus
}>()

const { t } = useI18n()

const variant = computed(() => {
  const map: Record<RoomOccupancyStatus, string> = {
    OK: 'ok',
    NEAR_CAPACITY: 'amber',
    OVER_CAPACITY: 'red',
    BLOCKED: 'grey',
  }
  return map[props.status]
})

const label = computed(() => t(`inhouse.roomStatus.${props.status}`))
</script>

<template>
  <span
    class="badge"
    :class="`badge--${variant}`"
  >
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1875rem 0.625rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;

  &--ok {
    background: #dcfce7;
    color: #166534;
  }
  &--amber {
    background: #fef3c7;
    color: #92400e;
  }
  &--red {
    background: #fee2e2;
    color: #991b1b;
  }
  &--grey {
    background: #f3f4f6;
    color: #6b7280;
  }
}
</style>
