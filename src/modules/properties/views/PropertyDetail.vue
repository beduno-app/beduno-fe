<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePropertiesStore } from '../store/properties.store'
import { propertiesApi } from '../api/properties.api'
import type { UpdatePropertyPayload, GenderRule, PropertyType, Room } from '../types/property.types'
import RoomManagement from '../components/RoomManagement.vue'
import { BaseButton, BaseInput, BaseBadge } from '@/shared/components'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = usePropertiesStore()

const isLoading = ref(true)
const isSaving = ref(false)
const error = ref('')
const isEditing = ref(false)
const editForm = ref<UpdatePropertyPayload>({})
const selectedRoom = ref<Room | null>(null)
const showRoomManagement = ref(false)

const propertyId = computed(() => route.params.id as string)

const typeOptions: { value: PropertyType; label: string }[] = [
  { value: 'INTERNAL', label: t('properties.type.INTERNAL') },
  { value: 'PARTNER', label: t('properties.type.PARTNER') },
]

const genderRuleOptions: { value: GenderRule; label: string }[] = [
  { value: 'PER_ROOM', label: t('properties.genderRule.PER_ROOM') },
  { value: 'PER_PROPERTY', label: t('properties.genderRule.PER_PROPERTY') },
  { value: 'MIXED', label: t('properties.genderRule.MIXED') },
]

