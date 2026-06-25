import { createRouter, createWebHistory } from 'vue-router'

// 按业务模块拆分路由：日志、审批、数据文件各自使用二级布局。
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/logs',
    component: () => import('@/layouts/LogsLayout.vue'),
    children: [
      {
        path: '',
        name: 'LogList',
        component: () => import('@/views/LogListView.vue'),
      },
      {
        path: 'create',
        name: 'LogCreate',
        component: () => import('@/views/LogCreateView.vue'),
        meta: { allowedRoles: ['student'] },
      },
      {
        path: 'detail/:id',
        name: 'LogDetail',
        component: () => import('@/views/LogDetailView.vue'),
      },
    ],
  },
  {
    path: '/approval',
    component: () => import('@/layouts/ApprovalLayout.vue'),
    meta: { allowedRoles: ['teacher'] },
    children: [
      {
        path: '',
        name: 'ApprovalPending',
        component: () => import('@/views/ApprovalPendingView.vue'),
      },
      {
        path: 'history',
        name: 'ApprovalHistory',
        component: () => import('@/views/ApprovalHistoryView.vue'),
      },
    ],
  },
  {
    path: '/data-files',
    component: () => import('@/layouts/DataFilesLayout.vue'),
    meta: { allowedRoles: ['admin'] },
    children: [
      {
        path: '',
        name: 'DataManage',
        component: () => import('@/views/DataManageView.vue'),
      },
      {
        path: 'logs',
        name: 'DataLogs',
        component: () => import('@/views/DataLogsView.vue'),
      },
    ],
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileInfo.vue'),
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 角色守卫读取本地角色，拦截无权限访问的模块入口。
router.beforeEach((to) => {
  const role = localStorage.getItem('class_log_role') || 'student'
  const hasAccess = to.matched.every(
    (record) => !record.meta.allowedRoles || record.meta.allowedRoles.includes(role),
  )
  if (!hasAccess) {
    return { name: 'Home' }
  }
})

export default router
