<script setup lang="ts">
import { useToast } from '@/shared/composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      class="toast-container"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
        >
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            aria-label="Dismiss notification"
            @click="remove(toast.id)"
          >
            &times;
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: min(400px, calc(100vw - 2rem));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-size: 0.875rem;
  font-weight: 500;
  pointer-events: all;

  &--success {
    background: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  &--error {
    background: #fef2f2;
    color: #991b1b;
    border: 1px solid #fecaca;
  }

  &--warning {
    background: #fffbeb;
    color: #92400e;
    border: 1px solid #fde68a;
  }
}

.toast-message {
  flex: 1;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  color: currentColor;
  opacity: 0.6;
  padding: 0;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
}

.toast-enter-active {
  transition: all 0.2s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
