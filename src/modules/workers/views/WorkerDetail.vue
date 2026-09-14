<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { workersApi } from '../api/workers.api'
import type { Worker, UpdateWorkerPayload, Gender } from '../types/worker.types'
import type { Stay, StayStatus } from '@/modules/stays/types/stay.types'
import { BaseButton, BaseInput, BaseBadge, StatusChip } from '@/shared/components'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { formatDate } from '@/shared/utils/formatDate'
import { useEntityLookup } from '@/shared/composables/useEntityLookup'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const auth = useAuthStore()
const lookup = useEntityLookup()

const ACTIVE_STAY_STATUSES: StayStatus[] = ['PLANNED', 'EXPECTED_TODAY', 'CHECKED_IN']

const worker = ref<Worker | null>(null)
const stays = ref<Stay[]>([])
const stayDisplay = ref<Map<string, { propertyName: string; roomNumber: string }>>(new Map())
const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const isEditing = ref(false)

const activeStay = computed(() => stays.value.find((s) => ACTIVE_STAY_STATUSES.includes(s.status)) ?? null)
const activeStayDisplay = computed(() =>
  activeStay.value ? (stayDisplay.value.get(activeStay.value.id) ?? null) : null,
)

async function resolveStayDisplays() {
  await Promise.all(
    stays.value.map(async (s) => {
      const [property, room] = await Promise.all([
        lookup.getProperty(s.propertyId),
        lookup.getRoom(s.propertyId, s.roomId),
      ])
      stayDisplay.value.set(s.id, {
        propertyName: property?.name ?? s.propertyId,
        roomNumber: room?.roomNumber ?? s.roomId,
      })
    }),
  )
}

const editForm = ref<Partial<UpdateWorkerPayload>>({})
const tagsInput = ref('')

const workerId = computed(() => route.params.id as string)

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'MALE', label: t('workers.gender.MALE') },
  { value: 'FEMALE', label: t('workers.gender.FEMALE') },
  { value: 'OTHER', label: t('workers.gender.OTHER') },
]

async function loadWorker() {
  isLoading.value = true
  error.value = ''
  try {
    const [w, stayResponse] = await Promise.all([
      workersApi.getWorker(workerId.value),
      workersApi.getWorkerStays(workerId.value),
    ])
    worker.value = w
    stays.value = stayResponse.content
    await resolveStayDisplays()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load worker'
  } finally {
    isLoading.value = false
  }
}

function startEdit() {
  if (!worker.value) return
  editForm.value = {
    firstName: worker.value.firstName,
    lastName: worker.value.lastName,
    phone: worker.value.phone,
    gender: worker.value.gender,
    status: worker.value.status,
    notes: worker.value.notes,
  }
  tagsInput.value = worker.value.tags.join(', ')
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  isSaving.value = true
  error.value = ''
  try {
    editForm.value.tags = tagsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const updated = await workersApi.updateWorker(workerId.value, editForm.value as UpdateWorkerPayload)
    worker.value = updated
    isEditing.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save worker'
  } finally {
    isSaving.value = false
  }
}

