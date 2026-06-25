<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertCircle,
  ClipboardCheck,
  Database,
  FileText,
  SearchCheck,
  ShieldCheck,
  UserCheck,
} from '@lucide/vue'
import EmptyState from '@/components/EmptyState.vue'
import LogRecordItem from '@/components/LogRecordItem.vue'
import StatCard from '@/components/StatCard.vue'
import { getAccessibleLogs } from '@/data/access'
import { getLogs, logsVersion } from '@/data/storage'

const router = useRouter()
const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const logs = ref(getLogs())

// 工作台展示跟随角色和日志版本实时刷新。
watch([currentRole, logsVersion], () => {
  logs.value = getLogs()
}, { immediate: true })

// 不同角色共享同一套页面，但入口文案和主操作不同。
const roleMeta = computed(() => {
  const meta = {
    student: {
      label: '班委工作台',
      title: '班级日志填报与管理',
      intro: '按课程如实填报班级日志，提交后等待辅导员审批。可随时查看草稿和审批进度。',
      icon: FileText,
      primaryText: '填报日志',
      primaryPath: '/logs/create',
    },
    teacher: {
      label: '辅导员工作台',
      title: '日志审批与班级管理',
      intro: '审核本班学生提交的日志记录，通过或退回并保留审批意见。及时跟踪班级动态。',
      icon: UserCheck,
      primaryText: '处理审批',
      primaryPath: '/approval',
    },
    admin: {
      label: '管理员工作台',
      title: '系统数据管理与归档',
      intro: '维护全校日志数据，支持导入导出备份。查看全量统计和异常记录处理。',
      icon: Database,
      primaryText: '数据管理',
      primaryPath: '/data-files',
    },
  }

  return meta[currentRole.value] || meta.student
})

const visibleLogs = computed(() => {
  return getAccessibleLogs(currentRole.value, currentUser.value, logs.value)
})

const draftLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'draft'))
const pendingLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'pending'))
const rejectedLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'rejected'))
const withdrawnLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'withdrawn'))
const approvedLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'approved'))
const recentLogs = computed(() => visibleLogs.value.slice(0, 4))

// 需要处理的日志（被退回 + 已撤回）
const needActionLogs = computed(() => [...rejectedLogs.value, ...withdrawnLogs.value])

const stats = computed(() => {
  // 管理员查看全量状态统计，普通角色只展示和办事相关的摘要。
  if (currentRole.value === 'admin') {
    return [
      { title: '草稿', value: draftLogs.value.length, tone: 'gray', target: '/data-files/logs' },
      { title: '待审批', value: pendingLogs.value.length, tone: 'orange', target: '/data-files/logs' },
      { title: '已通过', value: approvedLogs.value.length, tone: 'green', target: '/data-files/logs' },
      { title: '已退回', value: rejectedLogs.value.length, tone: 'red', target: '/data-files/logs' },
      { title: '已撤回', value: withdrawnLogs.value.length, tone: 'gray', target: '/data-files/logs' },
    ]
  }

  const baseStats = [
    { title: '日志总数', value: visibleLogs.value.length, tone: 'blue', target: '/logs' },
    {
      title: currentRole.value === 'student' ? '等待审批' : '审批待办',
      value: pendingLogs.value.length,
      tone: 'orange',
      target: currentRole.value === 'student' ? '/logs' : '/approval',
    },
    { title: '已通过', value: approvedLogs.value.length, tone: 'green', target: '/logs' },
    { title: '需修正', value: needActionLogs.value.length, tone: 'red', target: '/logs' },
  ]

  // 学生端显示草稿数
  if (currentRole.value === 'student') {
    baseStats[0] = { title: '草稿箱', value: draftLogs.value.length, tone: 'gray', target: '/logs' }
  }

  return baseStats
})

const relationSteps = [
  { title: '班委', desc: '填写日志、保存草稿、提交审批、查看进度' },
  { title: '辅导员', desc: '审核日志、通过或退回、跟踪班级情况' },
  { title: '管理员', desc: '维护数据、导入导出、查看全局统计' },
]
</script>

