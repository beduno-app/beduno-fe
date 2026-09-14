<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  previousState: Record<string, unknown> | null
  newState: Record<string, unknown> | null
}>()

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const diff = computed(() => {
  const before = props.previousState ?? {}
  const after = props.newState ?? {}
  const fields = new Set([...Object.keys(before), ...Object.keys(after)])
  const rows: { field: string; before: unknown; after: unknown }[] = []
  for (const field of fields) {
    const b = before[field]
    const a = after[field]
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      rows.push({ field, before: b, after: a })
    }
  }
  return rows
})
</script>

<template>
  <div
    v-if="diff.length"
    class="diff-viewer"
  >
    <table class="diff-table">
      <thead>
        <tr>
          <th>Field</th>
          <th class="before">
            Before
          </th>
          <th class="after">
            After
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in diff"
          :key="item.field"
        >
          <td class="field-name">
            {{ item.field }}
          </td>
          <td class="before">
            {{ formatValue(item.before) }}
          </td>
          <td class="after">
            {{ formatValue(item.after) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <span
    v-else
    class="no-diff"
  >—</span>
</template>

<style scoped lang="scss">
.diff-viewer {
  margin-top: 0.5rem;
}

.diff-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;

  th,
  td {
    padding: 0.25rem 0.5rem;
    text-align: left;
    border: 1px solid #e5e7eb;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
  }

  .field-name {
    font-weight: 500;
    color: #374151;
    white-space: nowrap;
  }

  th.before,
  td.before {
    background: #fff5f5;
    color: #991b1b;
  }

  th.after,
  td.after {
    background: #f0fdf4;
    color: #166534;
  }
}

.no-diff {
  color: #9ca3af;
  font-size: 0.875rem;
}
</style>
