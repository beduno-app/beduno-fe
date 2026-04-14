<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { workersApi } from '../api/workers.api'
import type { ImportResult } from '../types/worker.types'
import { BaseButton } from '@/shared/components'

const router = useRouter()
const { t } = useI18n()

const file = ref<File | null>(null)
const isUploading = ref(false)
const error = ref('')
const result = ref<ImportResult | null>(null)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] ?? null
  result.value = null
  error.value = ''
}

async function upload() {
  if (!file.value) return
  isUploading.value = true
  error.value = ''
  try {
    result.value = await workersApi.importWorkers(file.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Import failed'
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="worker-import">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'Workers' })"
      >
        {{ t('common.back') }}
      </BaseButton>
    </div>

    <h2>{{ t('workers.importTitle') }}</h2>
    <p class="hint">
      {{ t('workers.importHint') }}
    </p>

    <div class="upload-area">
      <input
        type="file"
        accept=".csv"
        class="file-input"
        @change="onFileChange"
      >
      <BaseButton
        :disabled="!file"
        :loading="isUploading"
        @click="upload"
      >
        {{ t('workers.uploadAndImport') }}
      </BaseButton>
    </div>

    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <div
      v-if="result"
      class="result-card"
    >
      <h3>{{ t('workers.importResult') }}</h3>
      <div class="result-stats">
        <div class="stat">
          <span class="stat-value">{{ result.totalRows }}</span>
          <span class="stat-label">{{ t('workers.totalRows') }}</span>
        </div>
        <div class="stat stat--success">
          <span class="stat-value">{{ result.created }}</span>
          <span class="stat-label">{{ t('workers.created') }}</span>
        </div>
        <div class="stat stat--warning">
          <span class="stat-value">{{ result.skipped }}</span>
          <span class="stat-label">{{ t('workers.skipped') }}</span>
        </div>
        <div class="stat stat--danger">
          <span class="stat-value">{{ result.errors.length }}</span>
          <span class="stat-label">{{ t('workers.errors') }}</span>
        </div>
      </div>

      <table
        v-if="result.errors.length"
        class="errors-table"
      >
        <thead>
          <tr>
            <th>{{ t('workers.row') }}</th>
            <th>{{ t('workers.internalId') }}</th>
            <th>{{ t('workers.reason') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="err in result.errors"
            :key="err.row"
          >
            <td>{{ err.row }}</td>
            <td>{{ err.internalId || '—' }}</td>
            <td>{{ err.reason }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.worker-import {
  max-width: 800px;
}

.page-header {
  margin-bottom: 1rem;
}

.hint {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.file-input {
  font-size: 0.875rem;
}

.result-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 1rem;
  }
}

.result-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.stat {
  text-align: center;

  &--success .stat-value {
    color: #166534;
  }
  &--warning .stat-value {
    color: #92400e;
  }
  &--danger .stat-value {
    color: #991b1b;
  }
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.errors-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.5rem 0.75rem;
    text-align: left;
    font-size: 0.875rem;
  }

  th {
    background: #fef2f2;
    font-weight: 600;
    color: #991b1b;
    border-bottom: 1px solid #fecaca;
  }

  td {
    border-bottom: 1px solid #f3f4f6;
  }
}

.error {
  color: #dc2626;
  padding: 1rem 0;
}
</style>
