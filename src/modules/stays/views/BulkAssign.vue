<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStaysStore } from '../store/stays.store'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { useWorkersStore } from '@/modules/workers/store/workers.store'
import { useConflicts } from '../composables/useConflicts'
import type { BulkAssignmentItem, BulkAssignResponse } from '../types/stay.types'
import { BaseButton, BaseBadge } from '@/shared/components'
import ConflictBanner from '../components/ConflictBanner.vue'

const router = useRouter()
const { t } = useI18n()
const staysStore = useStaysStore()
const propertiesStore = usePropertiesStore()
const workersStore = useWorkersStore()
const conflicts = useConflicts()

const selectedWorkerIds = ref<string[]>([])
const propertyId = ref('')
const roomId = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const isSaving = ref(false)
const error = ref('')
const result = ref<BulkAssignResponse | null>(null)

const selectedWorkers = computed(() =>
  workersStore.workers.filter((w) => selectedWorkerIds.value.includes(w.id)),
)
const selectedRoom = computed(() =>
  propertiesStore.rooms.find((r) => r.id === roomId.value) ?? null,
)
const selectedProperty = computed(() =>
  propertiesStore.properties.find((p) => p.id === propertyId.value) ?? null,
)

watch(
  () => propertyId.value,
  (id) => {
    roomId.value = ''
    if (id) {
      propertiesStore.fetchRooms(id)
    }
  },
)

// Live pre-submit validation
watch(
  [selectedWorkers, selectedRoom, selectedProperty],
  () => {
    conflicts.validateBulk(
      selectedWorkers.value,
      selectedRoom.value,
      selectedProperty.value?.status,
    )
  },
)

const isValid = computed(() => {
  return (
    selectedWorkerIds.value.length > 0 &&
    propertyId.value &&
    roomId.value &&
    dateFrom.value &&
    !conflicts.isBlocked.value
  )
})

function toggleWorker(id: string) {
  const idx = selectedWorkerIds.value.indexOf(id)
  if (idx >= 0) {
    selectedWorkerIds.value.splice(idx, 1)
  } else {
    selectedWorkerIds.value.push(id)
  }
}

function isSelected(id: string): boolean {
  return selectedWorkerIds.value.includes(id)
}

async function submit() {
  isSaving.value = true
  error.value = ''
  result.value = null

  try {
    const assignments: BulkAssignmentItem[] = selectedWorkerIds.value.map((workerId) => ({
      workerId,
      propertyId: propertyId.value,
      roomId: roomId.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value || undefined,
    })) as BulkAssignmentItem[]
    result.value = await staysStore.bulkAssign({ assignments })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to assign workers'
  } finally {
    isSaving.value = false
  }
}

function getWorkerName(workerId: string): string {
  const w = workersStore.workers.find((w) => w.id === workerId)
  return w ? `${w.lastName}, ${w.firstName}` : workerId
}

// Load data for dropdowns
workersStore.fetchWorkers()
propertiesStore.fetchProperties()
</script>

