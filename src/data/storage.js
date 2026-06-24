import { initialLogs, initialNotifications, initialUser, roleUsers } from './mockData'

const DATA_FILES = {
  logs: '/data/logs.json',
  users: '/data/users.json',
  notifications: '/data/notifications.json',
}

// 内存缓存
let logsCache = null
let userCache = null
let notificationsCache = null
let roleCache = localStorage.getItem('class_log_role') || 'student'

// 从文件加载数据
async function loadFromFile(path, fallback) {
  try {
    const response = await fetch(path)
    if (!response.ok) {
      console.warn(`无法加载 ${path}，使用默认数据`)
      return fallback
    }
    return await response.json()
  } catch (error) {
    console.error(`读取文件 ${path} 失败`, error)
    return fallback
  }
}

// 初始化：从文件加载到内存
export async function initStorage() {
  logsCache = await loadFromFile(DATA_FILES.logs, initialLogs)
  // 根据当前角色加载对应用户
  const roleUser = roleUsers[roleCache]
  userCache = roleUser ? { ...roleUser } : await loadFromFile(DATA_FILES.users, initialUser)
  notificationsCache = await loadFromFile(DATA_FILES.notifications, initialNotifications)
}

// 日志相关操作
export function getLogs() {
  return logsCache || []
}

export function saveLogs(logs) {
  logsCache = logs
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

// 用户相关操作
export function getUser() {
  return { ...userCache }
}

export function saveUser(user) {
  userCache = { ...user }
}

// 通知相关操作
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
}

export function markNotificationAsRead(id) {
  const notifications = getNotifications()
  const notification = notifications.find((n) => n.id === id)
  if (notification) {
    notification.read = true
    notificationsCache = [...notifications]
  }
}

export function markAllNotificationsAsRead() {
  notificationsCache = getNotifications().map((n) => ({ ...n, read: true }))
}

export function deleteNotification(id) {
  notificationsCache = getNotifications().filter((n) => n.id !== id)
}

// 角色相关操作
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

// 数据重置
export function resetDemoData() {
  saveLogs(initialLogs)
  saveUser(initialUser)
  notificationsCache = [...initialNotifications]
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
