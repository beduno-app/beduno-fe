<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { propertiesApi } from '../api/properties.api'
import type { CreatePropertyPayload } from '../types/property.types'
import { BaseButton, BaseInput } from '@/shared/components'

const router = useRouter()
const { t } = useI18n()

const form = ref<CreatePropertyPayload>({
  name: '',
  address: '',
  city: '',
  notes: '',
})
const isSaving = ref(false)
const error = ref('')

async function save() {
  isSaving.value = true
  error.value = ''
  try {
    const property = await propertiesApi.createProperty(form.value)
    router.push({ name: 'PropertyDetail', params: { id: property.id } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create property'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="property-create">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'Properties' })"
      >
        {{ t('common.back') }}
      </BaseButton>
    </div>

    <h2>{{ t('properties.addProperty') }}</h2>

    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <div class="form-card">
      <BaseInput
        v-model="form.name"
        :label="t('properties.name')"
        required
      />
      <BaseInput
        v-model="form.address!"
        :label="t('properties.address')"
      />
      <BaseInput
        v-model="form.city!"
        :label="t('properties.city')"
      />
      <BaseInput
        v-model="form.notes!"
        :label="t('properties.notes')"
      />

      <div class="form-actions">
        <BaseButton
          variant="secondary"
          @click="router.push({ name: 'Properties' })"
        >
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton
          :loading="isSaving"
          @click="save"
        >
          {{ t('common.save') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.property-create {
  max-width: 600px;
}

.page-header {
  margin-bottom: 1rem;
}

.form-card {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
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
  margin-top: 1.5rem;
}

.error {
  color: #dc2626;
  padding: 0.5rem 0;
}
</style>
