import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/logs/create',
    name: 'LogCreate',
    component: () => import('@/views/LogCreateView.vue'),
    meta: { allowedRoles: ['student'] },
  },
  {
    path: '/logs',
    name: 'LogList',
    component: () => import('@/views/LogListView.vue'),
  },
  {
    path: '/logs/detail/:id',
    name: 'LogDetail',
    component: () => import('@/views/LogDetailView.vue'),
  },
  {
    path: '/approval',
    name: 'Approval',
    component: () => import('@/views/ApprovalView.vue'),
    meta: { allowedRoles: ['teacher'] },
  },
  {
    path: '/data-files',
    name: 'DataFiles',
    component: () => import('@/views/DataFilesView.vue'),
    meta: { allowedRoles: ['admin'] },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationView.vue'),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 角色守卫
router.beforeEach((to) => {
  const role = localStorage.getItem('class_log_role') || 'student'
  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(role)) {
    return { name: 'Home' }
  }
})

export default router
