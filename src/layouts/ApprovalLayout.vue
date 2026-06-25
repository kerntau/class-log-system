<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ClipboardCheck, History } from '@lucide/vue'

const route = useRoute()

// 审批模块的二级页签配置。
const tabs = [
  { label: '待审批', path: '/approval', icon: ClipboardCheck, name: 'ApprovalPending' },
  { label: '审批历史', path: '/approval/history', icon: History, name: 'ApprovalHistory' },
]

const activeTab = computed(() => route.name)
</script>

<template>
  <section class="module-layout">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">审批工作台</p>
        <h1>审批管理</h1>
        <p>集中处理班委提交的待审批班级日志，审批结果将通知班委。</p>
      </div>
    </div>

    <nav class="approval-tabs" role="tablist" aria-label="审批模块导航">
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
.approval-tabs {
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
