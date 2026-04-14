<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ArrivalStay } from '../types/arrival.types'
import { BaseButton, StatusChip } from '@/shared/components'
import { useSwipe } from '@/shared/composables/useSwipe'

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
const rowRef = ref<HTMLElement | null>(null)
const swipeHint = ref<'' | 'checkin' | 'noshow'>('')

useSwipe(rowRef, {
  onSwipeRight: () => {
    if (!isPending) return
    swipeHint.value = 'checkin'
    setTimeout(() => {
      swipeHint.value = ''
      emit('check-in', props.arrival.id)
    }, 200)
  },
  onSwipeLeft: () => {
    if (!isPending) return
    swipeHint.value = 'noshow'
    setTimeout(() => {
      swipeHint.value = ''
      emit('no-show', props.arrival.id)
    }, 200)
  },
})
</script>

<template>
  <tr
    ref="rowRef"
    class="arrival-row"
    :class="{
      'arrival-row--done': !isPending,
      'arrival-row--swipe-checkin': swipeHint === 'checkin',
      'arrival-row--swipe-noshow': swipeHint === 'noshow',
    }"
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
          class="tap-target"
          @click="emit('check-in', arrival.id)"
        >
          {{ t('arrivals.checkIn') }}
        </BaseButton>
        <BaseButton
          variant="danger"
          size="sm"
          class="tap-target"
          @click="emit('no-show', arrival.id)"
        >
          {{ t('arrivals.noShow') }}
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          class="tap-target"
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
  transition: background-color 0.15s;

  &--done {
    opacity: 0.6;
  }

  &--swipe-checkin {
    background-color: #dcfce7;
  }

  &--swipe-noshow {
    background-color: #fee2e2;
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
  flex-wrap: wrap;
}

// Ensure 44px minimum tap target height on touch devices
.tap-target {
  @media (pointer: coarse) {
    min-height: 44px;
    padding-top: 0.625rem;
    padding-bottom: 0.625rem;
  }
}
</style>
