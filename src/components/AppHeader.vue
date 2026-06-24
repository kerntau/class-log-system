<script setup>
import { Bell, Building2, UserRound } from '@lucide/vue'
import RoleSwitcher from './RoleSwitcher.vue'

defineProps({
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
      <button class="icon-button" type="button" aria-label="通知">
        <Bell :size="18" aria-hidden="true" />
      </button>
      <RoleSwitcher :model-value="role" @update:model-value="emit('role-change', $event)" />
      <RouterLink to="/profile/info" class="profile-link">
        <UserRound :size="18" aria-hidden="true" />
        个人中心
      </RouterLink>
    </div>
  </header>
</template>
