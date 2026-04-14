<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Worker } from '../types/worker.types'
import { BaseButton, BaseModal } from '@/shared/components'

const props = defineProps<{
  workers: Worker[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const qrUrls = computed(() =>
  props.workers.map((w) => ({
    worker: w,
    url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      JSON.stringify({ id: w.id, internalId: w.internalId }),
    )}`,
  })),
)

function printBadges() {
  const html = props.workers
    .map((w, i) => {
      return `
      <div class="badge">
        <h3>${w.firstName} ${w.lastName}</h3>
        <div class="id">${w.internalId}</div>
        <img src="${qrUrls.value[i].url}" width="150" height="150" />
      </div>`
    })
    .join('')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(`
    <html><head><title>${t('workers.batchBadges')}</title>
    <style>
      body { margin: 0; padding: 1rem; font-family: sans-serif; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
      .badge { text-align: center; border: 2px solid #000; padding: 1rem; border-radius: 0.5rem; page-break-inside: avoid; }
      .badge h3 { margin: 0 0 0.25rem; font-size: 1rem; }
      .badge .id { font-family: monospace; font-size: 0.75rem; color: #666; margin-bottom: 0.75rem; }
      .badge img { display: block; margin: 0 auto; }
      @media print { .grid { grid-template-columns: repeat(3, 1fr); } }
    </style></head><body>
    <div class="grid">${html}</div>
    <script>
      const imgs = document.querySelectorAll('img');
      let loaded = 0;
      imgs.forEach(img => {
        if (img.complete) { loaded++; }
        else { img.onload = () => { loaded++; if (loaded === imgs.length) window.print(); }; }
      });
      if (loaded === imgs.length) window.print();
    </` + `script>
    </body></html>
  `)
  printWindow.document.close()
}
</script>

<template>
  <BaseModal
    :title="t('workers.batchBadges')"
    @close="emit('close')"
  >
    <p>{{ t('workers.batchBadgesHint', { count: workers.length }) }}</p>
    <div class="preview-grid">
      <div
        v-for="item in qrUrls"
        :key="item.worker.id"
        class="preview-badge"
      >
        <span class="preview-name">{{ item.worker.firstName }} {{ item.worker.lastName }}</span>
        <span class="preview-id">{{ item.worker.internalId }}</span>
      </div>
    </div>
    <template #footer>
      <BaseButton
        variant="secondary"
        size="sm"
        @click="emit('close')"
      >
        {{ t('common.cancel') }}
      </BaseButton>
      <BaseButton
        size="sm"
        @click="printBadges"
      >
        {{ t('workers.print') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped lang="scss">
.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.preview-badge {
  text-align: center;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem;
}

.preview-name {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
}

.preview-id {
  display: block;
  font-size: 0.625rem;
  font-family: monospace;
  color: #6b7280;
}
</style>
