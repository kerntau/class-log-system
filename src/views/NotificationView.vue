<script setup>
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Check, CheckCheck, Trash2 } from '@lucide/vue'
import EmptyState from '@/components/EmptyState.vue'
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/data/storage'

const router = useRouter()
const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const notifications = ref(getNotifications())

// 学生只看发给自己的通知，辅导员和管理员看全部
const visibleNotifications = computed(() => {
  if (currentRole.value === 'student') {
    return notifications.value.filter(
      (n) => !n.targetStudentNo || n.targetStudentNo === currentUser.value.studentNo,
    )
  }
  return notifications.value
})

const unreadCount = computed(() => visibleNotifications.value.filter((n) => !n.read).length)

function refresh() {
  notifications.value = getNotifications()
}

function handleRead(notification) {
  if (!notification.read) {
    markNotificationAsRead(notification.id)
    refresh()
  }
  if (notification.logId) {
    router.push(`/logs/detail/${notification.logId}`)
  }
}

function handleMarkAll() {
  markAllNotificationsAsRead()
  refresh()
}

function handleDelete(id) {
  deleteNotification(id)
  refresh()
}

const typeMap = {
  success: { className: 'type-success', label: '通过' },
  warning: { className: 'type-warning', label: '退回' },
  info: { className: 'type-info', label: '通知' },
}
</script>

<template>
  <section class="page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">消息中心</p>
        <h1>站内通知</h1>
        <p>查看审批结果和系统消息，及时了解日志处理进度。</p>
      </div>
    </div>

    <section class="panel">
      <header class="panel-header">
        <div>
          <p class="eyebrow">未读 {{ unreadCount }} 条</p>
          <h2>通知列表</h2>
        </div>
        <button
          v-if="unreadCount > 0"
          class="secondary-button"
          type="button"
          @click="handleMarkAll"
        >
          <CheckCheck :size="16" aria-hidden="true" />
          全部标记已读
        </button>
      </header>

      <div class="notification-list">
        <article
          v-for="notification in visibleNotifications"
          :key="notification.id"
          class="notification-row"
          :class="{ unread: !notification.read }"
        >
          <div class="notification-icon" :class="typeMap[notification.type]?.className">
            <Bell :size="18" aria-hidden="true" />
          </div>
          <div class="notification-body" @click="handleRead(notification)">
            <div class="notification-title">
              <strong>{{ notification.title }}</strong>
              <span v-if="!notification.read" class="unread-dot" aria-label="未读"></span>
            </div>
            <p>{{ notification.content }}</p>
            <time>{{ notification.createdAt }}</time>
          </div>
          <div class="notification-actions">
            <button
              v-if="!notification.read"
              class="icon-button"
              type="button"
              aria-label="标记已读"
              @click="handleRead(notification)"
            >
              <Check :size="16" aria-hidden="true" />
            </button>
            <button
              class="icon-button"
              type="button"
              aria-label="删除通知"
              @click="handleDelete(notification.id)"
            >
              <Trash2 :size="16" aria-hidden="true" />
            </button>
          </div>
        </article>

        <EmptyState v-if="visibleNotifications.length === 0" text="暂无通知消息" />
      </div>
    </section>
  </section>
</template>

<style scoped>
.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  transition: all 0.2s ease;
}

.notification-row.unread {
  background: #eff6ff;
  border-color: rgba(37, 99, 235, 0.2);
}

.notification-row:hover {
  box-shadow: var(--shadow-sm);
}

.notification-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.type-success {
  background: #d1fae5;
  color: #065f46;
}

.type-warning {
  background: #fee2e2;
  color: #991b1b;
}

.type-info {
  background: #dbeafe;
  color: #1e40af;
}

.notification-body {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-title strong {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
}

.notification-body p {
  margin-top: 4px;
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
}

.notification-body time {
  display: block;
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.notification-actions .icon-button {
  width: 34px;
  height: 34px;
  min-height: 34px;
}
</style>
