<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AuditEvent, AuditEntityType } from '../types/audit.types'
import AuditDiffViewer from './AuditDiffViewer.vue'
import { formatDateTime } from '@/shared/utils/formatDate'
import { useEntityLookup } from '@/shared/composables/useEntityLookup'

const props = defineProps<{
  event: AuditEvent
}>()

const { t, locale } = useI18n()
const lookup = useEntityLookup()
const expanded = ref(false)
const actorName = ref('')

function formatTimestamp(ts: string): string {
  return formatDateTime(ts, locale.value)
}

function buildEntityLink(type: AuditEntityType, id: string): object {
  const routeMap: Record<AuditEntityType, string> = {
    WORKER: 'WorkerDetail',
    STAY: 'StayDetail',
    PROPERTY: 'PropertyDetail',
    ROOM: 'PropertyDetail',
    BED: 'PropertyDetail',
    USER: 'UserManagement',
  }
  if (type === 'ROOM' || type === 'BED') {
    return { name: routeMap[type] }
  }
  return { name: routeMap[type], params: { id } }
}

onMounted(async () => {
  const user = await lookup.getUser(props.event.actorUserId)
  actorName.value = user ? `${user.firstName} ${user.lastName}` : props.event.actorUserId
})
</script>

<template>
  <tbody class="event-row-group">
    <tr class="event-row">
      <td class="cell-timestamp">
        {{ formatTimestamp(event.createdAt) }}
      </td>
      <td class="cell-actor">
        {{ actorName }}
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
          {{ event.entityId }}
        </RouterLink>
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
      <td colspan="5">
        <p
          v-if="event.reason"
          class="reason"
        >
          {{ t('audit.reason') }}: {{ event.reason }}
        </p>
        <AuditDiffViewer
          :previous-state="event.previousState"
          :new-state="event.newState"
        />
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

.reason {
  font-size: 0.8125rem;
  color: #374151;
  margin: 0 0 0.5rem;
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
