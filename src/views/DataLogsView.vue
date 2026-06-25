<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BarChart3 } from '@lucide/vue'
import EmptyState from '@/components/EmptyState.vue'
import StatCard from '@/components/StatCard.vue'
import StatusTag from '@/components/StatusTag.vue'
import { getLogs, logsVersion } from '@/data/storage'

const router = useRouter()
const logs = ref(getLogs())

// 统计页只面向管理员，数据刷新跟随日志版本即可。
watch(logsVersion, () => {
  logs.value = getLogs()
}, { immediate: true })

// 按班级聚合日志状态，用于堆叠条形图。
const classStats = computed(() => {
  const map = {}
  for (const log of logs.value) {
    if (!map[log.className]) {
      map[log.className] = { total: 0, pending: 0, approved: 0, rejected: 0, draft: 0, withdrawn: 0 }
    }
    map[log.className].total++
    map[log.className][log.status]++
  }
  return Object.entries(map).sort((a, b) => b[1].total - a[1].total)
})

// 全局状态分布，用于顶部统计卡片。
const statusStats = computed(() => {
  const map = { draft: 0, pending: 0, approved: 0, rejected: 0, withdrawn: 0 }
  for (const log of logs.value) {
    if (map[log.status] !== undefined) map[log.status]++
  }
  return map
})

const statusLabels = {
  draft: '草稿',
  pending: '待审批',
  approved: '已通过',
  rejected: '已退回',
  withdrawn: '已撤回',
}

const statusTones = {
  draft: 'gray',
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  withdrawn: 'gray',
}

const rejectedLogs = computed(() => logs.value.filter((log) => log.status === 'rejected'))
</script>

<template>
  <!-- 全局状态统计 -->
  <div class="stats-grid">
    <StatCard
      v-for="(count, status) in statusStats"
      :key="status"
      :title="statusLabels[status]"
      :value="count"
      :tone="statusTones[status]"
    />
  </div>

  <!-- 班级维度统计 -->
  <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">按班级</p>
        <h2>各班日志统计</h2>
      </div>
      <BarChart3 :size="22" aria-hidden="true" />
    </header>

    <div class="class-list">
      <article v-for="[className, stat] in classStats" :key="className" class="class-row">
        <div class="class-name">{{ className }}</div>
        <div class="class-bars">
          <span class="bar-item approved" :style="{ flex: stat.approved }">
            {{ stat.approved > 0 ? stat.approved : '' }}
          </span>
          <span class="bar-item pending" :style="{ flex: stat.pending }">
            {{ stat.pending > 0 ? stat.pending : '' }}
          </span>
          <span class="bar-item rejected" :style="{ flex: stat.rejected }">
            {{ stat.rejected > 0 ? stat.rejected : '' }}
          </span>
          <span class="bar-item draft" :style="{ flex: stat.draft || stat.withdrawn }">
            {{ (stat.draft + stat.withdrawn) > 0 ? stat.draft + stat.withdrawn : '' }}
          </span>
        </div>
        <span class="class-total">{{ stat.total }} 条</span>
      </article>
      <EmptyState v-if="classStats.length === 0" text="暂无日志数据" />
    </div>

    <div class="legend">
      <span class="legend-item"><span class="legend-dot approved"></span>已通过</span>
      <span class="legend-item"><span class="legend-dot pending"></span>待审批</span>
      <span class="legend-item"><span class="legend-dot rejected"></span>已退回</span>
      <span class="legend-item"><span class="legend-dot draft"></span>草稿/撤回</span>
    </div>
  </section>

  <!-- 最近异常日志 -->
  <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">需关注</p>
        <h2>退回与异常记录</h2>
      </div>
    </header>
    <div class="stack">
      <article
        v-for="log in rejectedLogs.slice(0, 5)"
        :key="log.id"
        class="issue-item"
        @click="router.push(`/logs/detail/${log.id}`)"
      >
        <div>
          <strong>{{ log.courseName }}</strong>
          <span class="issue-meta">{{ log.studentName }} / {{ log.className }} / {{ log.logDate }}</span>
        </div>
        <StatusTag status="rejected" />
      </article>
      <EmptyState v-if="rejectedLogs.length === 0" text="暂无退回记录" />
    </div>
  </section>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.class-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.class-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.class-name {
  width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.class-bars {
  flex: 1;
  display: flex;
  height: 24px;
  border-radius: 4px;
  overflow: hidden;
  gap: 2px;
}

.bar-item {
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  min-width: 0;
  transition: flex 0.3s ease;
}

.bar-item.approved { background: #10b981; }
.bar-item.pending { background: #f59e0b; }
.bar-item.rejected { background: #ef4444; }
.bar-item.draft { background: #9ca3af; }

.class-total {
  width: 50px;
  flex-shrink: 0;
  text-align: right;
  font-size: 13px;
  color: var(--text-hint);
}

.legend {
  display: flex;
  gap: 16px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.legend-dot.approved { background: #10b981; }
.legend-dot.pending { background: #f59e0b; }
.legend-dot.rejected { background: #ef4444; }
.legend-dot.draft { background: #9ca3af; }

.issue-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s ease;
}

.issue-item:hover {
  border-color: var(--primary-soft);
  background: var(--surface-soft);
}

.issue-item strong {
  display: block;
  font-size: 14px;
  color: var(--text-dark);
  margin-bottom: 2px;
}

.issue-meta {
  font-size: 12px;
  color: var(--text-hint);
}
</style>
