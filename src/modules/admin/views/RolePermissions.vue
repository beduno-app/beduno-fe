<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { UserRole } from '@/modules/auth/types/auth.types'

const { t } = useI18n()

const roles: UserRole[] = ['AGENCY_ADMIN', 'AGENCY_PLANNER', 'PROPERTY_ADMIN', 'FRONT_DESK']

interface PermissionRow {
  key: string
  permissions: Record<UserRole, boolean>
}

const permissionMatrix: PermissionRow[] = [
  {
    key: 'workers',
    permissions: {
      AGENCY_ADMIN: true,
      AGENCY_PLANNER: true,
      PROPERTY_ADMIN: false,
      FRONT_DESK: false,
    },
  },
  {
    key: 'properties',
    permissions: {
      AGENCY_ADMIN: true,
      AGENCY_PLANNER: true,
      PROPERTY_ADMIN: true,
      FRONT_DESK: false,
    },
  },
  {
    key: 'stays',
    permissions: {
      AGENCY_ADMIN: true,
      AGENCY_PLANNER: true,
      PROPERTY_ADMIN: true,
      FRONT_DESK: false,
    },
  },
  {
    key: 'checkin',
    permissions: {
      AGENCY_ADMIN: false,
      AGENCY_PLANNER: false,
      PROPERTY_ADMIN: true,
      FRONT_DESK: true,
    },
  },
  {
    key: 'occupancy',
    permissions: {
      AGENCY_ADMIN: true,
      AGENCY_PLANNER: true,
      PROPERTY_ADMIN: true,
      FRONT_DESK: true,
    },
  },
  {
    key: 'inspection',
    permissions: {
      AGENCY_ADMIN: false,
      AGENCY_PLANNER: false,
      PROPERTY_ADMIN: true,
      FRONT_DESK: true,
    },
  },
  {
    key: 'reports',
    permissions: {
      AGENCY_ADMIN: true,
      AGENCY_PLANNER: true,
      PROPERTY_ADMIN: true,
      FRONT_DESK: false,
    },
  },
  {
    key: 'users',
    permissions: {
      AGENCY_ADMIN: true,
      AGENCY_PLANNER: false,
      PROPERTY_ADMIN: false,
      FRONT_DESK: false,
    },
  },
]
</script>

<template>
  <div class="role-permissions">
    <h2>{{ t('permissions.title') }}</h2>
    <p class="subtitle">
      {{ t('permissions.subtitle') }}
    </p>

    <div class="table-wrapper">
      <table class="permissions-table">
        <thead>
          <tr>
            <th class="category-col">
              {{ t('permissions.category') }}
            </th>
            <th
              v-for="role in roles"
              :key="role"
              class="role-col"
            >
              {{ t(`roles.${role}`) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in permissionMatrix"
            :key="row.key"
          >
            <td class="category-cell">
              {{ t(`permissions.${row.key}`) }}
            </td>
            <td
              v-for="role in roles"
              :key="role"
              class="permission-cell"
            >
              <span
                v-if="row.permissions[role]"
                class="check"
              >&#10003;</span>
              <span
                v-else
                class="dash"
              >&mdash;</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.role-permissions {
  max-width: 900px;
}

.subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.table-wrapper {
  overflow-x: auto;
}

.permissions-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  th,
  td {
    padding: 0.75rem 1rem;
    text-align: center;
    font-size: 0.875rem;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }

  td {
    border-bottom: 1px solid #f3f4f6;
  }

  tr:nth-child(even) td {
    background: #fafafa;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.category-col,
.category-cell {
  text-align: left;
  font-weight: 500;
}

.role-col {
  min-width: 100px;
}

.check {
  color: #16a34a;
  font-weight: 700;
  font-size: 1rem;
}

.dash {
  color: #d1d5db;
  font-size: 1rem;
}
</style>
