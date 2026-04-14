import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import type { UserRole } from '@/modules/auth/types/auth.types'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/modules/auth/views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: () => import('@/modules/auth/views/Forbidden.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/shared/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/modules/auth/views/Dashboard.vue'),
        },
        {
          path: 'users',
          name: 'UserManagement',
          component: () => import('@/modules/admin/views/UserManagement.vue'),
          meta: { roles: ['AGENCY_ADMIN'] },
        },
        {
          path: 'roles',
          name: 'RolePermissions',
          component: () => import('@/modules/admin/views/RolePermissions.vue'),
          meta: { roles: ['AGENCY_ADMIN'] },
        },
        {
          path: 'workers',
          name: 'Workers',
          component: () => import('@/modules/workers/views/WorkerList.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER'] },
        },
        {
          path: 'workers/new',
          name: 'WorkerCreate',
          component: () => import('@/modules/workers/views/WorkerCreate.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER'] },
        },
        {
          path: 'workers/import',
          name: 'WorkerImport',
          component: () => import('@/modules/workers/views/WorkerImport.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER'] },
        },
        {
          path: 'workers/:id',
          name: 'WorkerDetail',
          component: () => import('@/modules/workers/views/WorkerDetail.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER'] },
        },
        {
          path: 'workers/:id/badge',
          name: 'QrBadge',
          component: () => import('@/modules/workers/components/QrBadge.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER'] },
        },
        {
          path: 'properties',
          name: 'Properties',
          component: () => import('@/modules/properties/views/PropertyList.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER'] },
        },
        {
          path: 'properties/new',
          name: 'PropertyCreate',
          component: () => import('@/modules/properties/views/PropertyCreate.vue'),
          meta: { roles: ['AGENCY_ADMIN'] },
        },
        {
          path: 'properties/:id',
          name: 'PropertyDetail',
          component: () => import('@/modules/properties/views/PropertyDetail.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER'] },
        },
        {
          path: 'stays',
          name: 'Stays',
          component: () => import('@/modules/stays/views/StayPlanner.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER', 'PROPERTY_ADMIN', 'FRONT_DESK'] },
        },
        {
          path: 'stays/new',
          name: 'StayCreate',
          component: () => import('@/modules/stays/views/CreateStay.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER', 'PROPERTY_ADMIN'] },
        },
        {
          path: 'stays/bulk-assign',
          name: 'BulkAssign',
          component: () => import('@/modules/stays/views/BulkAssign.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER'] },
        },
        {
          path: 'stays/:id',
          name: 'StayDetail',
          component: () => import('@/modules/stays/views/StayDetail.vue'),
          meta: { roles: ['AGENCY_ADMIN', 'AGENCY_PLANNER', 'PROPERTY_ADMIN', 'FRONT_DESK'] },
        },
        {
          path: 'arrivals',
          name: 'Arrivals',
          component: () => import('@/modules/arrivals/views/ArrivalsToday.vue'),
          meta: { roles: ['PROPERTY_ADMIN', 'FRONT_DESK'] },
        },
        {
          path: 'in-house',
          name: 'InHouse',
          component: () => import('@/modules/inhouse/views/InHouseView.vue'),
          meta: { roles: ['PROPERTY_ADMIN', 'FRONT_DESK'] },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth !== false && !auth.isAuthenticated) {
    return { name: 'Login' }
  }

  if (to.name === 'Login' && auth.isAuthenticated) {
    return { name: 'Dashboard' }
  }

  const requiredRoles = to.meta.roles
  if (requiredRoles && auth.userRole && !requiredRoles.includes(auth.userRole)) {
    return { name: 'Forbidden' }
  }
})

export default router
