<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <h1>403</h1>
      <p>You do not have permission to access this page.</p>
      <button @click="router.push({ name: 'Dashboard' })">
        Go to Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.forbidden-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.forbidden-card {
  text-align: center;
  background: #fff;
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: 4rem;
    color: #dc2626;
    margin: 0 0 0.5rem;
  }

  p {
    color: #666;
    margin-bottom: 1.5rem;
  }

  button {
    padding: 0.5rem 1.5rem;
    background: #e66e00;
    color: #fff;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;

    &:hover {
      background: #d46300;
    }
  }
}
</style>