<template>
  <div class="bulk-assign">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'Stays' })"
      >
        {{ t('common.back') }}
      </BaseButton>
    </div>

    <h2>{{ t('stays.bulkAssign') }}</h2>

    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <!-- Result summary -->
    <div
      v-if="result"
      class="result-card"
    >
      <h3>{{ t('stays.bulkResult') }}</h3>
      <div class="result-summary">
        <span>{{ t('stays.total') }}: {{ result.total }}</span>
        <BaseBadge variant="success">
          {{ t('stays.succeeded') }}: {{ result.succeeded }}
        </BaseBadge>
        <BaseBadge
          v-if="result.failed > 0"
          variant="danger"
        >
          {{ t('stays.failed') }}: {{ result.failed }}
        </BaseBadge>
      </div>
      <table
        v-if="result.results.length"
        class="result-table"
      >
        <thead>
          <tr>
            <th>{{ t('stays.worker') }}</th>
            <th>{{ t('stays.statusLabel') }}</th>
            <th>{{ t('stays.errorDetail') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in result.results"
            :key="r.workerId"
          >
            <td>{{ getWorkerName(r.workerId) }}</td>
            <td>
              <BaseBadge :variant="r.status === 'CREATED' ? 'success' : 'danger'">
                {{ r.status }}
              </BaseBadge>
            </td>
            <td>{{ r.error ? t(`stays.conflicts.${r.error.type}`) : '—' }}</td>
          </tr>
        </tbody>
      </table>
      <div class="form-actions">
        <BaseButton @click="router.push({ name: 'Stays' })">
          {{ t('stays.backToList') }}
        </BaseButton>
      </div>
    </div>

    <!-- Assignment form -->
    <template v-else>
      <ConflictBanner
        :hard-violations="conflicts.hardViolations.value"
        :soft-violations="conflicts.softViolations.value"
      />

      <div class="form-card">
        <h3>{{ t('stays.selectWorkers') }}</h3>
        <div class="worker-grid">
          <div
            v-for="w in workersStore.workers"
            :key="w.id"
            class="worker-chip"
            :class="{ 'worker-chip--selected': isSelected(w.id) }"
            @click="toggleWorker(w.id)"
          >
            <span class="worker-name">{{ w.lastName }}, {{ w.firstName }}</span>
            <span class="worker-id">{{ w.internalId }}</span>
          </div>
        </div>
        <p
          v-if="!workersStore.workers.length"
          class="muted"
        >
          {{ t('workers.noWorkers') }}
        </p>
        <p
          v-if="selectedWorkerIds.length"
          class="selection-count"
        >
          {{ t('stays.selectedCount', { count: selectedWorkerIds.length }) }}
        </p>
      </div>

      <div class="form-card">
        <h3>{{ t('stays.targetAssignment') }}</h3>

        <div class="input-group">
          <label class="input-label">{{ t('stays.property') }}</label>
          <select
            v-model="propertyId"
            class="filter-select"
          >
            <option value="">
              {{ t('stays.selectProperty') }}
            </option>
            <option
              v-for="p in propertiesStore.properties"
              :key="p.id"
              :value="p.id"
            >
              {{ p.name }}
            </option>
          </select>
        </div>

        <div class="input-group">
          <label class="input-label">{{ t('stays.room') }}</label>
          <select
            v-model="roomId"
            class="filter-select"
            :disabled="!propertyId"
          >
            <option value="">
              {{ t('stays.selectRoom') }}
            </option>
            <option
              v-for="r in propertiesStore.rooms"
              :key="r.id"
              :value="r.id"
            >
              {{ r.roomNumber }} ({{ r.availableSpots }}/{{ r.capacity }})
            </option>
          </select>
        </div>

        <div class="date-row">
          <div class="input-group">
            <label class="input-label">{{ t('stays.dateFrom') }}</label>
            <input
              v-model="dateFrom"
              type="date"
              class="filter-input"
            >
          </div>
          <div class="input-group">
            <label class="input-label">{{ t('stays.dateTo') }}</label>
            <input
              v-model="dateTo"
              type="date"
              class="filter-input"
            >
          </div>
        </div>

        <div class="form-actions">
          <BaseButton
            variant="secondary"
            @click="router.push({ name: 'Stays' })"
          >
            {{ t('common.cancel') }}
          </BaseButton>
          <BaseButton
            :loading="isSaving"
            :disabled="!isValid"
            @click="submit"
          >
            {{ t('stays.assignWorkers', { count: selectedWorkerIds.length }) }}
          </BaseButton>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.bulk-assign {
  max-width: 800px;
}

.page-header {
  margin-bottom: 1rem;
}

.form-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;

  h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
  }
}

.worker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.worker-chip {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #e66e00;
  }

  &--selected {
    background: #fff7ed;
    border-color: #e66e00;
    box-shadow: 0 0 0 1px #e66e00;
  }
}

.worker-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.worker-id {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.selection-count {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #e66e00;
  font-weight: 500;
}

.input-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: #374151;
}

.filter-select,
.filter-input {
  width: 100%;
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

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.result-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;

  h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
  }
}

.result-summary {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;

  th,
  td {
    padding: 0.5rem 0.75rem;
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
}

.muted {
  color: #9ca3af;
  font-size: 0.875rem;
}

.error {
  color: #dc2626;
  padding: 0.5rem 0;
}
</style>
