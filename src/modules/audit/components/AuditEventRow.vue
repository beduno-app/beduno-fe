<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AuditEvent, AuditEntityType } from '../types/audit.types'
import { BaseBadge } from '@/shared/components'
import AuditDiffViewer from './AuditDiffViewer.vue'

defineProps<{
  event: AuditEvent
}>()

const { t } = useI18n()
const expanded = ref(false)

function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString('sv').replace('T', ' ').slice(0, 16)
}

function buildEntityLink(type: AuditEntityType, id: string): object {
  const routeMap: Record<AuditEntityType, string> = {
    WORKER: 'WorkerDetail',
    STAY: 'StayDetail',
    PROPERTY: 'PropertyDetail',
    ROOM: 'PropertyDetail',
    USER: 'UserManagement',
  }
  if (type === 'ROOM') {
    return { name: routeMap[type] }
  }
  return { name: routeMap[type], params: { id } }
}
</script>

<template>
  <tbody class="event-row-group">
    <tr class="event-row">
      <td class="cell-timestamp">
        {{ formatTimestamp(event.timestamp) }}
      </td>
      <td class="cell-actor">
        {{ event.actor.firstName }} {{ event.actor.lastName }}
        <BaseBadge
          variant="info"
          class="role-badge"
        >
          {{ t(`roles.${event.actor.role}`) }}
        </BaseBadge>
      </td>
      <td class="cell-action">
        {{ t(`audit.actions.${event.action}`) }}
      </td>
      <td class="cell-entity">
        <span class="entity-type">{{ t(`audit.entityTypes.${event.entityType}`) }}</span>
        <RouterLink
          :to="buildEntityLink(event.entityType, event.entityId)"
          class="entity-link"
        >
          {{ event.entityLabel }}
        </RouterLink>
      </td>
      <td class="cell-sync">
        <span
          v-if="event.syncedAt"
          class="synced-offline"
          :title="`Synced at ${formatTimestamp(event.syncedAt)}`"
        >
          <BaseBadge variant="warning">{{ t('audit.syncedOffline') }}</BaseBadge>
        </span>
      </td>
      <td class="cell-details">
        <button
          class="toggle-btn"
          @click="expanded = !expanded"
        >
          {{ expanded ? '▲' : '▼' }}
        </button>
      </td>
    </tr>
    <tr
      v-if="expanded"
      class="diff-row"
    >
      <td colspan="6">
        <AuditDiffViewer :diff="event.diff" />
      </td>
    </tr>
  </tbody>
</template>

<style scoped lang="scss">
.event-row {
  td {
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.875rem;
    vertical-align: middle;
  }
}

.diff-row {
  td {
    padding: 0.5rem 0.75rem 0.75rem;
    background: #fafafa;
    border-bottom: 1px solid #e5e7eb;
  }
}

.cell-timestamp {
  white-space: nowrap;
  color: #6b7280;
  font-size: 0.8125rem;
}

.cell-actor {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.role-badge {
  flex-shrink: 0;
}

.cell-entity {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.entity-type {
  font-size: 0.75rem;
  color: #9ca3af;
}

.entity-link {
  color: #e66e00;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.synced-offline {
  cursor: help;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;

  &:hover {
    color: #374151;
  }
}
</style>
