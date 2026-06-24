import { initialLogs, initialUser } from './mockData'

const KEY_LOGS = 'class_log_data'
const KEY_ROLE = 'class_log_role'
const KEY_USER = 'class_log_user'
const KEY_VERSION = 'class_log_schema_version'
const STORAGE_VERSION = '2026-06-24-redesign'

export function getLogs() {
  const raw = localStorage.getItem(KEY_LOGS)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('日志数据解析失败', error)
    return []
  }
}

function readJson(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw)
  } catch (error) {
    console.error('本机数据解析失败', error)
    return fallback
  }
}

export function saveLogs(logs) {
  localStorage.setItem(KEY_LOGS, JSON.stringify(logs))
}

export function initLogs() {
  if (localStorage.getItem(KEY_VERSION) !== STORAGE_VERSION) {
    saveLogs(initialLogs)
    localStorage.setItem(KEY_ROLE, 'student')
    localStorage.setItem(KEY_VERSION, STORAGE_VERSION)
    return
  }

  if (getLogs().length === 0) {
    saveLogs(initialLogs)
  }
}

export function initUser() {
  const existingUser = readJson(KEY_USER, null)
  if (!existingUser || existingUser.studentNo === '2024030420') {
    localStorage.setItem(KEY_USER, JSON.stringify(initialUser))
  }
}

export function getUser() {
  return { ...initialUser, ...readJson(KEY_USER, {}) }
}

export function saveUser(user) {
  localStorage.setItem(KEY_USER, JSON.stringify({ ...getUser(), ...user }))
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

export function getRole() {
  return localStorage.getItem(KEY_ROLE) || 'student'
}

export function setRole(role) {
  localStorage.setItem(KEY_ROLE, role)
}

export function resetDemoData() {
  saveLogs(initialLogs)
  saveUser(initialUser)
}

export function exportFileData() {
  return {
    version: 1,
    exportedAt: formatDateTime(),
    user: getUser(),
    logs: getLogs(),
  }
}

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
}

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
