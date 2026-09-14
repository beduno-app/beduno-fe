<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArrivalsStore } from '../store/arrivals.store'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { BaseButton } from '@/shared/components'
import ArrivalRow from '../components/ArrivalRow.vue'
import NoShowAction from '../components/NoShowAction.vue'
import QrCheckin from '../components/QrCheckin.vue'
import MoveAction from '../components/MoveAction.vue'
import type { NoShowReason } from '../types/arrival.types'
import { usePullToRefresh } from '@/shared/composables/usePullToRefresh'
import { decodeQrData } from '@/shared/utils/qrCode'
import { loadSnapshot } from '@/shared/services/offlineDb'
import { useToast } from '@/shared/composables/useToast'
import { SkeletonLoader } from '@/shared/components'
import { workersApi } from '@/modules/workers/api/workers.api'

const { t } = useI18n()
const store = useArrivalsStore()
const propertiesStore = usePropertiesStore()
const toast = useToast()

const containerRef = ref<HTMLElement | null>(null)
const { isRefreshing } = usePullToRefresh(containerRef, async () => {
  if (store.propertyIdFilter) await store.fetchArrivals()
})

const activePanel = ref<'none' | 'qr' | 'noshow' | 'move'>('none')
const activeStayId = ref('')
const actionError = ref('')

let pollInterval: ReturnType<typeof setInterval> | null = null
const POLL_MS = 30_000

function onPropertyChange(e: Event) {
  store.propertyIdFilter = (e.target as HTMLSelectElement).value
  store.fetchArrivals()
}

function onDateChange(e: Event) {
  store.dateFilter = (e.target as HTMLInputElement).value
  store.fetchArrivals()
}

function openQrCheckin() {
  activePanel.value = 'qr'
  activeStayId.value = ''
}

function openNoShow(stayId: string) {
  activePanel.value = 'noshow'
  activeStayId.value = stayId
}

function openMove(stayId: string) {
  activePanel.value = 'move'
  activeStayId.value = stayId
}

function closePanel() {
  activePanel.value = 'none'
  activeStayId.value = ''
  actionError.value = ''
}

async function handleDirectCheckIn(stayId: string) {
  actionError.value = ''
  try {
    await store.checkIn(stayId)
    toast.success(t('arrivals.checkInSuccess'))
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : t('arrivals.checkInFailed')
  }
}

async function handleQrScanned(rawCode: string) {
  actionError.value = ''

  try {
    // Try decoding as beduno QR format first, fall back to internalId match
    const decoded = decodeQrData(rawCode)

    // Look up arrival in live store first; fall back to offline snapshot if empty
    let sourceArrivals = store.arrivals
    if (!sourceArrivals.length && !navigator.onLine) {
      const snapshot = await loadSnapshot()
      if (snapshot) sourceArrivals = snapshot.arrivals
    }

    let matchWorkerId = decoded?.workerId
    if (!matchWorkerId) {
      // Manual entry / non-beduno QR: resolve internalId to a workerId.
      if (navigator.onLine) {
        const results = await workersApi.getWorkers({ search: rawCode })
        matchWorkerId = results.content.find((w) => w.internalId === rawCode)?.id
      } else {
        const snapshot = await loadSnapshot()
        matchWorkerId = snapshot?.workers.find((w) => w.internalId === rawCode)?.id
      }
    }

    const arrival = matchWorkerId
      ? sourceArrivals.find((a) => a.workerId === matchWorkerId && a.status === 'EXPECTED_TODAY')
      : undefined

    if (!arrival) {
      actionError.value = t('arrivals.workerNotFound')
      return
    }
    await store.checkIn(arrival.id)
    toast.success(t('arrivals.checkInSuccess'))
    closePanel()
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : t('arrivals.checkInFailed')
  }
}

async function handleNoShowConfirm(reason: NoShowReason) {
  actionError.value = ''
  try {
    await store.noShow(activeStayId.value, { noShowReason: reason })
    toast.success(t('arrivals.noShowSuccess'))
    closePanel()
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : t('arrivals.noShowFailed')
  }
}

async function handleMoveConfirm(targetRoomId: string) {
  actionError.value = ''
  try {
    await store.move(activeStayId.value, { targetRoomId })
    toast.success(t('arrivals.moveSuccess'))
    closePanel()
  } catch (e) {
    actionError.value = e instanceof Error ? e.message : t('arrivals.moveFailed')
  }
}

