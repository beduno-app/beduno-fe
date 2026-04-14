<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { workersApi } from '../api/workers.api'
import type { CreateWorkerPayload, Gender } from '../types/worker.types'
import { BaseButton, BaseInput } from '@/shared/components'

const router = useRouter()
const { t } = useI18n()

const form = ref<CreateWorkerPayload>({
  internalId: '',
  firstName: '',
  lastName: '',
  phone: '',
  gender: 'MALE',
  tags: [],
  notes: '',
})
const tagsInput = ref('')
const isSaving = ref(false)
const error = ref('')

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'MALE', label: t('workers.gender.MALE') },
  { value: 'FEMALE', label: t('workers.gender.FEMALE') },
  { value: 'OTHER', label: t('workers.gender.OTHER') },
]

async function save() {
  isSaving.value = true
  error.value = ''
  try {
    form.value.tags = tagsInput.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const worker = await workersApi.createWorker(form.value)
    router.push({ name: 'WorkerDetail', params: { id: worker.id } })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to create worker'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="worker-create">
    <div class="page-header">
      <BaseButton
        variant="ghost"
        size="sm"
        @click="router.push({ name: 'Workers' })"
      >
        {{ t('common.back') }}
      </BaseButton>
    </div>

    <h2>{{ t('workers.addWorker') }}</h2>

    <div
      v-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <div class="form-card">
      <BaseInput
        v-model="form.internalId"
        :label="t('workers.internalId')"
        placeholder="W-1234"
        required
      />
      <BaseInput
        v-model="form.firstName"
        :label="t('workers.firstName')"
        required
      />
      <BaseInput
        v-model="form.lastName"
        :label="t('workers.lastName')"
        required
      />
      <BaseInput
        v-model="form.phone"
        :label="t('workers.phone')"
        placeholder="+48..."
      />
      <div class="input-group">
        <label class="input-label">{{ t('workers.genderLabel') }}</label>
        <select
          v-model="form.gender"
          class="filter-select"
        >
          <option
            v-for="opt in genderOptions"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
      <BaseInput
        v-model="tagsInput"
        :label="t('workers.tagsHint')"
        placeholder="welder, forklift"
      />
      <BaseInput
        v-model="form.notes!"
        :label="t('workers.notes')"
      />

      <div class="form-actions">
        <BaseButton
          variant="secondary"
          @click="router.push({ name: 'Workers' })"
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
.worker-create {
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
