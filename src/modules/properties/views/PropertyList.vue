<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePropertiesStore } from '../store/properties.store'
import { BaseButton, BaseInput, BaseBadge } from '@/shared/components'
import type { PropertyStatus, PropertyType } from '../types/property.types'

const { t } = useI18n()
const router = useRouter()
const store = usePropertiesStore()

const statusOptions: { value: PropertyStatus | ''; label: string }[] = [
  { value: '', label: t('properties.allStatuses') },
  { value: 'ACTIVE', label: t('properties.status.ACTIVE') },
  { value: 'INACTIVE', label: t('properties.status.INACTIVE') },
]

const typeOptions: { value: PropertyType | ''; label: string }[] = [
  { value: '', label: t('properties.allTypes') },
  { value: 'INTERNAL', label: t('properties.type.INTERNAL') },
  { value: 'PARTNER', label: t('properties.type.PARTNER') },
]

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => store.search,
  () => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      store.setPage(0)
    }, 300)
  },
)

function onStatusChange(e: Event) {
  store.statusFilter = (e.target as HTMLSelectElement).value as PropertyStatus | ''
  store.setPage(0)
}

function onTypeChange(e: Event) {
  store.typeFilter = (e.target as HTMLSelectElement).value as PropertyType | ''
  store.setPage(0)
}

function viewDetail(id: string) {
  router.push({ name: 'PropertyDetail', params: { id } })
}

function occupancyPercent(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

onMounted(() => {
  store.fetchProperties()
})
</script>

<template>
  <div class="property-list">
    <div class="page-header">
      <h2>{{ t('nav.properties') }}</h2>
      <BaseButton
        size="sm"
        @click="router.push({ name: 'PropertyCreate' })"
      >
        {{ t('properties.addProperty') }}
      </BaseButton>
    </div>

    <div class="filters">
      <BaseInput
        v-model="store.search"
        :placeholder="t('properties.searchPlaceholder')"
      />
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
        :value="store.typeFilter"
        @change="onTypeChange"
      >
        <option
          v-for="opt in typeOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
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
      <div
        v-if="store.properties.length"
        class="property-grid"
      >
        <div
          v-for="prop in store.properties"
          :key="prop.id"
          class="property-card"
          @click="viewDetail(prop.id)"
        >
          <div class="card-header">
            <h3 class="card-title">
              {{ prop.name }}
            </h3>
            <BaseBadge :variant="prop.status === 'ACTIVE' ? 'success' : 'default'">
              {{ t(`properties.status.${prop.status}`) }}
            </BaseBadge>
          </div>
          <p class="card-address">
            {{ prop.address }}
          </p>
          <div class="card-meta">
            <BaseBadge>{{ t(`properties.type.${prop.type}`) }}</BaseBadge>
            <span class="card-rule">{{ t(`properties.genderRule.${prop.genderRule}`) }}</span>
          </div>
          <div class="occupancy-section">
            <div class="occupancy-header">
              <span class="occupancy-label">{{ t('properties.occupancy') }}</span>
              <span class="occupancy-value">
                {{ prop.roomSummary.currentOccupancy }} / {{ prop.roomSummary.totalCapacity }}
              </span>
            </div>
            <div class="occupancy-bar">
              <div
                class="occupancy-fill"
                :style="{ width: occupancyPercent(prop.roomSummary.currentOccupancy, prop.roomSummary.totalCapacity) + '%' }"
              />
            </div>
            <div class="occupancy-stats">
              <span>{{ prop.roomSummary.totalRooms }} {{ t('properties.rooms') }}</span>
              <span
                v-if="prop.roomSummary.totalBlockedSpots > 0"
                class="blocked-info"
              >
                {{ prop.roomSummary.totalBlockedSpots }} {{ t('properties.blocked') }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p
        v-else
        class="empty"
      >
        {{ t('properties.noProperties') }}
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
          {{ t('properties.next') }}
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.property-list {
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

.filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.filter-select {
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

.property-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.property-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
}

.card-address {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.375rem 0 0.75rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.card-rule {
  font-size: 0.75rem;
  color: #6b7280;
}

.occupancy-section {
  border-top: 1px solid #f3f4f6;
  padding-top: 0.75rem;
}

.occupancy-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.375rem;
}

.occupancy-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.occupancy-value {
  font-size: 0.875rem;
  font-weight: 600;
}

.occupancy-bar {
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.375rem;
}

.occupancy-fill {
  height: 100%;
  background: #e66e00;
  border-radius: 3px;
  transition: width 0.3s;
}

.occupancy-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
}

.blocked-info {
  color: #dc2626;
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
