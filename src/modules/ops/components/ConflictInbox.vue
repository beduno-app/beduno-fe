<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSyncStore } from '../store/sync.store'
import { BaseButton } from '@/shared/components'

const { t } = useI18n()
const sync = useSyncStore()
</script>

<template>
  <div
    v-if="sync.conflicts.length"
    class="conflict-inbox"
  >
    <div class="inbox-header">
      <span class="inbox-title">{{ t('offline.conflictInboxTitle') }}</span>
      <BaseButton
        variant="ghost"
        size="sm"
        @click="sync.clearConflicts()"
      >
        {{ t('common.delete') }}
      </BaseButton>
    </div>
    <ul class="inbox-list">
      <li
        v-for="(conflict, idx) in sync.conflicts"
        :key="idx"
        class="inbox-item"
      >
        <div class="inbox-item-info">
          <span class="inbox-action">{{ conflict.action.type }}</span>
          <span class="inbox-stay">{{ conflict.action.stayId }}</span>
          <span class="inbox-error">{{ conflict.error }}</span>
        </div>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="sync.dismissConflict(idx)"
        >
          {{ t('offline.dismiss') }}
        </BaseButton>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.conflict-inbox {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.inbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.inbox-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: #92400e;
}

.inbox-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.inbox-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.25rem;
}

.inbox-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
}

.inbox-action {
  font-size: 0.8rem;
  font-weight: 600;
  color: #92400e;
}

.inbox-stay {
  font-family: monospace;
  font-size: 0.75rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inbox-error {
  font-size: 0.8rem;
  color: #dc2626;
}
</style>
