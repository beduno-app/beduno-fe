<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { propertiesApi } from '../api/properties.api'
import type { Room, CreateRoomPayload, UpdateRoomPayload, RoomGenderRule } from '../types/property.types'
import { BaseButton, BaseInput, BaseModal } from '@/shared/components'

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
  capacity: 4,
  genderRule: 'MIXED' as RoomGenderRule,
  floor: 1,
  notes: '',
  blockedSpots: 0,
})

const blockReason = ref('')
const isSaving = ref(false)
const isDeleting = ref(false)
const error = ref('')

const genderRuleOptions: { value: RoomGenderRule; label: string }[] = [
  { value: 'MALE_ONLY', label: t('properties.roomGender.MALE_ONLY') },
  { value: 'FEMALE_ONLY', label: t('properties.roomGender.FEMALE_ONLY') },
  { value: 'MIXED', label: t('properties.roomGender.MIXED') },
]

onMounted(() => {
  if (props.room) {
    form.value = {
      roomNumber: props.room.roomNumber,
      capacity: props.room.capacity,
      genderRule: props.room.genderRule,
      floor: props.room.floor,
      notes: props.room.notes,
      blockedSpots: props.room.blockedSpots,
    }
  }
})

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
        capacity: form.value.capacity,
        genderRule: form.value.genderRule,
        floor: form.value.floor,
        notes: form.value.notes || undefined,
        blockedSpots: form.value.blockedSpots,
      }
      await propertiesApi.updateRoom(props.propertyId, props.room.id, payload)
    } else {
      const payload: CreateRoomPayload = {
        roomNumber: form.value.roomNumber,
        capacity: form.value.capacity,
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

function incrementBlocked() {
  if (form.value.blockedSpots < form.value.capacity) {
    form.value.blockedSpots++
  }
}

function decrementBlocked() {
  if (form.value.blockedSpots > 0) {
    form.value.blockedSpots--
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
        <label class="input-label">{{ t('properties.capacity') }}</label>
        <input
          v-model.number="form.capacity"
          type="number"
          min="1"
          class="number-input"
        >
      </div>
      <div class="input-group">
        <label class="input-label">{{ t('properties.floor') }}</label>
        <input
          v-model.number="form.floor"
          type="number"
          min="0"
          class="number-input"
        >
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

    <!-- Block/unblock -->
    <div
      v-if="isEdit"
      class="block-section"
    >
      <label class="input-label">{{ t('properties.blockedSpots') }}</label>
      <div class="block-controls">
        <button
          class="block-btn"
          :disabled="form.blockedSpots === 0"
          @click="decrementBlocked"
        >
          −
        </button>
        <span class="block-value">{{ form.blockedSpots }}</span>
        <button
          class="block-btn"
          :disabled="form.blockedSpots >= form.capacity"
          @click="incrementBlocked"
        >
          +
        </button>
        <span class="block-hint">/ {{ form.capacity }}</span>
      </div>
      <BaseInput
        v-if="form.blockedSpots > 0"
        v-model="blockReason"
        :label="t('properties.blockReason')"
        :placeholder="t('properties.blockReasonPlaceholder')"
      />
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

.block-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.block-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.block-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #f3f4f6;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.block-value {
  font-size: 1.125rem;
  font-weight: 700;
  min-width: 1.5rem;
  text-align: center;
}

.block-hint {
  font-size: 0.875rem;
  color: #9ca3af;
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

.error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
</style>
