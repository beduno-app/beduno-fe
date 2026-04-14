import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  Property,
  Room,
  GetPropertiesParams,
  PropertyStatus,
  PropertyType,
} from '../types/property.types'
import { propertiesApi } from '../api/properties.api'

export const usePropertiesStore = defineStore('properties', () => {
  const properties = ref<Property[]>([])
  const currentProperty = ref<Property | null>(null)
  const rooms = ref<Room[]>([])
  const isLoading = ref(false)
  const isLoadingRooms = ref(false)
  const error = ref('')
  const page = ref(0)
  const totalPages = ref(0)
  const totalElements = ref(0)
  const size = ref(20)

  // Filters
  const search = ref('')
  const statusFilter = ref<PropertyStatus | ''>('')
  const typeFilter = ref<PropertyType | ''>('')

  const hasNextPage = computed(() => page.value < totalPages.value - 1)
  const hasPreviousPage = computed(() => page.value > 0)

  function buildParams(): GetPropertiesParams {
    const params: GetPropertiesParams = {
      page: page.value,
      size: size.value,
      sort: 'name,asc',
    }
    if (search.value) params.search = search.value
    if (statusFilter.value) params.status = statusFilter.value
    if (typeFilter.value) params.type = typeFilter.value
    return params
  }

  async function fetchProperties() {
    isLoading.value = true
    error.value = ''
    try {
      const response = await propertiesApi.getProperties(buildParams())
      properties.value = response.content
      totalPages.value = response.totalPages
      totalElements.value = response.totalElements
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load properties'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProperty(id: string) {
    try {
      currentProperty.value = await propertiesApi.getProperty(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load property'
    }
  }

  async function fetchRooms(propertyId: string) {
    isLoadingRooms.value = true
    try {
      const response = await propertiesApi.getRooms(propertyId, { size: 100, sort: 'roomNumber,asc' })
      rooms.value = response.content
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load rooms'
    } finally {
      isLoadingRooms.value = false
    }
  }

  function setPage(p: number) {
    page.value = p
    return fetchProperties()
  }

  function resetFilters() {
    search.value = ''
    statusFilter.value = ''
    typeFilter.value = ''
    page.value = 0
  }

  return {
    properties,
    currentProperty,
    rooms,
    isLoading,
    isLoadingRooms,
    error,
    page,
    totalPages,
    totalElements,
    size,
    search,
    statusFilter,
    typeFilter,
    hasNextPage,
    hasPreviousPage,
    fetchProperties,
    fetchProperty,
    fetchRooms,
    setPage,
    resetFilters,
  }
})
