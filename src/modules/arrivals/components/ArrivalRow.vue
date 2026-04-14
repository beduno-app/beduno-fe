<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ArrivalStay } from '../types/arrival.types'
import { BaseButton, StatusChip } from '@/shared/components'

const props = defineProps<{
  arrival: ArrivalStay
}>()

const emit = defineEmits<{
  'check-in': [stayId: string]
  'no-show': [stayId: string]
  move: [stayId: string]
}>()

const { t } = useI18n()

const isPending = props.arrival.status === 'EXPECTED_TODAY'
</script>

<template>
  <tr
    class="arrival-row"
    :class="{ 'arrival-row--done': !isPending }"
  >
    <td class="worker-cell">
      <span class="worker-name">{{ arrival.worker.lastName }}, {{ arrival.worker.firstName }}</span>
      <span class="worker-id">{{ arrival.worker.internalId }}</span>
    </td>
    <td>{{ arrival.room.roomNumber }}</td>
    <td>
      <StatusChip :status="arrival.status" />
    </td>
    <td class="actions-cell">
      <template v-if="isPending">
        <BaseButton
          size="sm"
          @click="emit('check-in', arrival.id)"
        >
          {{ t('arrivals.checkIn') }}
        </BaseButton>
        <BaseButton
          variant="danger"
          size="sm"
          @click="emit('no-show', arrival.id)"
        >
          {{ t('arrivals.noShow') }}
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="emit('move', arrival.id)"
        >
          {{ t('arrivals.move') }}
        </BaseButton>
      </template>
    </td>
  </tr>
</template>

<style scoped lang="scss">
.arrival-row {
  &--done {
    opacity: 0.6;
  }
}

.worker-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.worker-name {
  font-weight: 500;
}

.worker-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
}

.actions-cell {
  display: flex;
  gap: 0.375rem;
  justify-content: flex-end;
}
</style>
