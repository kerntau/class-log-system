<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Building2, LayoutGrid, Database, ClipboardCheck, PenLine, FolderClock, Menu, X } from '@lucide/vue'
import RoleSwitcher from './RoleSwitcher.vue'
import { getVisibleNotifications } from '@/data/access'
import { getNotifications, notificationsVersion } from '@/data/storage'

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['role-change'])
const router = useRouter()
const mobileNavOpen = ref(false)

// 读取通知版本号建立响应依赖，确保新增/已读后徽标自动刷新。
const unreadCount = computed(() => {
  notificationsVersion.value
  router.currentRoute.value.path
  return getVisibleNotifications(props.role, props.user, getNotifications()).filter((n) => !n.read).length
})

// 路由切换时关闭移动端导航。
watch(() => router.currentRoute.value.path, () => {
  mobileNavOpen.value = false
})

function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value
}

function goToNotifications() {
  router.push('/notifications')
  mobileNavOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-left">
        <RouterLink to="/" class="brand" aria-label="返回首页">
          <span class="brand-mark">
            <Building2 :size="22" aria-hidden="true" />
          </span>
          <span class="brand-text">
            <strong>班级日志</strong>
          </span>
        </RouterLink>

        <nav class="header-nav">
          <RouterLink to="/" class="nav-link">
            <LayoutGrid :size="16" /> 工作台
          </RouterLink>
          <RouterLink to="/logs" class="nav-link">
            <FolderClock :size="16" /> 记录库
          </RouterLink>
          <RouterLink v-if="role === 'student'" to="/logs/create" class="nav-link">
            <PenLine :size="16" /> 填报
          </RouterLink>
          <RouterLink v-if="role === 'teacher'" to="/approval" class="nav-link">
            <ClipboardCheck :size="16" /> 审批
          </RouterLink>
          <RouterLink v-if="role === 'admin'" to="/data-files" class="nav-link">
            <Database :size="16" /> 数据管理
          </RouterLink>
        </nav>
      </div>

      <div class="header-actions">
        <div class="header-tools">
          <RoleSwitcher :model-value="role" @update:model-value="emit('role-change', $event)" />
          <button
            class="icon-button notification-button"
            type="button"
            aria-label="通知"
            @click="goToNotifications"
          >
            <Bell :size="18" aria-hidden="true" />
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>
          <RouterLink to="/profile" class="profile-link" aria-label="个人中心">
            <span class="profile-avatar">{{ user.name.slice(0, 1) }}</span>
            <span class="profile-name">{{ user.name }}</span>
          </RouterLink>
          <button
            class="mobile-nav-toggle"
            type="button"
            :aria-label="mobileNavOpen ? '关闭导航' : '打开导航'"
            @click="toggleMobileNav"
          >
            <Menu v-if="!mobileNavOpen" :size="20" aria-hidden="true" />
            <X v-else :size="20" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <!-- 移动端导航面板 -->
    <template v-if="mobileNavOpen">
      <div class="mobile-nav-overlay" @click="mobileNavOpen = false"></div>
      <nav class="mobile-nav-panel">
        <RouterLink to="/" class="nav-link">
          <LayoutGrid :size="16" /> 工作台
        </RouterLink>
        <RouterLink to="/logs" class="nav-link">
          <FolderClock :size="16" /> 记录库
        </RouterLink>
        <RouterLink v-if="role === 'student'" to="/logs/create" class="nav-link">
          <PenLine :size="16" /> 填报日志
        </RouterLink>
        <RouterLink v-if="role === 'teacher'" to="/approval" class="nav-link">
          <ClipboardCheck :size="16" /> 审批管理
        </RouterLink>
        <RouterLink v-if="role === 'admin'" to="/data-files" class="nav-link">
          <Database :size="16" /> 数据管理
        </RouterLink>
        <RouterLink to="/notifications" class="nav-link">
          <Bell :size="16" /> 站内通知
          <span v-if="unreadCount > 0" class="mobile-badge">{{ unreadCount }}</span>
        </RouterLink>
        <RouterLink to="/profile" class="nav-link">
          <span class="profile-avatar" style="width:22px;height:22px;font-size:10px;">{{ user.name.slice(0, 1) }}</span>
          个人中心
        </RouterLink>
      </nav>
    </template>
  </header>
</template>

<style scoped>
.notification-button {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
  border: 1.5px solid #ffffff;
}

.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-soft);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
}

.profile-link:hover {
  color: var(--primary);
  border-color: var(--primary-soft);
  background: #ffffff;
}

.profile-avatar {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(135deg, var(--primary), #3b82f6);
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.profile-name {
  color: var(--text-dark);
  font-weight: 600;
}

/* 移动端汉堡按钮 - 默认隐藏 */
.mobile-nav-toggle {
  display: none;
}

.mobile-badge {
  margin-left: auto;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 9999px;
  background: var(--red);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .mobile-nav-toggle {
    display: flex;
  }
}
</style>
