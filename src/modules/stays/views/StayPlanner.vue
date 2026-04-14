<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStaysStore } from '../store/stays.store'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { BaseButton, StatusChip } from '@/shared/components'
import type { StayStatus } from '../types/stay.types'

const { t } = useI18n()
const router = useRouter()
const store = useStaysStore()
const propertiesStore = usePropertiesStore()

const statusOptions: { value: StayStatus | ''; label: string }[] = [
  { value: '', label: t('stays.allStatuses') },
  { value: 'PLANNED', label: t('status.PLANNED') },
  { value: 'EXPECTED_TODAY', label: t('status.EXPECTED_TODAY') },
  { value: 'CHECKED_IN', label: t('status.CHECKED_IN') },
  { value: 'CHECKED_OUT', label: t('status.CHECKED_OUT') },
  { value: 'NO_SHOW', label: t('status.NO_SHOW') },
  { value: 'CANCELLED', label: t('status.CANCELLED') },
]

function onStatusChange(e: Event) {
  store.statusFilter = (e.target as HTMLSelectElement).value as StayStatus | ''
  store.setPage(0)
}

function onPropertyChange(e: Event) {
  store.propertyIdFilter = (e.target as HTMLSelectElement).value
  store.setPage(0)
}

function onDateFromChange(e: Event) {
  store.dateFromFilter = (e.target as HTMLInputElement).value
  store.setPage(0)
}

function onDateToChange(e: Event) {
  store.dateToFilter = (e.target as HTMLInputElement).value
  store.setPage(0)
}

function viewDetail(id: string) {
  router.push({ name: 'StayDetail', params: { id } })
}

function resetFilters() {
  store.resetFilters()
  store.fetchStays()
}

onMounted(() => {
  store.fetchStays()
  propertiesStore.fetchProperties()
})
</script>

<template>
  <div class="stay-planner">
    <div class="page-header">
      <h2>{{ t('nav.stays') }}</h2>
      <div class="header-actions">
        <BaseButton
          variant="secondary"
          size="sm"
          @click="router.push({ name: 'BulkAssign' })"
        >
          {{ t('stays.bulkAssign') }}
        </BaseButton>
        <BaseButton
          size="sm"
          @click="router.push({ name: 'StayCreate' })"
        >
          {{ t('stays.addStay') }}
        </BaseButton>
      </div>
    </div>

    <div class="filters">
      <select
        class="filter-select"
        :value="store.statusFilter"
        @change="onStatusChange"
      >
        <option
          v-for="opt in statusOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <select
        class="filter-select"
        :value="store.propertyIdFilter"
        @change="onPropertyChange"
      >
        <option value="">
          {{ t('stays.allProperties') }}
        </option>
        <option
          v-for="prop in propertiesStore.properties"
          :key="prop.id"
          :value="prop.id"
        >
          {{ prop.name }}
        </option>
      </select>
      <input
        type="date"
        class="filter-input"
        :value="store.dateFromFilter"
        @change="onDateFromChange"
      >
      <input
        type="date"
        class="filter-input"
        :value="store.dateToFilter"
        @change="onDateToChange"
      >
      <BaseButton
        variant="ghost"
        size="sm"
        @click="resetFilters"
      >
        {{ t('stays.clearFilters') }}
      </BaseButton>
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
    <template v-else>
      <table
        v-if="store.stays.length"
        class="stays-table"
      >
        <thead>
          <tr>
            <th>{{ t('stays.worker') }}</th>
            <th>{{ t('stays.property') }}</th>
            <th>{{ t('stays.room') }}</th>
            <th>{{ t('stays.dateFrom') }}</th>
            <th>{{ t('stays.dateTo') }}</th>
            <th>{{ t('stays.statusLabel') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="stay in store.stays"
            :key="stay.id"
            class="stay-row"
            @click="viewDetail(stay.id)"
          >
            <td>{{ stay.worker.lastName }}, {{ stay.worker.firstName }}</td>
            <td>{{ stay.property.name }}</td>
            <td>{{ stay.room.roomNumber }}</td>
            <td>{{ stay.dateFrom }}</td>
            <td>{{ stay.dateTo ?? '—' }}</td>
            <td>
              <StatusChip :status="stay.status" />
            </td>
          </tr>
        </tbody>
      </table>
      <p
        v-else
        class="empty"
      >
        {{ t('stays.noStays') }}
      </p>

      <div
        v-if="store.totalPages > 1"
        class="pagination"
      >
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="!store.hasPreviousPage"
          @click="store.setPage(store.page - 1)"
        >
          {{ t('common.back') }}
        </BaseButton>
        <span class="page-info">
          {{ store.page + 1 }} / {{ store.totalPages }}
        </span>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="!store.hasNextPage"
          @click="store.setPage(store.page + 1)"
        >
          {{ t('stays.next') }}
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.stay-planner {
  max-width: 1200px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.filter-select,
.filter-input {
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

.stay-row {
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f9fafb;
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.page-info {
  font-size: 0.875rem;
  color: #4b5563;
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #dc2626;
}
</style>
