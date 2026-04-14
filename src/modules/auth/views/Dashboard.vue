<script setup lang="ts">
import { useAuthStore } from '../store/auth.store'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t } = useI18n()
</script>

<template>
  <div>
    <h2>{{ t('nav.dashboard') }}</h2>
    <p v-if="auth.user">
      {{ auth.user.name }} ({{ auth.user.role }})
    </p>
  </div>
</template>
