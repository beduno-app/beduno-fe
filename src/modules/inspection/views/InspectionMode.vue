<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInspectionStore } from '../store/inspection.store'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { useOpsStore } from '@/modules/ops/store/ops.store'
import { BaseButton } from '@/shared/components'
import RoomInspectionCard from '../components/RoomInspectionCard.vue'
import InspectionSummaryReport from '../components/InspectionSummaryReport.vue'
import { useToast } from '@/shared/composables/useToast'

const { t } = useI18n()
const store = useInspectionStore()
const propertiesStore = usePropertiesStore()
const opsStore = useOpsStore()
const toast = useToast()

const propertyId = ref(opsStore.selectedPropertyId)
const started = ref(false)

watch(
  () => opsStore.selectedPropertyId,
  (id) => {
    if (id && !started.value) propertyId.value = id
  },
)

const currentRoomVerified = computed(() =>
  store.currentRoom ? store.isRoomVerified(store.currentRoom.roomId) : false,
)
const currentRoomPresent = computed(() =>
  store.currentRoom ? store.presentSet(store.currentRoom.roomId) : new Set<string>(),
)
const currentRoomUnexpected = computed(() =>
  store.currentRoom ? store.unexpectedWorkerIds(store.currentRoom.roomId) : [],
)

async function startNew() {
  if (!propertyId.value) return
  await store.startInspection(propertyId.value)
  started.value = true
}

function handleTogglePresence(workerId: string, present: boolean) {
  if (!store.currentRoom) return
  store.markPresence(store.currentRoom.roomId, workerId, present)
}

function handleAddUnexpected(workerId: string) {
  if (!store.currentRoom) return
  store.addUnexpectedWorker(store.currentRoom.roomId, workerId)
}

function handleRemoveUnexpected(workerId: string) {
  if (!store.currentRoom) return
  store.removeUnexpectedWorker(store.currentRoom.roomId, workerId)
}

function handleVerify() {
  if (!store.currentRoom) return
  store.verifyRoom(store.currentRoom.roomId)
  toast.success(t('inspection.roomVerified'))
}

async function handleComplete() {
  if (!confirm(t('inspection.confirmComplete'))) return
  try {
    await store.completeInspection()
    toast.success(t('inspection.inspectionCompleted'))
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t('inspection.completeFailed'))
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
      v-if="!started"
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
            :key="room.roomId"
            class="room-dot"
            :class="{
              'room-dot--active': idx === store.currentRoomIndex,
              'room-dot--verified': store.isRoomVerified(room.roomId),
            }"
            @click="store.goToRoom(idx)"
          >
            {{ room.roomNumber }}
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
        :present-worker-ids="currentRoomPresent"
        :unexpected-worker-ids="currentRoomUnexpected"
        :verified="currentRoomVerified"
        @toggle-presence="handleTogglePresence"
        @add-unexpected="handleAddUnexpected"
        @remove-unexpected="handleRemoveUnexpected"
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
          v-else-if="store.allVerified && !store.completedAt"
          size="sm"
          @click="handleComplete"
        >
          {{ t('inspection.completeInspection') }}
        </BaseButton>
      </div>

      <!-- Summary (shown after completion) -->
      <InspectionSummaryReport
        v-if="store.completedAt"
        :summary="store.summary"
        :completed-at="store.completedAt"
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

  @media (max-width: 480px) {
    flex-direction: column;

    .filter-select {
      width: 100%;
    }

    :deep(button) {
      width: 100%;
      min-height: 44px;
    }
  }
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
