<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    label?: string
    type?: string
    placeholder?: string
    error?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    label: undefined,
    type: 'text',
    placeholder: undefined,
    error: undefined,
    required: false,
    disabled: false,
  },
)
</script>

<template>
  <div class="input-group" :class="{ 'input-group--error': error }">
    <label v-if="label" class="input-label">
      {{ label }}
      <span v-if="required" class="input-required">*</span>
    </label>
    <input
      v-model="model"
      class="input-field"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
    />
    <span v-if="error" class="input-error">{{ error }}</span>
  </div>
</template>

<style scoped lang="scss">
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

.input-required {
  color: #dc2626;
}

.input-field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  box-sizing: border-box;
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: #e66e00;
    box-shadow: 0 0 0 2px rgba(230, 110, 0, 0.15);
  }

  &:disabled {
    background: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
}

.input-group--error .input-field {
  border-color: #dc2626;

  &:focus {
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
  }
}

.input-error {
  display: block;
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
}
</style>
