<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { FolderClock, PenLine, FileText } from '@lucide/vue'

const route = useRoute()

// 根据当前子路由生成记录库面包屑。
const breadcrumb = computed(() => {
  const name = route.name
  if (name === 'LogCreate') return { label: '填报日志', icon: PenLine }
  if (name === 'LogDetail') return { label: '日志详情', icon: FileText }
  return null
})
</script>

<template>
  <section class="logs-layout">
    <nav class="logs-breadcrumb" aria-label="面包屑导航">
      <RouterLink to="/logs" class="breadcrumb-link" :class="{ active: !breadcrumb }">
        <FolderClock :size="14" aria-hidden="true" />
        记录库
      </RouterLink>
      <template v-if="breadcrumb">
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">
          <component :is="breadcrumb.icon" :size="14" aria-hidden="true" />
          {{ breadcrumb.label }}
        </span>
      </template>
    </nav>
    <router-view />
  </section>
</template>

<style scoped>
.logs-layout {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.logs-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 0 14px;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-hint);
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.breadcrumb-link:hover {
  color: var(--primary-dark);
}

.breadcrumb-link.active {
  color: var(--text-dark);
  font-weight: 700;
  cursor: default;
}

.breadcrumb-link.active:hover {
  text-decoration: none;
}

.breadcrumb-sep {
  color: var(--text-hint);
  user-select: none;
}

.breadcrumb-current {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-weight: 600;
}
</style>
