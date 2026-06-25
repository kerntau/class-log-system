import { ref } from 'vue'
import { initialLogs, initialNotifications, initialUser, roleUsers } from './mockData'

const DATA_FILES = {
  logs: '/data/logs.json',
  users: '/data/users.json',
  notifications: '/data/notifications.json',
}

// Demo 版没有后端，所有运行期修改都放在内存缓存中。
let logsCache = null
let userCache = null
let notificationsCache = null
let roleCache = localStorage.getItem('class_log_role') || 'student'

// 版本号用于通知页面组件刷新，避免到处传递事件总线。
export const logsVersion = ref(0)
export const notificationsVersion = ref(0)

function cloneData(data) {
  return JSON.parse(JSON.stringify(data))
}

// 从 public/data 加载 JSON，失败时回退到 mockData。
async function loadFromFile(path, fallback) {
  try {
    const response = await fetch(path)
    if (!response.ok) {
      console.warn(`无法加载 ${path}，使用默认数据`)
      return cloneData(fallback)
    }
    return await response.json()
  } catch (error) {
    console.error(`读取文件 ${path} 失败`, error)
    return cloneData(fallback)
  }
}

// 初始化阶段先把静态 JSON 读入内存，后续操作都基于缓存完成。
export async function initStorage() {
  logsCache = await loadFromFile(DATA_FILES.logs, initialLogs)
  // 根据当前角色加载演示用户，保证切换角色时视角一致。
  const roleUser = roleUsers[roleCache]
  userCache = roleUser ? { ...roleUser } : await loadFromFile(DATA_FILES.users, initialUser)
  notificationsCache = await loadFromFile(DATA_FILES.notifications, initialNotifications)
  logsVersion.value = 0
  notificationsVersion.value = 0
}

// 日志读写会递增 logsVersion，依赖它的页面会自动刷新。
export function getLogs() {
  return logsCache || []
}

export function saveLogs(logs) {
  logsCache = logs
  logsVersion.value += 1
}

export function addLog(log) {
  const logs = getLogs()
  logs.unshift(log)
  saveLogs(logs)
}

export function getLogById(id) {
  return getLogs().find((item) => item.id === Number(id)) || null
}

export function updateLog(id, partial) {
  const logs = getLogs()
  const index = logs.findIndex((item) => item.id === Number(id))
  if (index === -1) return false

  logs[index] = { ...logs[index], ...partial }
  saveLogs(logs)
  return true
}

export function deleteLog(id) {
  const logs = getLogs().filter((item) => item.id !== Number(id))
  saveLogs(logs)
}

// 用户资料只保存当前演示角色的一份本机缓存。
export function getUser() {
  return { ...userCache }
}

export function saveUser(user) {
  userCache = { ...user }
}

// 通知带有目标角色/班级/学生号，具体可见性由 access.js 统一过滤。
export function getNotifications() {
  return notificationsCache || []
}

export function addNotification(notification) {
  const notifications = getNotifications()
  notifications.unshift({
    id: Date.now(),
    read: false,
    createdAt: formatDateTime(),
    ...notification,
  })
  notificationsCache = notifications
  notificationsVersion.value += 1
}

export function markNotificationAsRead(id) {
  const notifications = getNotifications()
  const notification = notifications.find((n) => n.id === id)
  if (notification) {
    notification.read = true
    notificationsCache = [...notifications]
    notificationsVersion.value += 1
  }
}

export function markNotificationsAsRead(ids) {
  const idSet = new Set(ids)
  notificationsCache = getNotifications().map((n) => (idSet.has(n.id) ? { ...n, read: true } : n))
  notificationsVersion.value += 1
}

export function deleteNotification(id) {
  notificationsCache = getNotifications().filter((n) => n.id !== id)
  notificationsVersion.value += 1
}

// 切换角色会同步切换演示用户资料。
export function getRole() {
  return roleCache
}

export function setRole(role) {
  roleCache = role
  localStorage.setItem('class_log_role', role)
  // 切换角色时同步切换用户
  const roleUser = roleUsers[role]
  if (roleUser) {
    userCache = { ...roleUser }
  }
}

// 恢复初始数据时使用深拷贝，避免后续编辑污染 mockData 常量。
export function resetDemoData() {
  saveLogs(cloneData(initialLogs))
  saveUser(cloneData(initialUser))
  notificationsCache = cloneData(initialNotifications)
  notificationsVersion.value += 1
}

// 构建导出数据对象（无副作用）
export function buildExportData() {
  return {
    version: 1,
    exportedAt: formatDateTime(),
    user: getUser(),
    logs: getLogs(),
    notifications: getNotifications(),
  }
}

// 导出数据（下载为 JSON 文件）
export function exportFileData() {
  const data = buildExportData()

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `班级日志数据_${formatDateTime().replace(/[:\s]/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)

  return data
}

// 导入数据（从上传的文件）
export function importFileData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('文件内容不是有效的数据对象')
  }
  if (!Array.isArray(data.logs)) {
    throw new Error('文件中缺少 logs 数组')
  }

  saveLogs(data.logs)
  if (data.user && typeof data.user === 'object') {
    saveUser(data.user)
  }
  if (Array.isArray(data.notifications)) {
    notificationsCache = data.notifications
    notificationsVersion.value += 1
  }
}

// 工具函数
export function formatDateTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

export const statusMap = {
  draft: { text: '草稿', className: 'gray' },
  pending: { text: '待审批', className: 'orange' },
  approved: { text: '已通过', className: 'green' },
  rejected: { text: '已退回', className: 'red' },
  withdrawn: { text: '已撤回', className: 'gray' },
}
