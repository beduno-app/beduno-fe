<script setup lang="ts" generic="T extends Record<string, unknown>">
import { useI18n } from 'vue-i18n'

export interface Column<R> {
  key: keyof R & string
  label: string
  width?: string
}

defineProps<{
  columns: Column<T>[]
  rows: T[]
  loading?: boolean
  emptyText?: string
}>()

defineSlots<{
  [key: `cell-${string}`]: (props: { row: T; value: unknown }) => void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : {}">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr>
          <td :colspan="columns.length" class="table-status">{{ t('common.loading') }}</td>
        </tr>
      </tbody>
      <tbody v-else-if="rows.length === 0">
        <tr>
          <td :colspan="columns.length" class="table-status">{{ emptyText ?? 'No data' }}</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="(row, idx) in rows" :key="idx">
          <td v-for="col in columns" :key="col.key">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.table-wrapper {
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table {
  width: 100%;
  border-collapse: collapse;

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

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: #f9fafb;
  }
}

.table-status {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 1rem;
}
</style>
