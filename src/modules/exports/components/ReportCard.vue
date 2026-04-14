<script setup lang="ts">
defineProps<{
  title: string
  description: string
  isGenerating?: boolean
  error?: string
}>()
</script>

<template>
  <div class="report-card">
    <div class="card-header">
      <h3 class="card-title">
        {{ title }}
      </h3>
      <p class="card-description">
        {{ description }}
      </p>
    </div>
    <div class="card-filters">
      <slot name="filters" />
    </div>
    <div
      v-if="error"
      class="card-error"
    >
      {{ error }}
    </div>
    <div class="card-actions">
      <slot
        name="actions"
        :is-generating="isGenerating"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.report-card {
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
}

.card-title {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.card-description {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.card-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
}

.card-error {
  font-size: 0.875rem;
  color: #991b1b;
  background: #fee2e2;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
