<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSyncStore } from '../store/sync.store'

const { t } = useI18n()
const sync = useSyncStore()

const isOnline = ref(navigator.onLine)

function updateOnline() {
  isOnline.value = navigator.onLine
  if (isOnline.value) {
    sync.refreshQueueLength()
  }
}

onMounted(() => {
  window.addEventListener('online', updateOnline)
  window.addEventListener('offline', updateOnline)
  sync.refreshQueueLength()
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnline)
  window.removeEventListener('offline', updateOnline)
})
</script>

<template>
  <div
    v-if="!isOnline || sync.queueLength > 0 || sync.isSyncing"
    class="offline-banner"
    :class="{
      'offline-banner--offline': !isOnline,
      'offline-banner--syncing': isOnline && sync.isSyncing,
      'offline-banner--queued': isOnline && !sync.isSyncing && sync.queueLength > 0,
    }"
  >
    <span
      v-if="sync.isSyncing"
      class="banner-text"
    >{{ t('offline.syncing') }}</span>
    <span
      v-else-if="!isOnline"
      class="banner-text"
    >{{ t('offline.offlineBanner', { count: sync.queueLength }) }}</span>
    <span
      v-else-if="sync.queueLength > 0"
      class="banner-text"
    >{{ t('offline.offlineBanner', { count: sync.queueLength }) }}</span>
  </div>
</template>

<style scoped lang="scss">
.offline-banner {
  padding: 0.375rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.3s;

  &--offline {
    background: #1f2937;
    color: #f9fafb;
  }

  &--syncing {
    background: #1d4ed8;
    color: #fff;
  }

  &--queued {
    background: #92400e;
    color: #fef3c7;
  }
}

.banner-text {
  display: block;
}
</style>
