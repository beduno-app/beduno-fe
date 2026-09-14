<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStaysStore } from '../store/stays.store'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { useWorkersStore } from '@/modules/workers/store/workers.store'
import { useConflicts } from '../composables/useConflicts'
import type { ActiveStayInfo } from '../composables/useConflicts'
import type { StayCreatePayload, ConstraintViolationResponse, StayStatus } from '../types/stay.types'
import { BaseButton, BaseInput } from '@/shared/components'
import ConflictBanner from '../components/ConflictBanner.vue'
import { AxiosError } from 'axios'
import { staysApi } from '../api/stays.api'
import { useEntityLookup } from '@/shared/composables/useEntityLookup'

const ACTIVE_STAY_STATUSES: StayStatus[] = ['PLANNED', 'EXPECTED_TODAY', 'CHECKED_IN']

const router = useRouter()
const { t } = useI18n()
const staysStore = useStaysStore()
const propertiesStore = usePropertiesStore()
const workersStore = useWorkersStore()
const conflicts = useConflicts()
const lookup = useEntityLookup()

const form = ref<StayCreatePayload>({
  workerId: '',
  propertyId: '',
  roomId: '',
  dateFrom: '',
  dateTo: '',
})
const overrideReason = ref('')
const isSaving = ref(false)
const error = ref('')
const showOverride = ref(false)

const selectedWorker = computed(() =>
  workersStore.workers.find((w) => w.id === form.value.workerId) ?? null,
)
const selectedRoom = computed(() =>
  propertiesStore.rooms.find((r) => r.id === form.value.roomId) ?? null,
)
const selectedProperty = computed(() =>
  propertiesStore.properties.find((p) => p.id === form.value.propertyId) ?? null,
)

watch(
  () => form.value.propertyId,
  (propertyId) => {
    form.value.roomId = ''
    if (propertyId) {
      propertiesStore.fetchRooms(propertyId)
    }
  },
)

async function resolveActiveStay(workerId: string): Promise<ActiveStayInfo | null> {
  const response = await staysApi.getStays({ workerId })
  const active = response.content.find((s) => ACTIVE_STAY_STATUSES.includes(s.status))
  if (!active) return null
  const [property, room] = await Promise.all([
    lookup.getProperty(active.propertyId),
    lookup.getRoom(active.propertyId, active.roomId),
  ])
  return {
    propertyName: property?.name ?? active.propertyId,
    roomNumber: room?.roomNumber ?? active.roomId,
  }
}

// Live pre-submit validation on form changes
watch(
  [selectedWorker, selectedRoom, selectedProperty],
  async () => {
    showOverride.value = false
    overrideReason.value = ''
    const workerActiveStay = selectedWorker.value
      ? await resolveActiveStay(selectedWorker.value.id)
      : null
    conflicts.validate({
      worker: selectedWorker.value,
      room: selectedRoom.value,
      workerActiveStay,
      propertyStatus: selectedProperty.value?.status,
    })
  },
)

function isConstraintViolation(data: unknown): data is ConstraintViolationResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    (data as Record<string, unknown>).error === 'CONSTRAINT_VIOLATION'
  )
}

async function save() {
  isSaving.value = true
  error.value = ''

  if (conflicts.isBlocked.value) {
    isSaving.value = false
    return
  }

  try {
    const payload: StayCreatePayload = { ...form.value }
    if (showOverride.value && overrideReason.value) {
      payload.overrideReason = overrideReason.value
    }
    const stay = await staysStore.createStay(payload)
    router.push({ name: 'StayDetail', params: { id: stay.id } })
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 422) {
      const data = e.response.data
      if (isConstraintViolation(data)) {
        conflicts.setServerViolations(data.hardViolations, data.softViolations)
        if (!data.hardViolations.length && data.softViolations.length) {
          showOverride.value = true
        }
        return
      }
    }
    error.value = e instanceof Error ? e.message : 'Failed to create stay'
  } finally {
    isSaving.value = false
  }
}

// Load data for dropdowns
workersStore.fetchWorkers()
propertiesStore.fetchProperties()
</script>

<template>
  <div class="create-stay">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'Stays' })"
      >
        {{ t('common.back') }}
      </BaseButton>
    </div>

    <h2>{{ t('stays.addStay') }}</h2>

    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <ConflictBanner
      :hard-violations="conflicts.hardViolations.value"
      :soft-violations="conflicts.softViolations.value"
    />

    <div class="form-card">
      <div class="input-group">
        <label class="input-label">{{ t('stays.worker') }}</label>
        <select
          v-model="form.workerId"
          class="filter-select"
        >
          <option value="">
            {{ t('stays.selectWorker') }}
          </option>
          <option
            v-for="w in workersStore.workers"
            :key="w.id"
            :value="w.id"
          >
            {{ w.lastName }}, {{ w.firstName }} ({{ w.internalId }})
          </option>
        </select>
      </div>

      <div class="input-group">
        <label class="input-label">{{ t('stays.property') }}</label>
        <select
          v-model="form.propertyId"
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
          v-model="form.roomId"
          class="filter-select"
          :disabled="!form.propertyId"
        >
          <option value="">
            {{ t('stays.selectRoom') }}
          </option>
          <option
            v-for="r in propertiesStore.rooms"
            :key="r.id"
            :value="r.id"
          >
            {{ r.roomNumber }} ({{ r.availableBedCount }}/{{ r.bedCount }})
          </option>
        </select>
      </div>

      <div class="date-row">
        <div class="input-group">
          <label class="input-label">{{ t('stays.dateFrom') }}</label>
          <input
            v-model="form.dateFrom"
            type="date"
            class="filter-input"
          >
        </div>
        <div class="input-group">
          <label class="input-label">{{ t('stays.dateTo') }}</label>
          <input
            v-model="form.dateTo"
            type="date"
            class="filter-input"
          >
        </div>
      </div>

      <div
        v-if="showOverride"
        class="override-section"
      >
        <BaseInput
          v-model="overrideReason"
          :label="t('stays.overrideReason')"
          :placeholder="t('stays.overrideReasonPlaceholder')"
          required
        />
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
          @click="save"
        >
          {{ showOverride ? t('stays.confirmOverride') : t('common.save') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.create-stay {
  max-width: 600px;
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

.override-section {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #fde68a;
  background: #fffbeb;
  margin: 0 -1.5rem;
  padding: 1rem 1.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.error {
  color: #dc2626;
  padding: 0.5rem 0;
}
</style>
