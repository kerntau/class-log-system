<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Database, BarChart3 } from '@lucide/vue'

const route = useRoute()

// 数据文件模块的二级页签配置。
const tabs = [
  { label: '导入导出', path: '/data-files', icon: Database, name: 'DataManage' },
  { label: '日志统计', path: '/data-files/logs', icon: BarChart3, name: 'DataLogs' },
]

const activeTab = computed(() => route.name)
</script>

<template>
  <section class="module-layout">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">管理员</p>
        <h1>数据文件管理</h1>
        <p>系统数据以 JSON 文件结构保存，管理员可导入、导出、恢复初始数据。</p>
      </div>
    </div>

    <nav class="datafiles-tabs" role="tablist" aria-label="数据管理导航">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.path"
        class="tab-link"
        :class="{ active: activeTab === tab.name }"
        role="tab"
        :aria-selected="activeTab === tab.name"
      >
        <component :is="tab.icon" :size="15" aria-hidden="true" />
        {{ tab.label }}
      </RouterLink>
    </nav>
    <router-view />
  </section>
</template>

<style scoped>
.datafiles-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  padding: 4px;
  background: var(--surface-soft);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.tab-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.15s ease;
  flex: 1;
  justify-content: center;
}

.tab-link:hover {
  color: var(--text-dark);
  background: rgba(255, 255, 255, 0.6);
}

.tab-link.active {
  color: var(--primary);
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>
