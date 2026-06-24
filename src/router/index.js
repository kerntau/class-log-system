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
  },
  {
    path: '/data-files',
    name: 'DataFiles',
    component: () => import('@/views/DataFilesView.vue'),
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationView.vue'),
  },
  {
    path: '/profile',
    component: () => import('@/views/ProfileView.vue'),
    children: [
      {
        path: '',
        redirect: '/profile/info',
      },
      {
        path: 'info',
        name: 'ProfileInfo',
        component: () => import('@/views/ProfileInfo.vue'),
      },
      {
        path: 'my-logs',
        name: 'ProfileLogs',
        component: () => import('@/views/ProfileLogs.vue'),
      },
    ],
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
