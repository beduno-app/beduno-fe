<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RoomInspection, PresenceStatus, DiscrepancyReason } from '../types/inspection.types'
import { BaseButton } from '@/shared/components'

defineProps<{
  room: RoomInspection
}>()

const emit = defineEmits<{
  'mark-presence': [stayId: string, presence: PresenceStatus, reason?: DiscrepancyReason, note?: string]
  'add-unexpected': [description: string, reason: DiscrepancyReason, note?: string]
  verify: []
}>()

const { t } = useI18n()

const discrepancyReasons: DiscrepancyReason[] = [
  'WORKER_NOT_FOUND',
  'WRONG_ROOM',
  'LEFT_EARLY',
  'ARRIVED_LATE',
  'UNAUTHORIZED_GUEST',
  'OTHER',
]

// Absent reason state per occupant
const absentData = ref<Record<string, { reason: DiscrepancyReason; note: string }>>({})

function markPresent(stayId: string) {
  emit('mark-presence', stayId, 'PRESENT')
}

function showAbsentForm(stayId: string) {
  absentData.value[stayId] = { reason: 'WORKER_NOT_FOUND', note: '' }
}

function confirmAbsent(stayId: string) {
  const data = absentData.value[stayId]
  if (!data) return
  emit('mark-presence', stayId, 'ABSENT', data.reason, data.note || undefined)
  delete absentData.value[stayId]
}

function cancelAbsent(stayId: string) {
  delete absentData.value[stayId]
}

// Unexpected presence form
const showUnexpectedForm = ref(false)
const unexpectedDesc = ref('')
const unexpectedReason = ref<DiscrepancyReason>('UNAUTHORIZED_GUEST')
const unexpectedNote = ref('')

function addUnexpected() {
  if (!unexpectedDesc.value) return
  emit('add-unexpected', unexpectedDesc.value, unexpectedReason.value, unexpectedNote.value || undefined)
  showUnexpectedForm.value = false
  unexpectedDesc.value = ''
  unexpectedNote.value = ''
}
</script>

