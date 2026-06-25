<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Clock } from '@lucide/vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusTag from '@/components/StatusTag.vue'
import { getAccessibleLogs } from '@/data/access'
import { getLogs, logsVersion } from '@/data/storage'

const router = useRouter()
const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const logs = ref(getLogs())

watch([currentRole, logsVersion], () => {
  logs.value = getLogs()
}, { immediate: true })

// 已审批历史只包含本班级中 approved/rejected 状态的日志。
const historyLogs = computed(() => {
  return getAccessibleLogs(currentRole.value, currentUser.value, logs.value)
    .filter((log) => log.status === 'approved' || log.status === 'rejected')
    .sort((a, b) => {
      // 按审批时间倒序
      const timeA = a.approveTime || a.submitTime || ''
      const timeB = b.approveTime || b.submitTime || ''
      return timeB.localeCompare(timeA)
    })
})
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">已审批 {{ historyLogs.length }} 条</p>
        <h2>{{ currentUser.className }} 审批历史</h2>
      </div>
    </header>

    <div class="stack">
      <article
        v-for="log in historyLogs"
        :key="log.id"
        class="history-item"
        @click="router.push(`/logs/detail/${log.id}`)"
      >
        <div class="history-main">
          <div class="history-title">
            <h3>{{ log.courseName }}</h3>
            <StatusTag :status="log.status" />
          </div>
          <div class="history-meta">
            <span>{{ log.studentName }}</span>
            <span>{{ log.logDate }}</span>
            <span>{{ log.section }}</span>
          </div>
          <p v-if="log.approveOpinion" class="history-opinion">
            审批意见：{{ log.approveOpinion }}
          </p>
        </div>
        <div class="history-time">
          <Clock :size="14" aria-hidden="true" />
          <span>{{ log.approveTime }}</span>
        </div>
      </article>
      <EmptyState
        v-if="historyLogs.length === 0"
        text="暂无审批历史记录"
        action-text="查看待审批"
        @action="router.push('/approval')"
      />
    </div>
  </section>
</template>

<style scoped>
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s ease;
}

.history-item:hover {
  border-color: var(--primary-soft);
  background: var(--surface-soft);
}

.history-main {
  flex: 1;
  min-width: 0;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.history-title h3 {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: var(--text-hint);
  margin-bottom: 6px;
}

.history-opinion {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.history-time {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-hint);
  flex-shrink: 0;
  white-space: nowrap;
}
</style>
