<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePropertiesStore } from '@/modules/properties/store/properties.store'
import { BaseButton } from '@/shared/components'

defineProps<{
  stayId: string
}>()

const emit = defineEmits<{
  confirm: [targetRoomId: string]
  cancel: []
}>()

const { t } = useI18n()
const propertiesStore = usePropertiesStore()

const targetPropertyId = ref('')
const targetRoomId = ref('')

watch(targetPropertyId, async (newId) => {
  targetRoomId.value = ''
  if (newId) {
    await propertiesStore.fetchRooms(newId)
  }
})

function submit() {
  if (!targetPropertyId.value || !targetRoomId.value) return
  emit('confirm', targetRoomId.value)
}
</script>

<template>
  <div class="move-action">
    <h3 class="move-title">
      {{ t('arrivals.moveTitle') }}
    </h3>

    <div class="input-group">
      <label class="input-label">{{ t('arrivals.targetProperty') }}</label>
      <select
        v-model="targetPropertyId"
        class="filter-select"
      >
        <option value="">
          {{ t('stays.selectProperty') }}
        </option>
        <option
          v-for="prop in propertiesStore.properties"
          :key="prop.id"
          :value="prop.id"
        >
          {{ prop.name }}
        </option>
      </select>
    </div>

    <div class="input-group">
      <label class="input-label">{{ t('arrivals.targetRoom') }}</label>
      <select
        v-model="targetRoomId"
        class="filter-select"
        :disabled="!targetPropertyId"
      >
        <option value="">
          {{ t('stays.selectRoom') }}
        </option>
        <option
          v-for="r in propertiesStore.rooms"
          :key="r.id"
          :value="r.id"
        >
          {{ r.roomNumber }} ({{ r.availableBedCount }}/{{ r.bedCount }})
        </option>
      </select>
    </div>

    <div class="form-actions">
      <BaseButton
        variant="secondary"
        size="sm"
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </BaseButton>
      <BaseButton
        size="sm"
        :disabled="!targetPropertyId || !targetRoomId"
        @click="submit"
      >
        {{ t('arrivals.confirmMove') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.move-action {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.move-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.input-group {
  margin-bottom: 0.75rem;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
