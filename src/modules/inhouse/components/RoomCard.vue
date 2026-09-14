<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RoomOccupancy, RoomOccupancyStatus } from '../types/inhouse.types'
import { BaseButton } from '@/shared/components'
import CapacityBadge from './CapacityBadge.vue'

defineProps<{
  room: RoomOccupancy
  status: RoomOccupancyStatus
  allRooms: { room: RoomOccupancy; status: RoomOccupancyStatus }[]
}>()

const emit = defineEmits<{
  'check-out': [stayId: string]
  'move-room': [stayId: string, targetRoomId: string]
  'toggle-select': [stayId: string]
}>()

const { t } = useI18n()

const movingStayId = ref('')
const targetRoomId = ref('')

function startMove(stayId: string) {
  movingStayId.value = stayId
  targetRoomId.value = ''
}

function cancelMove() {
  movingStayId.value = ''
}

function confirmMove() {
  if (!targetRoomId.value) return
  emit('move-room', movingStayId.value, targetRoomId.value)
  movingStayId.value = ''
}
</script>

<template>
  <div
    class="room-card"
    data-testid="room-card"
    :class="{ 'room-card--blocked': status === 'BLOCKED' }"
  >
    <div class="room-header">
      <div class="room-info">
        <span
          class="room-number"
          data-testid="room-number"
        >{{ room.roomNumber }}</span>
        <span class="room-capacity">
          {{ room.occupiedSpots }}/{{ room.bedCount }}
        </span>
      </div>
      <CapacityBadge :status="status" />
    </div>

    <div
      v-if="room.occupants.length"
      class="occupants"
    >
      <div
        v-for="occ in room.occupants"
        :key="occ.stayId"
        class="occupant"
        data-testid="occupant"
      >
        <div class="occupant-info">
          <label class="occupant-select">
            <input
              type="checkbox"
              @change="emit('toggle-select', occ.stayId)"
            >
            <span class="occupant-name">{{ occ.lastName }}, {{ occ.firstName }}</span>
          </label>
          <span
            v-if="occ.bedLabel"
            class="occupant-id"
          >{{ occ.bedLabel }}</span>
        </div>
        <div class="occupant-actions">
          <template v-if="movingStayId === occ.stayId">
            <select
              v-model="targetRoomId"
              class="move-select"
            >
              <option value="">
                {{ t('inhouse.selectRoom') }}
              </option>
              <option
                v-for="r in allRooms"
                :key="r.room.roomId"
                :value="r.room.roomId"
                :disabled="r.room.roomId === room.roomId || r.status === 'BLOCKED'"
              >
                {{ r.room.roomNumber }} ({{ r.room.availableBedCount }}/{{ r.room.bedCount }})
              </option>
            </select>
            <BaseButton
              size="sm"
              :disabled="!targetRoomId"
              @click="confirmMove"
            >
              {{ t('common.confirm') }}
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="cancelMove"
            >
              {{ t('common.cancel') }}
            </BaseButton>
          </template>
          <template v-else>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="startMove(occ.stayId)"
            >
              {{ t('inhouse.moveRoom') }}
            </BaseButton>
            <BaseButton
              variant="danger"
              size="sm"
              @click="emit('check-out', occ.stayId)"
            >
              {{ t('inhouse.checkOut') }}
            </BaseButton>
          </template>
        </div>
      </div>
    </div>
    <p
      v-else
      class="empty-room"
    >
      {{ t('inhouse.emptyRoom') }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.room-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &--blocked {
    border-left: 3px solid #9ca3af;
    opacity: 0.7;
  }
}

.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.room-info {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.room-number {
  font-weight: 700;
  font-size: 1.125rem;
}

.room-capacity {
  font-size: 0.875rem;
  color: #6b7280;
}

.occupant {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  flex-wrap: wrap;
  gap: 0.5rem;

  &:last-child {
    border-bottom: none;
  }
}

.occupant-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.occupant-select {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
}

.occupant-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.occupant-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
}

.occupant-actions {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.move-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #e66e00;
    box-shadow: 0 0 0 2px rgba(230, 110, 0, 0.15);
  }
}

.empty-room {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0;
}

@media (pointer: coarse) {
  .occupant-actions :deep(button) {
    min-height: 44px;
  }
}
</style>
