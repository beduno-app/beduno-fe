<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { BaseButton } from '@/shared/components'
import type { NoShowReason } from '../types/arrival.types'

defineProps<{
  stayId: string
}>()

const emit = defineEmits<{
  confirm: [reason: NoShowReason, note: string]
  cancel: []
}>()

const { t } = useI18n()

const reasons: NoShowReason[] = [
  'DID_NOT_ARRIVE',
  'REFUSED_ROOM',
  'SENT_ELSEWHERE',
  'CANCELLED_BY_AGENCY',
  'OTHER',
]

const selectedReason = ref<NoShowReason>('DID_NOT_ARRIVE')
const note = ref('')

function submit() {
  emit('confirm', selectedReason.value, note.value)
}
</script>

<template>
  <div class="no-show-action">
    <h3 class="no-show-title">
      {{ t('arrivals.noShowTitle') }}
    </h3>

    <div class="input-group">
      <label class="input-label">{{ t('arrivals.noShowReason') }}</label>
      <select
        v-model="selectedReason"
        class="filter-select"
      >
        <option
          v-for="r in reasons"
          :key="r"
          :value="r"
        >
          {{ t(`arrivals.noShowReasons.${r}`) }}
        </option>
      </select>
    </div>

    <div class="input-group">
      <label class="input-label">{{ t('arrivals.notePlaceholder') }}</label>
      <textarea
        v-model="note"
        class="note-input"
        rows="2"
      />
    </div>

    <div class="form-actions">
      <BaseButton
        variant="secondary"
        size="sm"
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </BaseButton>
      <BaseButton
        variant="danger"
        size="sm"
        @click="submit"
      >
        {{ t('arrivals.confirmNoShow') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.no-show-action {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-show-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.input-group {
  margin-bottom: 0.75rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: #374151;
}

.filter-select,
.note-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #fff;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #e66e00;
    box-shadow: 0 0 0 2px rgba(230, 110, 0, 0.15);
  }
}

.note-input {
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
