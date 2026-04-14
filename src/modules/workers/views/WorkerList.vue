<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWorkersStore } from '../store/workers.store'
import { BaseButton, BaseInput, BaseBadge, SkeletonLoader } from '@/shared/components'
import BatchBadgePrint from '../components/BatchBadgePrint.vue'
import type { Worker, WorkerStatus, Gender } from '../types/worker.types'

const { t } = useI18n()
const router = useRouter()
const store = useWorkersStore()

const statusOptions: { value: WorkerStatus | ''; label: string }[] = [
  { value: '', label: t('workers.allStatuses') },
  { value: 'ACTIVE', label: t('workers.status.ACTIVE') },
  { value: 'INACTIVE', label: t('workers.status.INACTIVE') },
  { value: 'BLACKLISTED', label: t('workers.status.BLACKLISTED') },
]

const genderOptions: { value: Gender | ''; label: string }[] = [
  { value: '', label: t('workers.allGenders') },
  { value: 'MALE', label: t('workers.gender.MALE') },
  { value: 'FEMALE', label: t('workers.gender.FEMALE') },
  { value: 'OTHER', label: t('workers.gender.OTHER') },
]

const selectedIds = ref<Set<string>>(new Set())
const showBatchPrint = ref(false)

const selectedWorkers = ref<Worker[]>([])

function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

function toggleSelectAll() {
  if (selectedIds.value.size === store.workers.length) {
    selectedIds.value.clear()
  } else {
    for (const w of store.workers) {
      selectedIds.value.add(w.id)
    }
  }
}

function openBatchPrint() {
  selectedWorkers.value = store.workers.filter((w) => selectedIds.value.has(w.id))
  showBatchPrint.value = true
}

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
  store.statusFilter = (e.target as HTMLSelectElement).value as WorkerStatus | ''
  store.setPage(0)
}

function onGenderChange(e: Event) {
  store.genderFilter = (e.target as HTMLSelectElement).value as Gender | ''
  store.setPage(0)
}

function viewDetail(id: string) {
  router.push({ name: 'WorkerDetail', params: { id } })
}

function statusVariant(status: WorkerStatus): 'success' | 'default' | 'danger' {
  const map: Record<WorkerStatus, 'success' | 'default' | 'danger'> = {
    ACTIVE: 'success',
    INACTIVE: 'default',
    BLACKLISTED: 'danger',
  }
  return map[status]
}

onMounted(() => {
  store.fetchWorkers()
})
</script>

<template>
  <div class="worker-list">
    <div class="page-header">
      <h2>{{ t('nav.workers') }}</h2>
      <div class="header-actions">
        <BaseButton
          v-if="selectedIds.size > 0"
          variant="secondary"
          size="sm"
          @click="openBatchPrint"
        >
          {{ t('workers.printBadges', { count: selectedIds.size }) }}
        </BaseButton>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="router.push({ name: 'WorkerImport' })"
        >
          {{ t('workers.import') }}
        </BaseButton>
        <BaseButton
          size="sm"
          @click="router.push({ name: 'WorkerCreate' })"
        >
          {{ t('workers.addWorker') }}
        </BaseButton>
      </div>
    </div>

    <div class="filters">
      <BaseInput
        v-model="store.search"
        :placeholder="t('workers.searchPlaceholder')"
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
        :value="store.genderFilter"
        @change="onGenderChange"
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

    <div
      v-if="store.isLoading"
      class="skeleton-section"
    >
      <SkeletonLoader
        :lines="6"
        height="2.5rem"
      />
    </div>
    <div
      v-else-if="store.error"
      class="error"
    >
      {{ store.error }}
    </div>
    <template v-else>
      <table
        v-if="store.workers.length"
        class="workers-table"
      >
        <thead>
          <tr>
            <th class="checkbox-cell">
              <input
                type="checkbox"
                :checked="selectedIds.size === store.workers.length && store.workers.length > 0"
                @change="toggleSelectAll"
              >
            </th>
            <th>{{ t('workers.internalId') }}</th>
            <th>{{ t('workers.name') }}</th>
            <th>{{ t('workers.phone') }}</th>
            <th>{{ t('workers.statusLabel') }}</th>
            <th>{{ t('workers.tags') }}</th>
            <th>{{ t('workers.currentProperty') }}</th>
            <th>{{ t('common.edit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="worker in store.workers"
            :key="worker.id"
            class="worker-row"
            @click="viewDetail(worker.id)"
          >
            <td class="checkbox-cell">
              <input
                type="checkbox"
                :checked="selectedIds.has(worker.id)"
                @click.stop="toggleSelect(worker.id)"
              >
            </td>
            <td class="id-cell">
              {{ worker.internalId }}
            </td>
            <td>{{ worker.firstName }} {{ worker.lastName }}</td>
            <td>{{ worker.phone }}</td>
            <td>
              <BaseBadge :variant="statusVariant(worker.status)">
                {{ t(`workers.status.${worker.status}`) }}
              </BaseBadge>
            </td>
            <td>
              <span
                v-for="tag in worker.tags"
                :key="tag"
                class="tag"
              >{{ tag }}</span>
            </td>
            <td>
              <template v-if="worker.currentStay">
                {{ worker.currentStay.propertyName }} — {{ t('workers.room') }}
                {{ worker.currentStay.roomNumber }}
              </template>
              <span
                v-else
                class="muted"
              >—</span>
            </td>
            <td>
              <BaseButton
                variant="ghost"
                size="sm"
                @click.stop="viewDetail(worker.id)"
              >
                {{ t('common.edit') }}
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
      <p
        v-else
        class="empty"
      >
        {{ t('workers.noWorkers') }}
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
          {{ t('workers.next') }}
        </BaseButton>
      </div>
    </template>

    <BatchBadgePrint
      v-if="showBatchPrint"
      :workers="selectedWorkers"
      @close="showBatchPrint = false"
    />
  </div>
</template>

<style scoped lang="scss">
.worker-list {
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

.workers-table {
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

.worker-row {
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }
}

.checkbox-cell {
  width: 2.5rem;
  text-align: center;
}

.id-cell {
  font-family: monospace;
  font-weight: 600;
  color: #4b5563;
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

.skeleton-section {
  padding: 0.5rem 0;
}

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
