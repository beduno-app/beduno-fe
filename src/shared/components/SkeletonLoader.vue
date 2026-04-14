<script setup lang="ts">
withDefaults(
  defineProps<{
    lines?: number
    height?: string
    lastLineWidth?: string
  }>(),
  {
    lines: 3,
    height: '1rem',
    lastLineWidth: '60%',
  },
)
</script>

<template>
  <div
    class="skeleton-wrapper"
    aria-hidden="true"
  >
    <div
      v-for="n in lines"
      :key="n"
      class="skeleton-line"
      :style="{
        height,
        width: n === lines && lines > 1 ? lastLineWidth : '100%',
      }"
    />
  </div>
</template>

<style scoped lang="scss">
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
