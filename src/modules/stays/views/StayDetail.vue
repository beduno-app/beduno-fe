<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStaysStore } from '../store/stays.store'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { useConflicts } from '../composables/useConflicts'
import type { UpdateStayPayload, ConstraintViolationResponse } from '../types/stay.types'
import { BaseButton, BaseBadge, StatusChip } from '@/shared/components'
import ConflictBanner from '../components/ConflictBanner.vue'
import { AxiosError } from 'axios'
import { useAuthStore } from '@/modules/auth/store/auth.store'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const staysStore = useStaysStore()
const propertiesStore = usePropertiesStore()
const conflicts = useConflicts()

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const isEditing = ref(false)

const editForm = ref<UpdateStayPayload>({})

const auth = useAuthStore()
const stayId = computed(() => route.params.id as string)
const stay = computed(() => staysStore.currentStay)
const canEdit = computed(() => stay.value?.status === 'PLANNED')

async function loadStay() {
  isLoading.value = true
  error.value = ''
  try {
    await staysStore.fetchStay(stayId.value)
    if (stay.value) {
      await propertiesStore.fetchRooms(stay.value.property.id)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load stay'
  } finally {
    isLoading.value = false
  }
}

function startEdit() {
  if (!stay.value) return
  editForm.value = {
    roomId: stay.value.room.id,
    dateFrom: stay.value.dateFrom,
    dateTo: stay.value.dateTo ?? undefined,
  }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  conflicts.clear()
}

function isConstraintViolation(data: unknown): data is ConstraintViolationResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    (data as Record<string, unknown>).error === 'CONSTRAINT_VIOLATION'
  )
}

async function saveEdit() {
  isSaving.value = true
  error.value = ''
  conflicts.clear()

  try {
    await staysStore.updateStay(stayId.value, editForm.value)
    isEditing.value = false
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 422) {
      const data = e.response.data
      if (isConstraintViolation(data)) {
        conflicts.setServerViolations(data.hardViolations, data.softViolations)
        return
      }
    }
    error.value = e instanceof Error ? e.message : 'Failed to update stay'
  } finally {
    isSaving.value = false
  }
}

async function cancelStay() {
  if (!confirm(t('stays.confirmCancel'))) return
  try {
    await staysStore.cancelStay(stayId.value)
    router.push({ name: 'Stays' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to cancel stay'
  }
}

onMounted(loadStay)
</script>

<template>
  <div class="stay-detail">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'Stays' })"
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
    <template v-else-if="stay">
      <div class="detail-header">
        <div>
          <h2>{{ stay.worker.lastName }}, {{ stay.worker.firstName }}</h2>
          <span class="sub-info">{{ stay.worker.internalId }} — {{ stay.property.name }}</span>
        </div>
        <div class="detail-actions">
          <StatusChip :status="stay.status" />
          <RouterLink
            v-if="auth.userRole === 'AGENCY_ADMIN'"
            :to="{ name: 'AuditLog', query: { entityType: 'STAY', entityId: stay.id } }"
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
            v-if="canEdit && !isEditing"
            size="sm"
            @click="startEdit"
          >
            {{ t('common.edit') }}
          </BaseButton>
          <BaseButton
            v-if="canEdit && !isEditing"
            variant="danger"
            size="sm"
            @click="cancelStay"
          >
            {{ t('stays.cancelStay') }}
          </BaseButton>
        </div>
      </div>

      <ConflictBanner
        :hard-violations="conflicts.hardViolations.value"
        :soft-violations="conflicts.softViolations.value"
      />

      <!-- View mode -->
      <div
        v-if="!isEditing"
        class="info-card"
      >
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">{{ t('stays.worker') }}</span>
            <span>{{ stay.worker.lastName }}, {{ stay.worker.firstName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('stays.property') }}</span>
            <span>{{ stay.property.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('stays.room') }}</span>
            <span>{{ stay.room.roomNumber }} ({{ stay.room.availableSpots }}/{{ stay.room.capacity }})</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('stays.statusLabel') }}</span>
            <StatusChip :status="stay.status" />
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('stays.dateFrom') }}</span>
            <span>{{ stay.dateFrom }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('stays.dateTo') }}</span>
            <span>{{ stay.dateTo ?? '—' }}</span>
          </div>
          <div
            v-if="stay.overrideReason"
            class="info-item info-item--full"
          >
            <span class="info-label">{{ t('stays.overrideReason') }}</span>
            <span>{{ stay.overrideReason }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('stays.createdBy') }}</span>
            <span>{{ stay.createdBy.firstName }} {{ stay.createdBy.lastName }}</span>
          </div>
          <div
            v-if="stay.confirmedBy"
            class="info-item"
          >
            <span class="info-label">{{ t('stays.confirmedBy') }}</span>
            <span>{{ stay.confirmedBy.firstName }} {{ stay.confirmedBy.lastName }}</span>
          </div>
        </div>
      </div>

      <!-- Edit mode -->
      <div
        v-else
        class="info-card"
      >
        <div class="edit-form">
          <div class="input-group">
            <label class="input-label">{{ t('stays.room') }}</label>
            <select
              v-model="editForm.roomId"
              class="filter-select"
            >
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
                v-model="editForm.dateFrom"
                type="date"
                class="filter-input"
              >
            </div>
            <div class="input-group">
              <label class="input-label">{{ t('stays.dateTo') }}</label>
              <input
                v-model="editForm.dateTo"
                type="date"
                class="filter-input"
              >
            </div>
          </div>

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
    </template>
  </div>
</template>

<style scoped lang="scss">
.stay-detail {
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
  align-items: center;
}

.sub-info {
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
}

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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
