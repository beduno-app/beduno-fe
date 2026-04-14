<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  }>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <span class="badge" :class="`badge--${variant}`">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;

  &--default {
    background: #f3f4f6;
    color: #4b5563;
  }
  &--success {
    background: #dcfce7;
    color: #166534;
  }
  &--warning {
    background: #fef3c7;
    color: #92400e;
  }
  &--danger {
    background: #fee2e2;
    color: #991b1b;
  }
  &--info {
    background: #dbeafe;
    color: #1e40af;
  }
}
</style>
