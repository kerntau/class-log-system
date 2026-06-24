<script setup>
import { ClipboardCheck, Database, FilePenLine, FolderClock, Home, ShieldCheck, UserRound } from '@lucide/vue'

defineProps({
  role: {
    type: String,
    required: true,
  },
})

const navItems = [
  { label: '工作台', path: '/', icon: Home },
  { label: '填报日志', path: '/logs/create', icon: FilePenLine, studentOnly: true },
  { label: '日志记录', path: '/logs', icon: FolderClock },
  { label: '审批管理', path: '/approval', icon: ClipboardCheck, teacherOnly: true },
  { label: '数据文件', path: '/data-files', icon: Database, adminOnly: true },
  { label: '个人中心', path: '/profile/info', icon: UserRound },
]
</script>

<template>
  <aside class="app-sidebar" aria-label="系统导航">
    <nav>
      <RouterLink
        v-for="item in navItems"
        v-show="
          (!item.studentOnly || role === 'student') &&
          (!item.teacherOnly || role !== 'student') &&
          (!item.adminOnly || role === 'admin')
        "
        :key="item.path"
        :to="item.path"
        class="sidebar-link"
      >
        <component :is="item.icon" :size="18" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-note">
      <ShieldCheck :size="18" aria-hidden="true" />
      <span>数据存储于本地文件系统，可由管理员导入导出备份。</span>
    </div>
  </aside>
</template>