<template>
  <div class="room-inspection">
    <div class="room-header">
      <h3 class="room-number">
        {{ room.room.roomNumber }}
      </h3>
      <span
        v-if="room.verified"
        class="verified-badge"
      >
        {{ t('inspection.verified') }}
      </span>
    </div>

    <!-- Expected occupants -->
    <div class="occupants-section">
      <h4 class="section-label">
        {{ t('inspection.expected') }} ({{ room.expected.length }})
      </h4>
      <div
        v-for="occ in room.expected"
        :key="occ.stayId"
        class="occupant-row"
        :class="`occupant-row--${occ.presence.toLowerCase()}`"
      >
        <div class="occupant-info">
          <span class="occupant-name">{{ occ.worker.lastName }}, {{ occ.worker.firstName }}</span>
          <span class="occupant-id">{{ occ.worker.internalId }}</span>
          <span
            v-if="occ.presence !== 'UNCHECKED'"
            class="presence-label"
            :class="`presence-label--${occ.presence.toLowerCase()}`"
          >
            {{ t(`inspection.presence.${occ.presence}`) }}
          </span>
          <span
            v-if="occ.discrepancyReason"
            class="discrepancy-tag"
          >
            {{ t(`inspection.reasons.${occ.discrepancyReason}`) }}
          </span>
        </div>

        <div
          v-if="occ.presence === 'UNCHECKED' && !absentData[occ.stayId]"
          class="check-actions"
        >
          <BaseButton
            size="sm"
            @click="markPresent(occ.stayId)"
          >
            {{ t('inspection.present') }}
          </BaseButton>
          <BaseButton
            variant="danger"
            size="sm"
            @click="showAbsentForm(occ.stayId)"
          >
            {{ t('inspection.absent') }}
          </BaseButton>
        </div>

        <!-- Absent reason form -->
        <div
          v-if="absentData[occ.stayId]"
          class="absent-form"
        >
          <select
            v-model="absentData[occ.stayId].reason"
            class="form-select"
          >
            <option
              v-for="r in discrepancyReasons"
              :key="r"
              :value="r"
            >
              {{ t(`inspection.reasons.${r}`) }}
            </option>
          </select>
          <input
            v-model="absentData[occ.stayId].note"
            type="text"
            class="form-input"
            :placeholder="t('inspection.notePlaceholder')"
          >
          <div class="absent-form-actions">
            <BaseButton
              variant="danger"
              size="sm"
              @click="confirmAbsent(occ.stayId)"
            >
              {{ t('common.confirm') }}
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="cancelAbsent(occ.stayId)"
            >
              {{ t('common.cancel') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Unexpected presences -->
    <div class="unexpected-section">
      <h4 class="section-label">
        {{ t('inspection.unexpected') }} ({{ room.unexpected.length }})
      </h4>
      <div
        v-for="u in room.unexpected"
        :key="u.id"
        class="unexpected-item"
      >
        <span>{{ u.description }}</span>
        <span class="discrepancy-tag">{{ t(`inspection.reasons.${u.reason}`) }}</span>
      </div>

      <div
        v-if="showUnexpectedForm"
        class="unexpected-form"
      >
        <input
          v-model="unexpectedDesc"
          type="text"
          class="form-input"
          :placeholder="t('inspection.unexpectedDescPlaceholder')"
        >
        <select
          v-model="unexpectedReason"
          class="form-select"
        >
          <option
            v-for="r in discrepancyReasons"
            :key="r"
            :value="r"
          >
            {{ t(`inspection.reasons.${r}`) }}
          </option>
        </select>
        <input
          v-model="unexpectedNote"
          type="text"
          class="form-input"
          :placeholder="t('inspection.notePlaceholder')"
        >
        <div class="unexpected-form-actions">
          <BaseButton
            size="sm"
            @click="addUnexpected"
          >
            {{ t('common.confirm') }}
          </BaseButton>
          <BaseButton
            variant="ghost"
            size="sm"
            @click="showUnexpectedForm = false"
          >
            {{ t('common.cancel') }}
          </BaseButton>
        </div>
      </div>

      <BaseButton
        v-if="!showUnexpectedForm"
        variant="ghost"
        size="sm"
        @click="showUnexpectedForm = true"
      >
        {{ t('inspection.addUnexpected') }}
      </BaseButton>
    </div>

    <!-- Verify button -->
    <div
      v-if="!room.verified"
      class="verify-section"
    >
      <BaseButton
        size="sm"
        @click="emit('verify')"
      >
        {{ t('inspection.markVerified') }}
      </BaseButton>
    </div>
    <div
      v-else
      class="verified-info"
    >
      {{ t('inspection.verifiedAt') }}: {{ room.verifiedAt }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.room-inspection {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.room-number {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1875rem 0.625rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: #dcfce7;
  color: #166534;
}

.section-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin: 0 0 0.5rem;
}

.occupant-row {
  padding: 0.625rem 0;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:last-child {
    border-bottom: none;
  }

  &--present {
    opacity: 0.7;
  }

  &--absent {
    background: #fef2f2;
    margin: 0 -0.5rem;
    padding: 0.625rem 0.5rem;
    border-radius: 0.25rem;
  }
}

.occupant-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.occupant-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.occupant-id {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
}

.presence-label {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;

  &--present {
    background: #dcfce7;
    color: #166534;
  }

  &--absent {
    background: #fee2e2;
    color: #991b1b;
  }
}

.discrepancy-tag {
  font-size: 0.6875rem;
  background: #fef3c7;
  color: #92400e;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
}

.check-actions {
  display: flex;
  gap: 0.375rem;
}

.absent-form {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.5rem;
  background: #fef2f2;
  border-radius: 0.375rem;
}

.absent-form-actions {
  display: flex;
  gap: 0.375rem;
}

.unexpected-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.unexpected-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.875rem;
}

.unexpected-form {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0.5rem 0;
}

.unexpected-form-actions {
  display: flex;
  gap: 0.375rem;
}

.form-select,
.form-input {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #e66e00;
    box-shadow: 0 0 0 2px rgba(230, 110, 0, 0.15);
  }
}

.verify-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.verified-info {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.8125rem;
  color: #166534;
}
</style>