async function deleteWorker() {
  if (!confirm(t('workers.confirmDelete'))) return
  try {
    await workersApi.deleteWorker(workerId.value)
    router.push({ name: 'Workers' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to delete worker'
  }
}

onMounted(loadWorker)
</script>

<template>
  <div class="worker-detail">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'Workers' })"
      >
        {{ t('common.back') }}
      </BaseButton>
    </div>

    <div
      v-if="isLoading"
      class="loading"
    >
      {{ t('common.loading') }}
    </div>
    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>
    <template v-else-if="worker">
      <div class="detail-header">
        <div>
          <h2>{{ worker.firstName }} {{ worker.lastName }}</h2>
          <span class="internal-id">{{ worker.internalId }}</span>
        </div>
        <div class="detail-actions">
          <RouterLink
            v-if="auth.userRole === 'AGENCY_ADMIN'"
            :to="{ name: 'AuditLog', query: { entityType: 'WORKER', entityId: worker.id } }"
            class="audit-link"
          >
            <BaseButton
              variant="ghost"
              size="sm"
            >
              {{ t('audit.viewHistory') }}
            </BaseButton>
          </RouterLink>
          <BaseButton
            v-if="!isEditing"
            variant="secondary"
            size="sm"
            @click="router.push({ name: 'QrBadge', params: { id: worker.id } })"
          >
            {{ t('workers.qrBadge') }}
          </BaseButton>
          <BaseButton
            v-if="!isEditing"
            size="sm"
            @click="startEdit"
          >
            {{ t('common.edit') }}
          </BaseButton>
          <BaseButton
            v-if="!isEditing"
            variant="danger"
            size="sm"
            @click="deleteWorker"
          >
            {{ t('common.delete') }}
          </BaseButton>
        </div>
      </div>

      <!-- View mode -->
      <div
        v-if="!isEditing"
        class="info-card"
      >
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">{{ t('workers.phone') }}</span>
            <span>{{ worker.phone }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('workers.genderLabel') }}</span>
            <span>{{ t(`workers.gender.${worker.gender}`) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('workers.statusLabel') }}</span>
            <BaseBadge
              :variant="worker.status === 'ACTIVE' ? 'success' : worker.status === 'DELETED' ? 'danger' : 'default'"
            >
              {{ t(`workers.status.${worker.status}`) }}
            </BaseBadge>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('workers.tags') }}</span>
            <span>
              <span
                v-for="tag in worker.tags"
                :key="tag"
                class="tag"
              >{{ tag }}</span>
              <span
                v-if="!worker.tags.length"
                class="muted"
              >—</span>
            </span>
          </div>
          <div
            v-if="activeStayDisplay"
            class="info-item"
          >
            <span class="info-label">{{ t('workers.currentProperty') }}</span>
            <span>{{ activeStayDisplay.propertyName }} — {{ t('workers.room') }} {{ activeStayDisplay.roomNumber }}</span>
          </div>
          <div
            v-if="worker.notes"
            class="info-item info-item--full"
          >
            <span class="info-label">{{ t('workers.notes') }}</span>
            <span>{{ worker.notes }}</span>
          </div>
        </div>
      </div>

      <!-- Edit mode -->
      <div
        v-else
        class="info-card"
      >
        <div class="edit-form">
          <BaseInput
            v-model="editForm.firstName!"
            :label="t('workers.firstName')"
            required
          />
          <BaseInput
            v-model="editForm.lastName!"
            :label="t('workers.lastName')"
            required
          />
          <BaseInput
            v-model="editForm.phone!"
            :label="t('workers.phone')"
          />
          <div class="input-group">
            <label class="input-label">{{ t('workers.genderLabel') }}</label>
            <select
              v-model="editForm.gender"
              class="filter-select"
            >
              <option
                v-for="opt in genderOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <BaseInput
            v-model="tagsInput"
            :label="t('workers.tagsHint')"
          />
          <BaseInput
            v-model="editForm.notes!"
            :label="t('workers.notes')"
          />
          <div class="form-actions">
            <BaseButton
              variant="secondary"
              size="sm"
              @click="cancelEdit"
            >
              {{ t('common.cancel') }}
            </BaseButton>
            <BaseButton
              size="sm"
              :loading="isSaving"
              @click="saveEdit"
            >
              {{ t('common.save') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Stay history -->
      <div class="section">
        <h3>{{ t('workers.stayHistory') }}</h3>
        <table
          v-if="stays.length"
          class="stays-table"
        >
          <thead>
            <tr>
              <th>{{ t('workers.property') }}</th>
              <th>{{ t('workers.room') }}</th>
              <th>{{ t('workers.dateFrom') }}</th>
              <th>{{ t('workers.dateTo') }}</th>
              <th>{{ t('workers.statusLabel') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="stay in stays"
              :key="stay.id"
            >
              <td>{{ stayDisplay.get(stay.id)?.propertyName ?? '—' }}</td>
              <td>{{ stayDisplay.get(stay.id)?.roomNumber ?? '—' }}</td>
              <td>{{ formatDate(stay.dateFrom, locale) }}</td>
              <td>{{ formatDate(stay.dateTo, locale) }}</td>
              <td>
                <StatusChip :status="stay.status" />
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-else
          class="muted"
        >
          {{ t('workers.noStays') }}
        </p>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.worker-detail {
  max-width: 900px;
}

.page-header {
  margin-bottom: 1rem;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0 0 0.25rem;
  }
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
}

.internal-id {
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
}

.info-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-item {
  &--full {
    grid-column: 1 / -1;
  }
}

.info-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.tag {
  display: inline-block;
  padding: 0.0625rem 0.375rem;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.muted {
  color: #9ca3af;
}

.edit-form {
  max-width: 480px;
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

.filter-select {
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
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.section {
  margin-top: 2rem;

  h3 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
  }
}

.stays-table {
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

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #dc2626;
}
</style>
