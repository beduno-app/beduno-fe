<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuditStore } from '../store/audit.store'
import type { AuditEntityType } from '../types/audit.types'
import { BaseButton } from '@/shared/components'
import AuditEventRow from '../components/AuditEventRow.vue'

const { t } = useI18n()
const route = useRoute()
const store = useAuditStore()

const entityTypeOptions: Array<{ value: AuditEntityType | ''; label: string }> = [
  { value: '', label: t('audit.allEntityTypes') },
  { value: 'WORKER', label: t('audit.entityTypes.WORKER') },
  { value: 'PROPERTY', label: t('audit.entityTypes.PROPERTY') },
  { value: 'ROOM', label: t('audit.entityTypes.ROOM') },
  { value: 'BED', label: t('audit.entityTypes.BED') },
  { value: 'STAY', label: t('audit.entityTypes.STAY') },
  { value: 'USER', label: t('audit.entityTypes.USER') },
]

function onEntityTypeChange(e: Event) {
  store.entityTypeFilter = (e.target as HTMLSelectElement).value as AuditEntityType | ''
  store.setPage(0)
}

function onEntityIdChange(e: Event) {
  store.entityIdFilter = (e.target as HTMLInputElement).value
}

function onActorIdChange(e: Event) {
  store.actorUserIdFilter = (e.target as HTMLInputElement).value
}

function onDateFromChange(e: Event) {
  store.dateFromFilter = (e.target as HTMLInputElement).value
  store.setPage(0)
}

function onDateToChange(e: Event) {
  store.dateToFilter = (e.target as HTMLInputElement).value
  store.setPage(0)
}

function applyTextFilters() {
  store.setPage(0)
}

function clearFilters() {
  store.resetFilters()
  store.fetchEvents()
}

onMounted(() => {
  if (route.query.entityType) {
    store.entityTypeFilter = route.query.entityType as AuditEntityType
  }
  if (route.query.entityId) {
    store.entityIdFilter = route.query.entityId as string
  }
  store.fetchEvents()
})
</script>

<template>
  <div class="audit-log">
    <div class="page-header">
      <h2>{{ t('audit.title') }}</h2>
      <BaseButton
        variant="ghost"
        @click="clearFilters"
      >
        {{ t('audit.clearFilters') }}
      </BaseButton>
    </div>

    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">{{ t('audit.filterEntityType') }}</label>
        <select
          class="filter-select"
          :value="store.entityTypeFilter"
          @change="onEntityTypeChange"
        >
          <option
            v-for="opt in entityTypeOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('audit.filterEntityId') }}</label>
        <input
          class="filter-input"
          type="text"
          :value="store.entityIdFilter"
          :placeholder="t('audit.filterEntityId')"
          @input="onEntityIdChange"
          @keydown.enter="applyTextFilters"
          @blur="applyTextFilters"
        >
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('audit.filterActor') }}</label>
        <input
          class="filter-input"
          type="text"
          :value="store.actorUserIdFilter"
          :placeholder="t('audit.filterActor')"
          @input="onActorIdChange"
          @keydown.enter="applyTextFilters"
          @blur="applyTextFilters"
        >
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('audit.filterDateFrom') }}</label>
        <input
          class="filter-input"
          type="date"
          :value="store.dateFromFilter"
          @change="onDateFromChange"
        >
      </div>

      <div class="filter-group">
        <label class="filter-label">{{ t('audit.filterDateTo') }}</label>
        <input
          class="filter-input"
          type="date"
          :value="store.dateToFilter"
          @change="onDateToChange"
        >
      </div>
    </div>

    <div
      v-if="store.isLoading"
      class="loading"
    >
      {{ t('common.loading') }}
    </div>

    <div
      v-else-if="store.error"
      class="error"
    >
      {{ store.error }}
    </div>

    <div
      v-else-if="!store.events.length"
      class="empty"
    >
      {{ t('audit.noEvents') }}
    </div>

    <div
      v-else
      class="results"
    >
      <table class="audit-table">
        <thead>
          <tr>
            <th>{{ t('audit.filterDateFrom') }}</th>
            <th>{{ t('audit.filterActor') }}</th>
            <th>{{ t('audit.filterAction') }}</th>
            <th>{{ t('audit.filterEntityType') }}</th>
            <th />
          </tr>
        </thead>
        <AuditEventRow
          v-for="event in store.events"
          :key="event.id"
          :event="event"
        />
      </table>

      <div class="pagination">
        <BaseButton
          variant="ghost"
          :disabled="!store.hasPreviousPage"
          @click="store.setPage(store.page - 1)"
        >
          ← Prev
        </BaseButton>
        <span class="page-info">{{ store.page + 1 }} / {{ store.totalPages }}</span>
        <BaseButton
          variant="ghost"
          :disabled="!store.hasNextPage"
          @click="store.setPage(store.page + 1)"
        >
          Next →
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.audit-log {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.filter-select,
.filter-input {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #fff;
  color: #111827;
  min-width: 140px;

  &:focus {
    outline: none;
    border-color: #e66e00;
  }
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.error {
  color: #991b1b;
}

.results {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;

  thead th {
    padding: 0.75rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>
