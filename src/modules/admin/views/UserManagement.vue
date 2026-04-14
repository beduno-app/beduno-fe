<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminApi } from '@/modules/admin/api/admin.api'
import type { AuthUser } from '@/modules/auth/types/auth.types'

const { t } = useI18n()

const users = ref<AuthUser[]>([])
const isLoading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await adminApi.getUsers()
    users.value = response.content
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('users.loadFailed')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div>
    <h2>{{ t('nav.users') }}</h2>

    <div
      v-if="isLoading"
      class="loading"
    >
      {{ t('common.loading') }}
    </div>
    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>
    <table
      v-else-if="users.length"
      class="users-table"
    >
      <thead>
        <tr>
          <th>{{ t('auth.email') }}</th>
          <th>{{ t('common.name') }}</th>
          <th>{{ t('common.role') }}</th>
          <th>{{ t('common.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
        >
          <td>{{ user.email }}</td>
          <td>{{ user.firstName }} {{ user.lastName }}</td>
          <td><span class="role-badge">{{ user.role }}</span></td>
          <td>
            <button class="action-btn">
              {{ t('common.edit') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p
      v-else
      class="empty"
    >
      {{ t('users.noUsers') }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th,
  td {
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.875rem;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
  }

  td {
    border-bottom: 1px solid #f3f4f6;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.role-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

.action-btn {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: #374151;

  &:hover {
    background: #f9fafb;
  }
}

.loading,
.error,
.empty {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #dc2626;
}
</style>