<template>
  <section class="page dashboard-page">
    <div class="hero-panel">
      <div class="hero-copy">
        <p class="eyebrow">{{ roleMeta.label }}</p>
        <h1>{{ roleMeta.title }}</h1>
        <p>{{ roleMeta.intro }}</p>
        <div class="hero-actions">
          <button class="primary-button" type="button" @click="router.push(roleMeta.primaryPath)">
            <component :is="roleMeta.icon" :size="18" aria-hidden="true" />
            {{ roleMeta.primaryText }}
          </button>
        </div>
      </div>

      <div class="identity-panel">
        <div class="identity-avatar">{{ currentUser.name.slice(0, 1) }}</div>
        <div>
          <strong>{{ currentUser.name }}</strong>
          <span v-if="currentRole === 'student'">{{ currentUser.className }} · {{ currentUser.studentNo }}</span>
          <span v-else-if="currentRole === 'teacher'">{{ currentUser.className }} · {{ currentUser.title }}</span>
          <span v-else>{{ currentUser.department }} · {{ currentUser.title }}</span>
        </div>
      </div>
    </div>

    <!-- 学生端：草稿和退回/撤回提醒 -->
    <div v-if="currentRole === 'student' && (draftLogs.length > 0 || needActionLogs.length > 0)" class="notice-grid">
      <div v-if="draftLogs.length > 0" class="notice-card draft-notice">
        <FileText :size="20" aria-hidden="true" />
        <div>
          <strong>{{ draftLogs.length }} 条草稿待完成</strong>
          <p>您有未提交的日志草稿，请及时完善并提交审批。</p>
        </div>
        <button class="secondary-button" type="button" @click="router.push('/logs')">查看草稿</button>
      </div>

      <div v-if="needActionLogs.length > 0" class="notice-card reject-notice">
        <AlertCircle :size="20" aria-hidden="true" />
        <div class="notice-action-list">
          <strong>{{ needActionLogs.length }} 条日志需处理</strong>
          <p>{{ rejectedLogs.length > 0 ? '辅导员已退回' + rejectedLogs.length + '条，' : '' }}{{ withdrawnLogs.length > 0 ? '已撤回' + withdrawnLogs.length + '条，' : '' }}请修改后重新提交。</p>
          <div class="action-items">
            <div v-for="log in needActionLogs" :key="log.id" class="action-item">
              <span>{{ log.courseName }} · {{ log.logDate }}</span>
              <button class="danger-button small" type="button" @click="router.push(`/logs/create?editId=${log.id}`)">修改</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :tone="stat.tone"
        @select="router.push(stat.target)"
      />
    </div>

    <div class="two-column">
      <section class="panel">
        <header class="panel-header">
          <div>
            <p class="eyebrow">最近动态</p>
            <h2>日志流转记录</h2>
          </div>
          <button class="secondary-button" type="button" @click="router.push('/logs')">
            <SearchCheck :size="16" aria-hidden="true" />
            全部日志
          </button>
        </header>
        <div class="stack">
          <LogRecordItem
            v-for="log in recentLogs"
            :key="log.id"
            :log="log"
            :can-edit="currentRole === 'student'"
            @view="router.push(`/logs/detail/${$event}`)"
            @edit="router.push(`/logs/create?editId=${$event}`)"
          />
          <EmptyState
            v-if="recentLogs.length === 0"
            text="暂无日志记录"
            :action-text="currentRole === 'student' ? '填报日志' : '查看全部'"
            @action="router.push(currentRole === 'student' ? '/logs/create' : '/logs')"
          />
        </div>
      </section>

      <section class="panel relation-panel">
        <header class="panel-header">
          <div>
            <p class="eyebrow">角色说明</p>
            <h2>系统权限链路</h2>
          </div>
          <ShieldCheck :size="22" aria-hidden="true" />
        </header>
        <ol class="relation-list">
          <li v-for="(step, index) in relationSteps" :key="step.title">
            <span>{{ index + 1 }}</span>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </div>
          </li>
        </ol>
        <div v-if="currentRole === 'teacher' && pendingLogs.length > 0" class="queue-card">
          <ClipboardCheck :size="20" aria-hidden="true" />
          <div>
            <strong>{{ pendingLogs.length }} 条待审批</strong>
            <p>优先处理待办，审批结果将写入日志时间线并通知班委。</p>
          </div>
        </div>
        <div v-if="currentRole === 'admin'" class="queue-card admin-tip">
          <Database :size="20" aria-hidden="true" />
          <div>
            <strong>数据备份提醒</strong>
            <p>建议定期导出数据文件进行备份，确保数据安全。</p>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.notice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.notice-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  border-radius: var(--radius);
  border: 1px solid;
}

.draft-notice {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.reject-notice {
  background: #fef2f2;
  border-color: rgba(239, 68, 68, 0.2);
  color: #991b1b;
}

.admin-tip {
  background: #eff6ff;
  border-color: rgba(37, 99, 235, 0.2);
  color: #1e40af;
}

.notice-card strong {
  display: block;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
}

.notice-card p {
  font-size: 13px;
  line-height: 1.5;
}

.notice-card button {
  margin-left: auto;
  flex-shrink: 0;
  min-width: 0;
}

.notice-action-list {
  flex: 1;
}

.action-items {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.06);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.action-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button.small,
.danger-button.small {
  padding: 4px 12px;
  font-size: 12px;
}

@media (max-width: 480px) {
  .notice-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .notice-card button {
    margin-left: 0;
    width: 100%;
  }

  .action-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-item .danger-button.small {
    width: 100%;
  }
}
</style>
