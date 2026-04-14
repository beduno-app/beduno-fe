<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
)
</script>

<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn-spinner" />
    <slot />
  </button>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--sm {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
  }
  &--md {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  &--lg {
    padding: 0.625rem 1.5rem;
    font-size: 1rem;
  }

  &--primary {
    background: #e66e00;
    color: #fff;
    &:hover:not(:disabled) {
      background: #d46300;
    }
  }
  &--secondary {
    background: #fff;
    color: #374151;
    border-color: #d1d5db;
    &:hover:not(:disabled) {
      background: #f9fafb;
    }
  }
  &--danger {
    background: #dc2626;
    color: #fff;
    &:hover:not(:disabled) {
      background: #b91c1c;
    }
  }
  &--ghost {
    background: transparent;
    color: #374151;
    &:hover:not(:disabled) {
      background: #f3f4f6;
    }
  }
}

.btn-spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