function occupancyPercent(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

function roomOccupancyVariant(room: Room): 'success' | 'warning' | 'danger' | 'default' {
  if (room.status === 'BLOCKED') return 'danger'
  if (room.availableSpots === 0) return 'danger'
  if (room.availableSpots <= 1) return 'warning'
  return 'success'
}

async function load() {
  isLoading.value = true
  error.value = ''
  try {
    await Promise.all([store.fetchProperty(propertyId.value), store.fetchRooms(propertyId.value)])
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load property'
  } finally {
    isLoading.value = false
  }
}

function startEdit() {
  if (!store.currentProperty) return
  editForm.value = {
    name: store.currentProperty.name,
    address: store.currentProperty.address,
    type: store.currentProperty.type,
    genderRule: store.currentProperty.genderRule,
    notes: store.currentProperty.notes,
  }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

async function saveEdit() {
  isSaving.value = true
  error.value = ''
  try {
    store.currentProperty = await propertiesApi.updateProperty(propertyId.value, editForm.value)
    isEditing.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save property'
  } finally {
    isSaving.value = false
  }
}

async function deleteProperty() {
  if (!confirm(t('properties.confirmDelete'))) return
  try {
    await propertiesApi.deleteProperty(propertyId.value)
    router.push({ name: 'Properties' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to delete property'
  }
}

function openAddRoom() {
  selectedRoom.value = null
  showRoomManagement.value = true
}

function openEditRoom(room: Room) {
  selectedRoom.value = room
  showRoomManagement.value = true
}

function onRoomSaved() {
  showRoomManagement.value = false
  store.fetchRooms(propertyId.value)
  store.fetchProperty(propertyId.value)
}

onMounted(load)
</script>

<template>
  <div class="property-detail">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'Properties' })"
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
    <template v-else-if="store.currentProperty">
      <div class="detail-header">
        <div>
          <h2>{{ store.currentProperty.name }}</h2>
          <p class="address">
            {{ store.currentProperty.address }}
          </p>
        </div>
        <div class="detail-actions">
          <BaseButton
            v-if="!isEditing"
            size="sm"
            @click="startEdit"
          >
            {{ t('common.edit') }}
          </BaseButton>
          <BaseButton
            v-if="!isEditing"
            variant="danger"
            size="sm"
            @click="deleteProperty"
          >
            {{ t('common.delete') }}
          </BaseButton>
        </div>
      </div>

      <!-- View mode -->
      <div
        v-if="!isEditing"
        class="info-card"
      >
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">{{ t('properties.typeLabel') }}</span>
            <BaseBadge>{{ t(`properties.type.${store.currentProperty.type}`) }}</BaseBadge>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('properties.statusLabel') }}</span>
            <BaseBadge :variant="store.currentProperty.status === 'ACTIVE' ? 'success' : 'default'">
              {{ t(`properties.status.${store.currentProperty.status}`) }}
            </BaseBadge>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('properties.genderRuleLabel') }}</span>
            <span>{{ t(`properties.genderRule.${store.currentProperty.genderRule}`) }}</span>
          </div>
          <div
            v-if="store.currentProperty.notes"
            class="info-item"
          >
            <span class="info-label">{{ t('properties.notes') }}</span>
            <span>{{ store.currentProperty.notes }}</span>
          </div>
        </div>

        <!-- Occupancy overview -->
        <div class="occupancy-overview">
          <div class="occupancy-header">
            <span class="occupancy-label">{{ t('properties.occupancy') }}</span>
            <span class="occupancy-value">
              {{ store.currentProperty.roomSummary.currentOccupancy }} /
              {{ store.currentProperty.roomSummary.totalCapacity }}
              ({{ occupancyPercent(store.currentProperty.roomSummary.currentOccupancy, store.currentProperty.roomSummary.totalCapacity) }}%)
            </span>
          </div>
          <div class="occupancy-bar">
            <div
              class="occupancy-fill"
              :style="{ width: occupancyPercent(store.currentProperty.roomSummary.currentOccupancy, store.currentProperty.roomSummary.totalCapacity) + '%' }"
            />
          </div>
          <div class="occupancy-stats">
            <span>{{ store.currentProperty.roomSummary.totalRooms }} {{ t('properties.rooms') }}</span>
            <span>{{ t('properties.capacity') }}: {{ store.currentProperty.roomSummary.totalCapacity }}</span>
            <span
              v-if="store.currentProperty.roomSummary.totalBlockedSpots > 0"
              class="blocked-info"
            >
              {{ store.currentProperty.roomSummary.totalBlockedSpots }} {{ t('properties.blocked') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Edit mode -->
      <div
        v-else
        class="info-card"
      >
        <div class="edit-form">
          <BaseInput
            v-model="editForm.name!"
            :label="t('properties.name')"
            required
          />
          <BaseInput
            v-model="editForm.address!"
            :label="t('properties.address')"
            required
          />
          <div class="input-group">
            <label class="input-label">{{ t('properties.typeLabel') }}</label>
            <select
              v-model="editForm.type"
              class="filter-select"
            >
              <option
                v-for="opt in typeOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="input-group">
            <label class="input-label">{{ t('properties.genderRuleLabel') }}</label>
            <select
              v-model="editForm.genderRule"
              class="filter-select"
            >
              <option
                v-for="opt in genderRuleOptions"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <BaseInput
            v-model="editForm.notes!"
            :label="t('properties.notes')"
          />
          <div class="form-actions">
            <BaseButton
              variant="secondary"
              size="sm"
              @click="cancelEdit"
            >
              {{ t('common.cancel') }}
            </BaseButton>
            <BaseButton
              size="sm"
              :loading="isSaving"
              @click="saveEdit"
            >
              {{ t('common.save') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Room grid -->
      <div class="section">
        <div class="section-header">
          <h3>{{ t('properties.rooms') }}</h3>
          <BaseButton
            size="sm"
            @click="openAddRoom"
          >
            {{ t('properties.addRoom') }}
          </BaseButton>
        </div>

        <div
          v-if="store.isLoadingRooms"
          class="loading"
        >
          {{ t('common.loading') }}
        </div>
        <div
          v-else-if="store.rooms.length"
          class="room-grid"
        >
          <div
            v-for="room in store.rooms"
            :key="room.id"
            class="room-card"
            :class="`room-card--${roomOccupancyVariant(room)}`"
            @click="openEditRoom(room)"
          >
            <div class="room-header">
              <span class="room-number">{{ room.roomNumber }}</span>
              <span
                v-if="room.floor"
                class="room-floor"
              >F{{ room.floor }}</span>
            </div>
            <div class="room-occupancy">
              {{ room.currentOccupancy }} / {{ room.capacity }}
            </div>
            <div class="room-meta">
              <span class="room-rule">{{ t(`properties.roomGender.${room.genderRule}`) }}</span>
              <span
                v-if="room.blockedSpots > 0"
                class="room-blocked"
              >
                {{ room.blockedSpots }} {{ t('properties.blocked') }}
              </span>
            </div>
            <div
              v-if="room.occupants.length"
              class="room-occupants"
            >
              <span
                v-for="occ in room.occupants"
                :key="occ.stayId"
                class="occupant"
              >
                {{ occ.worker.firstName }} {{ occ.worker.lastName[0] }}.
              </span>
            </div>
          </div>
        </div>
        <p
          v-else
          class="muted"
        >
          {{ t('properties.noRooms') }}
        </p>
      </div>

      <RoomManagement
        v-if="showRoomManagement"
        :property-id="propertyId"
        :room="selectedRoom"
        @close="showRoomManagement = false"
        @saved="onRoomSaved"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.property-detail {
  max-width: 1100px;
}

.page-header {
  margin-bottom: 1rem;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
  }
}

.detail-actions {
  display: flex;
  gap: 0.5rem;
}

.address {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.info-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  .info-label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
}

.occupancy-overview {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}

.occupancy-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.375rem;
}

.occupancy-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.occupancy-value {
  font-size: 0.875rem;
  font-weight: 600;
}

.occupancy-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.occupancy-fill {
  height: 100%;
  background: #e66e00;
  border-radius: 4px;
  transition: width 0.3s;
}

.occupancy-stats {
  display: flex;
  gap: 1.5rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.blocked-info {
  color: #dc2626;
}

.edit-form {
  max-width: 480px;
}

.input-group {
  margin-bottom: 1rem;
}

.input-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: #374151;
}

.filter-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #fff;

  &:focus {
    outline: none;
    border-color: #e66e00;
    box-shadow: 0 0 0 2px rgba(230, 110, 0, 0.15);
  }
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1.125rem;
  }
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.room-card {
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &--success {
    border-color: #86efac;
  }
  &--warning {
    border-color: #fcd34d;
  }
  &--danger {
    border-color: #fca5a5;
  }
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}

.room-number {
  font-weight: 700;
  font-size: 1.125rem;
}

.room-floor {
  font-size: 0.75rem;
  color: #9ca3af;
}

.room-occupancy {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.room-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.room-blocked {
  color: #dc2626;
}

.room-occupants {
  border-top: 1px solid #f3f4f6;
  padding-top: 0.375rem;
}

.occupant {
  display: inline-block;
  font-size: 0.6875rem;
  background: #f3f4f6;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
  margin: 0.125rem 0.125rem 0 0;
}

.muted {
  color: #9ca3af;
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
</style>
