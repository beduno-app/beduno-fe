<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { InspectionRoomEntry, OccupantSummary } from '../types/inspection.types'
import { BaseButton } from '@/shared/components'
import { workersApi } from '@/modules/workers/api/workers.api'

const props = defineProps<{
  room: InspectionRoomEntry
  presentWorkerIds: Set<string>
  unexpectedWorkerIds: string[]
  verified: boolean
}>()

const emit = defineEmits<{
  'toggle-presence': [workerId: string, present: boolean]
  'add-unexpected': [workerId: string]
  'remove-unexpected': [workerId: string]
  verify: []
}>()

const { t } = useI18n()

const showUnexpectedSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref<{ id: string; internalId: string; firstName: string; lastName: string }[]>([])
const searchError = ref('')

// Expected occupants plus already-checked-in occupants not in the expected
// list (e.g. checked in outside the planned window) form the roster shown.
function displayOccupants(): OccupantSummary[] {
  const seen = new Set(props.room.expectedOccupants.map((o) => o.workerId))
  const extra = props.room.checkedInOccupants.filter((o) => !seen.has(o.workerId))
  return [...props.room.expectedOccupants, ...extra]
}

async function runSearch() {
  searchError.value = ''
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  try {
    const response = await workersApi.getWorkers({ search: searchQuery.value.trim(), size: 5 })
    searchResults.value = response.content
  } catch (e) {
    searchError.value = e instanceof Error ? e.message : 'Search failed'
  }
}

function pickUnexpected(workerId: string) {
  emit('add-unexpected', workerId)
  showUnexpectedSearch.value = false
  searchQuery.value = ''
  searchResults.value = []
}
</script>

<template>
  <div class="room-inspection">
    <div class="room-header">
      <h3 class="room-number">
        {{ room.roomNumber }}
      </h3>
      <span
        v-if="verified"
        class="verified-badge"
      >
        {{ t('inspection.verified') }}
      </span>
    </div>

    <!-- Roster -->
    <div class="occupants-section">
      <h4 class="section-label">
        {{ t('inspection.expected') }} ({{ displayOccupants().length }})
      </h4>
      <div
        v-for="occ in displayOccupants()"
        :key="occ.workerId"
        class="occupant-row"
        :class="{ 'occupant-row--present': presentWorkerIds.has(occ.workerId) }"
      >
        <label class="occupant-checkbox">
          <input
            type="checkbox"
            :checked="presentWorkerIds.has(occ.workerId)"
            @change="emit('toggle-presence', occ.workerId, ($event.target as HTMLInputElement).checked)"
          >
          <span class="occupant-name">{{ occ.lastName }}, {{ occ.firstName }}</span>
        </label>
        <span
          v-if="occ.bedLabel"
          class="occupant-id"
        >{{ occ.bedLabel }}</span>
      </div>
      <p
        v-if="!displayOccupants().length"
        class="muted"
      >
        {{ t('inspection.noExpected') }}
      </p>
    </div>

    <!-- Unexpected presences -->
    <div class="unexpected-section">
      <h4 class="section-label">
        {{ t('inspection.unexpected') }} ({{ unexpectedWorkerIds.length }})
      </h4>
      <div
        v-for="workerId in unexpectedWorkerIds"
        :key="workerId"
        class="unexpected-item"
      >
        <span>{{ workerId }}</span>
        <button
          class="remove-btn"
          @click="emit('remove-unexpected', workerId)"
        >
          {{ t('common.delete') }}
        </button>
      </div>

      <div
        v-if="showUnexpectedSearch"
        class="unexpected-form"
      >
        <input
          v-model="searchQuery"
          type="text"
          class="form-input"
          :placeholder="t('inspection.searchWorkerPlaceholder')"
          @input="runSearch"
        >
        <div
          v-if="searchError"
          class="muted"
        >
          {{ searchError }}
        </div>
        <div
          v-for="w in searchResults"
          :key="w.id"
          class="search-result"
          @click="pickUnexpected(w.id)"
        >
          {{ w.lastName }}, {{ w.firstName }} ({{ w.internalId }})
        </div>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="showUnexpectedSearch = false"
        >
          {{ t('common.cancel') }}
        </BaseButton>
      </div>
      <BaseButton
        v-else
        variant="ghost"
        size="sm"
        @click="showUnexpectedSearch = true"
      >
        {{ t('inspection.addUnexpected') }}
      </BaseButton>
    </div>

    <!-- Verify button -->
    <div
      v-if="!verified"
      class="verify-section"
    >
      <BaseButton
        size="sm"
        @click="emit('verify')"
      >
        {{ t('inspection.markVerified') }}
      </BaseButton>
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
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  &:last-child {
    border-bottom: none;
  }

  &--present {
    opacity: 0.7;
  }
}

.occupant-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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

.unexpected-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.unexpected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.375rem 0;
  font-size: 0.875rem;
}

.remove-btn {
  border: none;
  background: none;
  color: #dc2626;
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
}

.unexpected-form {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0.5rem 0;
}

.search-result {
  padding: 0.375rem 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
}

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

.muted {
  color: #9ca3af;
  font-size: 0.8125rem;
}
</style>
