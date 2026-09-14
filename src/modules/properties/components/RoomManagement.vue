<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { propertiesApi } from '../api/properties.api'
import type {
  Room,
  Bed,
  CreateRoomPayload,
  UpdateRoomPayload,
  RoomGenderRule,
  RoomStatus,
} from '../types/property.types'
import { BaseButton, BaseInput, BaseModal, BaseBadge } from '@/shared/components'

const props = defineProps<{
  propertyId: string
  room: Room | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { t } = useI18n()

const isEdit = computed(() => !!props.room)

const form = ref({
  roomNumber: '',
  genderRule: 'MIXED' as RoomGenderRule,
  floor: 1,
  notes: '',
  status: 'ACTIVE' as RoomStatus,
})

const isSaving = ref(false)
const isDeleting = ref(false)
const error = ref('')

const beds = ref<Bed[]>([])
const isLoadingBeds = ref(false)
const bedError = ref('')
const newBedLabel = ref('')
const bulkGenerateCount = ref(4)
const editingBedId = ref<string | null>(null)
const editingBedLabel = ref('')

const genderRuleOptions: { value: RoomGenderRule; label: string }[] = [
  { value: 'MALE_ONLY', label: t('properties.roomGender.MALE_ONLY') },
  { value: 'FEMALE_ONLY', label: t('properties.roomGender.FEMALE_ONLY') },
  { value: 'MIXED', label: t('properties.roomGender.MIXED') },
]

onMounted(() => {
  if (props.room) {
    form.value = {
      roomNumber: props.room.roomNumber,
      genderRule: props.room.genderRule,
      floor: props.room.floor,
      notes: props.room.notes,
      status: props.room.status,
    }
    loadBeds()
  }
})

async function loadBeds() {
  if (!props.room) return
  isLoadingBeds.value = true
  bedError.value = ''
  try {
    beds.value = await propertiesApi.getBeds(props.propertyId, props.room.id)
  } catch (e) {
    bedError.value = e instanceof Error ? e.message : 'Failed to load beds'
  } finally {
    isLoadingBeds.value = false
  }
}

async function save() {
  if (!navigator.onLine) {
    error.value = t('offline.roomOnlineOnly')
    return
  }
  isSaving.value = true
  error.value = ''
  try {
    if (isEdit.value && props.room) {
      const payload: UpdateRoomPayload = {
        roomNumber: form.value.roomNumber,
        genderRule: form.value.genderRule,
        floor: form.value.floor,
        notes: form.value.notes || undefined,
        status: form.value.status,
      }
      await propertiesApi.updateRoom(props.propertyId, props.room.id, payload)
    } else {
      const payload: CreateRoomPayload = {
        roomNumber: form.value.roomNumber,
        genderRule: form.value.genderRule,
        floor: form.value.floor,
        notes: form.value.notes || undefined,
      }
      await propertiesApi.createRoom(props.propertyId, payload)
    }
    emit('saved')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save room'
  } finally {
    isSaving.value = false
  }
}

async function deleteRoom() {
  if (!props.room) return
  if (!navigator.onLine) {
    error.value = t('offline.roomOnlineOnly')
    return
  }
  if (!confirm(t('properties.confirmDeleteRoom'))) return
  isDeleting.value = true
  error.value = ''
  try {
    await propertiesApi.deleteRoom(props.propertyId, props.room.id)
    emit('saved')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to delete room'
  } finally {
    isDeleting.value = false
  }
}

async function addBed() {
  if (!props.room || !newBedLabel.value.trim()) return
  bedError.value = ''
  try {
    const bed = await propertiesApi.createBed(props.propertyId, props.room.id, {
      label: newBedLabel.value.trim(),
    })
    beds.value.push(bed)
    newBedLabel.value = ''
  } catch (e) {
    bedError.value = e instanceof Error ? e.message : 'Failed to add bed'
  }
}

async function bulkGenerate() {
  if (!props.room || bulkGenerateCount.value < 1) return
  bedError.value = ''
  try {
    const created = await propertiesApi.bulkGenerateBeds(props.propertyId, props.room.id, {
      count: bulkGenerateCount.value,
    })
    beds.value.push(...created)
  } catch (e) {
    bedError.value = e instanceof Error ? e.message : 'Failed to generate beds'
  }
}

function startRenameBed(bed: Bed) {
  editingBedId.value = bed.id
  editingBedLabel.value = bed.label
}

async function saveRenameBed(bed: Bed) {
  if (!props.room) return
  bedError.value = ''
  try {
    const updated = await propertiesApi.updateBed(props.propertyId, props.room.id, bed.id, {
      label: editingBedLabel.value.trim() || bed.label,
      status: bed.status,
    })
    const idx = beds.value.findIndex((b) => b.id === bed.id)
    if (idx !== -1) beds.value[idx] = updated
  } catch (e) {
    bedError.value = e instanceof Error ? e.message : 'Failed to rename bed'
  } finally {
    editingBedId.value = null
  }
}

async function toggleBedStatus(bed: Bed) {
  if (!props.room) return
  bedError.value = ''
  try {
    const updated = await propertiesApi.updateBed(props.propertyId, props.room.id, bed.id, {
      label: bed.label,
      status: bed.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE',
    })
    const idx = beds.value.findIndex((b) => b.id === bed.id)
    if (idx !== -1) beds.value[idx] = updated
  } catch (e) {
    bedError.value = e instanceof Error ? e.message : 'Failed to update bed'
  }
}

async function deleteBed(bed: Bed) {
  if (!props.room) return
  if (!confirm(t('properties.confirmDeleteBed'))) return
  bedError.value = ''
  try {
    await propertiesApi.deleteBed(props.propertyId, props.room.id, bed.id)
    beds.value = beds.value.filter((b) => b.id !== bed.id)
  } catch (e) {
    bedError.value = e instanceof Error ? e.message : 'Failed to delete bed'
  }
}
</script>

<template>
  <BaseModal
    :title="isEdit ? t('properties.editRoom') : t('properties.addRoom')"
    @close="emit('close')"
  >
    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <BaseInput
      v-model="form.roomNumber"
      :label="t('properties.roomNumber')"
      required
    />

    <div class="form-row">
      <div class="input-group">
        <label class="input-label">{{ t('properties.floor') }}</label>
        <input
          v-model.number="form.floor"
          type="number"
          min="0"
          class="number-input"
        >
      </div>
      <div
        v-if="isEdit"
        class="input-group"
      >
        <label class="input-label">{{ t('properties.statusLabel') }}</label>
        <select
          v-model="form.status"
          class="filter-select"
        >
          <option value="ACTIVE">
            {{ t('properties.status.ACTIVE') }}
          </option>
          <option value="BLOCKED">
            {{ t('properties.status.BLOCKED') }}
          </option>
        </select>
      </div>
    </div>

    <div class="input-group">
      <label class="input-label">{{ t('properties.genderRuleLabel') }}</label>
      <select
        v-model="form.genderRule"
        class="filter-select"
      >
        <option
          v-for="opt in genderRuleOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>

    <BaseInput
      v-model="form.notes"
      :label="t('properties.notes')"
    />

    <!-- Beds -->
    <div
      v-if="isEdit"
      class="beds-section"
    >
      <label class="input-label">{{ t('properties.beds') }} ({{ room?.currentOccupancy ?? 0 }}/{{ beds.length }})</label>

      <div
        v-if="bedError"
        class="error"
      >
        {{ bedError }}
      </div>

      <div
        v-if="isLoadingBeds"
        class="muted"
      >
        {{ t('common.loading') }}
      </div>
      <div
        v-else
        class="bed-list"
      >
        <div
          v-for="bed in beds"
          :key="bed.id"
          class="bed-row"
        >
          <template v-if="editingBedId === bed.id">
            <input
              v-model="editingBedLabel"
              class="bed-label-input"
              @keyup.enter="saveRenameBed(bed)"
            >
            <BaseButton
              size="sm"
              variant="secondary"
              @click="saveRenameBed(bed)"
            >
              {{ t('common.save') }}
            </BaseButton>
          </template>
          <template v-else>
            <span
              class="bed-label"
              @click="startRenameBed(bed)"
            >{{ bed.label }}</span>
            <BaseBadge :variant="bed.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ t(`properties.status.${bed.status}`) }}
            </BaseBadge>
            <button
              class="bed-action"
              @click="toggleBedStatus(bed)"
            >
              {{ bed.status === 'ACTIVE' ? t('properties.blockBed') : t('properties.unblockBed') }}
            </button>
            <button
              class="bed-action bed-action--danger"
              @click="deleteBed(bed)"
            >
              {{ t('common.delete') }}
            </button>
          </template>
        </div>
        <p
          v-if="!beds.length"
          class="muted"
        >
          {{ t('properties.noBeds') }}
        </p>
      </div>

      <div class="bed-add-row">
        <input
          v-model="newBedLabel"
          class="bed-label-input"
          :placeholder="t('properties.bedLabelPlaceholder')"
          @keyup.enter="addBed"
        >
        <BaseButton
          size="sm"
          variant="secondary"
          @click="addBed"
        >
          {{ t('properties.addBed') }}
        </BaseButton>
      </div>
      <div class="bed-add-row">
        <input
          v-model.number="bulkGenerateCount"
          type="number"
          min="1"
          class="number-input number-input--sm"
        >
        <BaseButton
          size="sm"
          variant="secondary"
          @click="bulkGenerate"
        >
          {{ t('properties.bulkGenerateBeds') }}
        </BaseButton>
      </div>
    </div>

    <!-- Occupants (read-only) -->
    <div
      v-if="isEdit && room && room.occupants.length"
      class="occupants-section"
    >
      <label class="input-label">{{ t('properties.currentOccupants') }}</label>
      <div
        v-for="occ in room.occupants"
        :key="occ.stayId"
        class="occupant-row"
      >
        <span class="occupant-name">{{ occ.worker.firstName }} {{ occ.worker.lastName }}</span>
        <span class="occupant-id">{{ occ.worker.internalId }}</span>
        <span class="occupant-dates">{{ occ.dateFrom }} → {{ occ.dateTo ?? '∞' }}</span>
      </div>
    </div>

    <template #footer>
      <BaseButton
        v-if="isEdit"
        variant="danger"
        size="sm"
        :loading="isDeleting"
        @click="deleteRoom"
      >
        {{ t('common.delete') }}
      </BaseButton>
      <div class="spacer" />
      <BaseButton
        variant="secondary"
        size="sm"
        @click="emit('close')"
      >
        {{ t('common.cancel') }}
      </BaseButton>
      <BaseButton
        size="sm"
        :loading="isSaving"
        @click="save"
      >
        {{ t('common.save') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped lang="scss">
.form-row {
  display: flex;
  gap: 1rem;
}

.input-group {
  margin-bottom: 1rem;
  flex: 1;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: #374151;
}

.number-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #e66e00;
    box-shadow: 0 0 0 2px rgba(230, 110, 0, 0.15);
  }
}

.number-input--sm {
  width: 5rem;
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

.beds-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.bed-list {
  margin: 0.5rem 0;
}

.bed-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.bed-label {
  font-weight: 600;
  cursor: pointer;
  min-width: 3rem;
}

.bed-label-input {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  flex: 1;
}

.bed-action {
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
  margin-left: auto;

  &--danger {
    color: #dc2626;
  }
}

.bed-add-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.occupants-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.occupant-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.375rem 0;
  font-size: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
}

.occupant-name {
  font-weight: 600;
}

.occupant-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
}

.occupant-dates {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-left: auto;
}

.spacer {
  flex: 1;
}

.muted {
  color: #9ca3af;
  font-size: 0.875rem;
}

.error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
</style>
