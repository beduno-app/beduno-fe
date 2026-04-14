<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInspectionStore } from '../store/inspection.store'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { useOpsStore } from '@/modules/ops/store/ops.store'
import { BaseButton } from '@/shared/components'
import RoomInspectionCard from '../components/RoomInspectionCard.vue'
import InspectionSummaryReport from '../components/InspectionSummaryReport.vue'
import type { PresenceStatus, DiscrepancyReason } from '../types/inspection.types'

const { t, locale } = useI18n()
const store = useInspectionStore()
const propertiesStore = usePropertiesStore()
const opsStore = useOpsStore()

const propertyId = ref(opsStore.selectedPropertyId)

watch(
  () => opsStore.selectedPropertyId,
  (id) => {
    if (id && !store.inspection) propertyId.value = id
  },
)

async function startNew() {
  if (!propertyId.value) return
  await store.startInspection(propertyId.value)
}

async function handleMarkPresence(
  stayId: string,
  presence: PresenceStatus,
  reason?: DiscrepancyReason,
  note?: string,
) {
  try {
    await store.markPresence(stayId, presence, reason, note)
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to update presence')
  }
}

async function handleAddUnexpected(description: string, reason: DiscrepancyReason, note?: string) {
  if (!store.currentRoom) return
  try {
    await store.addUnexpected(store.currentRoom.room.id, description, reason, note)
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to add unexpected presence')
  }
}

async function handleVerify() {
  if (!store.currentRoom) return
  try {
    await store.verifyRoom(store.currentRoom.room.id)
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to verify room')
  }
}

async function handleComplete() {
  if (!confirm(t('inspection.confirmComplete'))) return
  try {
    await store.completeInspection()
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Failed to complete inspection')
  }
}

onMounted(() => {
  propertiesStore.fetchProperties()
})
</script>

<template>
  <div class="inspection-mode">
    <div class="page-header">
      <h2>{{ t('nav.inspection') }}</h2>
    </div>

    <!-- Start form (no active inspection) -->
    <div
      v-if="!store.inspection"
      class="start-section"
    >
      <div class="start-form">
        <select
          v-model="propertyId"
          class="filter-select"
        >
          <option value="">
            {{ t('inspection.selectProperty') }}
          </option>
          <option
            v-for="prop in propertiesStore.properties"
            :key="prop.id"
            :value="prop.id"
          >
            {{ prop.name }}
          </option>
        </select>
        <BaseButton
          :disabled="!propertyId || store.isLoading"
          :loading="store.isLoading"
          @click="startNew"
        >
          {{ t('inspection.startInspection') }}
        </BaseButton>
      </div>
      <div
        v-if="store.error"
        class="error"
      >
        {{ store.error }}
      </div>
    </div>

    <!-- Active inspection -->
    <template v-else>
      <div class="inspection-nav">
        <div class="room-progress">
          <span
            v-for="(room, idx) in store.rooms"
            :key="room.room.id"
            class="room-dot"
            :class="{
              'room-dot--active': idx === store.currentRoomIndex,
              'room-dot--verified': room.verified,
            }"
            @click="store.goToRoom(idx)"
          >
            {{ room.room.roomNumber }}
          </span>
        </div>
        <span class="room-counter">
          {{ store.currentRoomIndex + 1 }} / {{ store.totalRooms }}
        </span>
      </div>

      <!-- Current room -->
      <RoomInspectionCard
        v-if="store.currentRoom"
        :room="store.currentRoom"
        @mark-presence="handleMarkPresence"
        @add-unexpected="handleAddUnexpected"
        @verify="handleVerify"
      />

      <!-- Navigation -->
      <div class="step-nav">
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="store.isFirstRoom"
          @click="store.previousRoom()"
        >
          {{ t('common.back') }}
        </BaseButton>
        <BaseButton
          v-if="!store.isLastRoom"
          size="sm"
          @click="store.nextRoom()"
        >
          {{ t('inspection.nextRoom') }}
        </BaseButton>
        <BaseButton
          v-else-if="store.allVerified && !store.inspection.completedAt"
          size="sm"
          @click="handleComplete"
        >
          {{ t('inspection.completeInspection') }}
        </BaseButton>
      </div>

      <!-- Summary (shown after completion) -->
      <InspectionSummaryReport
        v-if="store.summary && store.inspection.completedAt"
        :summary="store.summary"
        :completed-at="store.inspection.completedAt"
        @export-csv="store.exportReport('csv', locale)"
        @export-pdf="store.exportReport('pdf', locale)"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.inspection-mode {
  max-width: 800px;
}

.page-header {
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
  }
}

.start-section {
  max-width: 400px;
}

.start-form {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.filter-select {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #e66e00;
    box-shadow: 0 0 0 2px rgba(230, 110, 0, 0.15);
  }
}

.inspection-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.room-progress {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.room-dot {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #e5e7eb;
  }

  &--active {
    background: #e66e00;
    color: #fff;

    &:hover {
      background: #d46300;
    }
  }

  &--verified {
    background: #dcfce7;
    color: #166534;
  }

  &--active.room-dot--verified {
    background: #e66e00;
    color: #fff;
  }
}

.room-counter {
  font-size: 0.875rem;
  color: #6b7280;
}

.step-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.error {
  padding: 1rem;
  color: #dc2626;
  margin-top: 0.5rem;
}
</style>
