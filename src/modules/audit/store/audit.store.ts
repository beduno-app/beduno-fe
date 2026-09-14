import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { AuditEvent, AuditEntityType, GetAuditParams } from '../types/audit.types'
import { auditApi } from '../api/audit.api'

export const useAuditStore = defineStore('audit', () => {
  const events = ref<AuditEvent[]>([])
  const isLoading = ref(false)
  const error = ref('')
  const page = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const size = ref(30)

  // Filters
  const entityTypeFilter = ref<AuditEntityType | ''>('')
  const entityIdFilter = ref('')
  const actorUserIdFilter = ref('')
  const dateFromFilter = ref('')
  const dateToFilter = ref('')

  const hasNextPage = computed(() => page.value < totalPages.value - 1)
  const hasPreviousPage = computed(() => page.value > 0)

  function buildParams(): GetAuditParams {
    const params: GetAuditParams = {
      page: page.value,
      size: size.value,
    }
    if (entityTypeFilter.value) params.entityType = entityTypeFilter.value
    if (entityIdFilter.value) params.entityId = entityIdFilter.value
    if (actorUserIdFilter.value) params.actorUserId = actorUserIdFilter.value
    if (dateFromFilter.value) params.dateFrom = dateFromFilter.value
    if (dateToFilter.value) params.dateTo = dateToFilter.value
    return params
  }

  async function fetchEvents() {
    isLoading.value = true
    error.value = ''
    try {
      const response = await auditApi.getEvents(buildParams())
      events.value = response.content
      totalPages.value = response.totalPages
      totalElements.value = response.totalElements
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load audit events'
    } finally {
      isLoading.value = false
    }
  }

  function setPage(p: number) {
    page.value = p
    return fetchEvents()
  }

  function resetFilters() {
    entityTypeFilter.value = ''
    entityIdFilter.value = ''
    actorUserIdFilter.value = ''
    dateFromFilter.value = ''
    dateToFilter.value = ''
    page.value = 0
  }

  return {
    events,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    size,
    entityTypeFilter,
    entityIdFilter,
    actorUserIdFilter,
    dateFromFilter,
    dateToFilter,
    hasNextPage,
    hasPreviousPage,
    fetchEvents,
    setPage,
    resetFilters,
  }
})