function startPolling() {
  stopPolling()
  pollInterval = setInterval(() => {
    if (store.propertyIdFilter) {
      store.fetchArrivals()
    }
  }, POLL_MS)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

onMounted(async () => {
  propertiesStore.fetchProperties()
  if (store.propertyIdFilter) {
    if (navigator.onLine) {
      store.fetchArrivals()
    } else {
      // Load arrivals from offline snapshot
      const snapshot = await loadSnapshot()
      if (snapshot && snapshot.propertyId === store.propertyIdFilter) {
        store.arrivals = snapshot.arrivals
      }
    }
  }
  startPolling()
})

onUnmounted(stopPolling)
</script>

<template>
  <div
    ref="containerRef"
    class="arrivals-today"
  >
    <div
      v-if="isRefreshing"
      class="pull-refresh-indicator"
    >
      ↻
    </div>
    <div class="page-header">
      <h2>{{ t('nav.arrivals') }}</h2>
      <div class="header-actions">
        <BaseButton
          size="sm"
          @click="openQrCheckin"
        >
          {{ t('arrivals.scanQr') }}
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
          {{ t('arrivals.selectProperty') }}
        </option>
        <option
          v-for="prop in propertiesStore.properties"
          :key="prop.id"
          :value="prop.id"
        >
          {{ prop.name }}
        </option>
      </select>
      <input
        type="date"
        class="filter-input"
        :value="store.dateFilter"
        @change="onDateChange"
      >
    </div>

    <div
      v-if="store.propertyIdFilter && store.arrivals.length"
      class="stats-bar"
    >
      <span class="stat">
        {{ t('arrivals.pending') }}: <strong>{{ store.pendingCount }}</strong>
      </span>
      <span class="stat">
        {{ t('arrivals.checkedIn') }}: <strong>{{ store.checkedInCount }}</strong>
      </span>
      <span class="stat">
        {{ t('arrivals.total') }}: <strong>{{ store.arrivals.length }}</strong>
      </span>
    </div>

    <!-- Action panels -->
    <div
      v-if="actionError"
      class="error"
    >
      {{ actionError }}
    </div>

    <QrCheckin
      v-if="activePanel === 'qr'"
      @scanned="handleQrScanned"
      @cancel="closePanel"
    />

    <NoShowAction
      v-if="activePanel === 'noshow'"
      :stay-id="activeStayId"
      @confirm="handleNoShowConfirm"
      @cancel="closePanel"
    />

    <MoveAction
      v-if="activePanel === 'move'"
      :stay-id="activeStayId"
      @confirm="handleMoveConfirm"
      @cancel="closePanel"
    />

    <!-- Main content -->
    <div
      v-if="!store.propertyIdFilter"
      class="empty"
    >
      {{ t('arrivals.selectPropertyHint') }}
    </div>
    <div
      v-else-if="store.isLoading"
      class="skeleton-section"
    >
      <SkeletonLoader
        :lines="5"
        height="2.75rem"
      />
    </div>
    <div
      v-else-if="store.error"
      class="error"
    >
      {{ store.error }}
    </div>
    <template v-else>
      <table
        v-if="store.arrivals.length"
        class="arrivals-table"
      >
        <thead>
          <tr>
            <th>{{ t('arrivals.worker') }}</th>
            <th>{{ t('arrivals.room') }}</th>
            <th>{{ t('arrivals.statusLabel') }}</th>
            <th class="actions-header">
              {{ t('arrivals.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <ArrivalRow
            v-for="arrival in store.arrivals"
            :key="arrival.id"
            :arrival="arrival"
            @check-in="handleDirectCheckIn"
            @no-show="openNoShow"
            @move="openMove"
          />
        </tbody>
      </table>
      <p
        v-else
        class="empty"
      >
        {{ t('arrivals.noArrivals') }}
      </p>
    </template>
  </div>
</template>

<style scoped lang="scss">
.arrivals-today {
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
  align-items: flex-start;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
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
}

.stat strong {
  color: #111827;
}

.arrivals-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th,
  td {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.875rem;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
  }

  td {
    border-bottom: 1px solid #f3f4f6;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.actions-header {
  text-align: right;
}

// Mobile card layout — switch table to stacked cards at narrow widths
@media (max-width: 600px) {
  .arrivals-table {
    display: block;
    box-shadow: none;

    thead {
      display: none;
    }

    tbody {
      display: block;
    }

    :deep(tr) {
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-bottom: 0.75rem;
      padding: 0.75rem;
      gap: 0.5rem;
    }

    :deep(td) {
      display: block;
      padding: 0;
      border: none;
      font-size: 0.875rem;
    }

    :deep(.actions-cell) {
      justify-content: flex-start;
      margin-top: 0.25rem;
    }
  }

  .filters {
    flex-direction: column;

    select,
    input {
      width: 100%;
    }
  }

  .stats-bar {
    gap: 0.75rem;
  }

  .header-actions {
    flex-wrap: wrap;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.page-info {
  font-size: 0.875rem;
  color: #4b5563;
}

.skeleton-section {
  padding: 0.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

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
