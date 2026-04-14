<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInHouseStore } from '../store/inhouse.store'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { BaseButton } from '@/shared/components'
import RoomCard from '../components/RoomCard.vue'
import UnassignedWorkers from '../components/UnassignedWorkers.vue'
import { usePullToRefresh } from '@/shared/composables/usePullToRefresh'
import { useToast } from '@/shared/composables/useToast'

const { t, locale } = useI18n()
const store = useInHouseStore()
const propertiesStore = usePropertiesStore()
const toast = useToast()

const containerRef = ref<HTMLElement | null>(null)
const { isRefreshing } = usePullToRefresh(containerRef, async () => {
  if (store.propertyIdFilter) await store.fetchInHouse()
})

function onPropertyChange(e: Event) {
  store.propertyIdFilter = (e.target as HTMLSelectElement).value
  if (store.propertyIdFilter) {
    store.fetchInHouse()
  }
}

async function handleCheckOut(stayId: string) {
  if (!confirm(t('inhouse.confirmCheckOut'))) return
  try {
    await store.checkOut(stayId)
    toast.success(t('inhouse.checkOutSuccess'))
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t('inhouse.checkOutFailed'))
  }
}

async function handleMoveRoom(stayId: string, targetRoomId: string) {
  try {
    await store.moveRoom(stayId, { targetRoomId })
    toast.success(t('inhouse.moveRoomSuccess'))
  } catch (e) {
    toast.error(e instanceof Error ? e.message : t('inhouse.moveFailed'))
  }
}

function exportCsv() {
  store.exportData('csv', locale.value)
}

function exportPdf() {
  store.exportData('pdf', locale.value)
}

onMounted(() => {
  propertiesStore.fetchProperties()
  if (store.propertyIdFilter) {
    store.fetchInHouse()
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="inhouse-view"
  >
    <div
      v-if="isRefreshing"
      class="pull-refresh-indicator"
    >
      ↻
    </div>
    <div class="page-header">
      <h2>{{ t('nav.occupancy') }}</h2>
      <div
        v-if="store.propertyIdFilter && store.data"
        class="header-actions"
      >
        <BaseButton
          variant="secondary"
          size="sm"
          @click="exportCsv"
        >
          {{ t('inhouse.exportCsv') }}
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="exportPdf"
        >
          {{ t('inhouse.exportPdf') }}
        </BaseButton>
      </div>
    </div>

    <div class="filters">
      <select
        class="filter-select"
        :value="store.propertyIdFilter"
        @change="onPropertyChange"
      >
        <option value="">
          {{ t('inhouse.selectProperty') }}
        </option>
        <option
          v-for="prop in propertiesStore.properties"
          :key="prop.id"
          :value="prop.id"
        >
          {{ prop.name }}
        </option>
      </select>
    </div>

    <!-- Summary -->
    <div
      v-if="store.summary"
      class="stats-bar"
    >
      <span class="stat">
        {{ t('inhouse.totalRooms') }}: <strong>{{ store.summary.totalRooms }}</strong>
      </span>
      <span class="stat">
        {{ t('inhouse.occupants') }}: <strong>{{ store.summary.totalOccupants }}/{{ store.summary.totalCapacity }}</strong>
      </span>
      <span
        v-if="store.summary.overCapacityRooms"
        class="stat stat--red"
      >
        {{ t('inhouse.overCapacity') }}: <strong>{{ store.summary.overCapacityRooms }}</strong>
      </span>
      <span
        v-if="store.summary.nearCapacityRooms"
        class="stat stat--amber"
      >
        {{ t('inhouse.nearCapacity') }}: <strong>{{ store.summary.nearCapacityRooms }}</strong>
      </span>
      <span
        v-if="store.summary.blockedRooms"
        class="stat stat--grey"
      >
        {{ t('inhouse.blocked') }}: <strong>{{ store.summary.blockedRooms }}</strong>
      </span>
    </div>

    <!-- Content -->
    <div
      v-if="!store.propertyIdFilter"
      class="empty"
    >
      {{ t('inhouse.selectPropertyHint') }}
    </div>
    <div
      v-else-if="store.isLoading"
      class="loading"
    >
      {{ t('common.loading') }}
    </div>
    <div
      v-else-if="store.error"
      class="error"
    >
      {{ store.error }}
    </div>
    <template v-else-if="store.data">
      <UnassignedWorkers :workers="store.unassignedWorkers" />

      <div class="rooms-grid">
        <RoomCard
          v-for="room in store.rooms"
          :key="room.room.id"
          :room="room"
          :all-rooms="store.rooms"
          @check-out="handleCheckOut"
          @move-room="handleMoveRoom"
        />
      </div>

      <p
        v-if="!store.rooms.length"
        class="empty"
      >
        {{ t('inhouse.noRooms') }}
      </p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.inhouse-view {
  max-width: 1200px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.filter-select {
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

.stats-bar {
  display: flex;
  gap: 1.5rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #374151;
  flex-wrap: wrap;
}

.stat {
  strong {
    color: #111827;
  }

  &--red strong {
    color: #991b1b;
  }

  &--amber strong {
    color: #92400e;
  }

  &--grey strong {
    color: #6b7280;
  }
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(360px, 100%), 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 600px) {
  .filters {
    flex-direction: column;

    select {
      width: 100%;
    }
  }

  .stats-bar {
    gap: 0.75rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #dc2626;
}

.pull-refresh-indicator {
  text-align: center;
  padding: 0.5rem;
  font-size: 1.25rem;
  color: #e66e00;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
