<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Building2, UserRound } from '@lucide/vue'
import RoleSwitcher from './RoleSwitcher.vue'
import { getNotifications } from '@/data/storage'

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

const unreadCount = computed(() => {
  // 依赖 route 变化触发重新计算
  router.currentRoute.value.path
  const notifications = getNotifications()
  if (props.role === 'student') {
    return notifications.filter(
      (n) => !n.read && (!n.targetStudentNo || n.targetStudentNo === props.user.studentNo),
    ).length
  }
  return notifications.filter((n) => !n.read).length
})

function goToNotifications() {
  router.push('/notifications')
}
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand" aria-label="返回首页">
      <span class="brand-mark">
        <Building2 :size="24" aria-hidden="true" />
      </span>
      <span>
        <strong>班级日志管理系统</strong>
        <small>学生填报 / 辅导员审批 / 管理员归档</small>
      </span>
    </RouterLink>

    <div class="header-actions">
      <div class="header-user">
        <strong>{{ user.name }}</strong>
        <span>{{ user.className }} · {{ user.studentNo }}</span>
      </div>
      <button
        class="icon-button notification-button"
        type="button"
        aria-label="通知"
        @click="goToNotifications"
      >
        <Bell :size="18" aria-hidden="true" />
        <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </button>
      <RoleSwitcher :model-value="role" @update:model-value="emit('role-change', $event)" />
      <RouterLink to="/profile/info" class="profile-link">
        <UserRound :size="18" aria-hidden="true" />
        个人中心
      </RouterLink>
    </div>
  </header>
</template>

<style scoped>
.notification-button {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}
</style>
