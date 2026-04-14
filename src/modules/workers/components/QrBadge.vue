<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { workersApi } from '../api/workers.api'
import type { Worker } from '../types/worker.types'
import { BaseButton } from '@/shared/components'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const worker = ref<Worker | null>(null)
const isLoading = ref(true)
const error = ref('')

const workerId = computed(() => route.params.id as string)

const qrDataUrl = computed(() => {
  if (!worker.value) return ''
  const data = encodeURIComponent(
    JSON.stringify({ id: worker.value.id, internalId: worker.value.internalId }),
  )
  // Use a placeholder QR API — in production, replace with a local library like qrcode
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`
})

async function loadWorker() {
  isLoading.value = true
  try {
    worker.value = await workersApi.getWorker(workerId.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load worker'
  } finally {
    isLoading.value = false
  }
}

function printBadge() {
  window.print()
}

function downloadBadge() {
  const badge = document.querySelector('.badge-card') as HTMLElement | null
  if (!badge) return
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`
    <html><head><title>Badge — ${worker.value?.internalId}</title>
    <style>
      body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
      .badge { text-align: center; border: 2px solid #000; padding: 1.5rem; border-radius: 0.5rem; width: 280px; }
      .badge h2 { margin: 0.5rem 0 0.25rem; font-size: 1.25rem; }
      .badge .id { font-family: monospace; color: #666; margin-bottom: 1rem; }
      .badge img { display: block; margin: 0 auto; }
    </style></head><body>
    <div class="badge">
      <h2>${worker.value?.firstName} ${worker.value?.lastName}</h2>
      <div class="id">${worker.value?.internalId}</div>
      <img src="${qrDataUrl.value}" alt="QR" width="200" height="200" />
    </div>
    <` + `script>window.onload = function() { window.print(); }</` + `script>
    </body></html>
  `)
  printWindow.document.close()
}

onMounted(loadWorker)
</script>

<template>
  <div class="qr-badge-page">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'WorkerDetail', params: { id: workerId } })"
      >
        {{ t('common.back') }}
      </BaseButton>
    </div>

    <div
      v-if="isLoading"
      class="loading"
    >
      {{ t('common.loading') }}
    </div>
    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>
    <template v-else-if="worker">
      <h2>{{ t('workers.qrBadge') }}</h2>

      <div class="badge-card">
        <h3 class="badge-name">
          {{ worker.firstName }} {{ worker.lastName }}
        </h3>
        <span class="badge-id">{{ worker.internalId }}</span>
        <img
          :src="qrDataUrl"
          :alt="`QR ${worker.internalId}`"
          class="badge-qr"
          width="200"
          height="200"
        >
      </div>

      <div class="badge-actions">
        <BaseButton
          variant="secondary"
          @click="printBadge"
        >
          {{ t('workers.print') }}
        </BaseButton>
        <BaseButton @click="downloadBadge">
          {{ t('workers.download') }}
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.qr-badge-page {
  max-width: 500px;
}

.page-header {
  margin-bottom: 1rem;
}

.badge-card {
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  margin: 1.5rem 0;
}

.badge-name {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
}

.badge-id {
  display: block;
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.badge-qr {
  display: block;
  margin: 0 auto;
}

.badge-actions {
  display: flex;
  gap: 0.5rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #dc2626;
}

@media print {
  .page-header,
  .badge-actions {
    display: none;
  }
}
</style>
