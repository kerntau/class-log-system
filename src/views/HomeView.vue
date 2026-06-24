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
import { getLogs } from '@/data/storage'

const router = useRouter()
const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const logs = ref(getLogs())

watch(currentRole, () => {
  logs.value = getLogs()
})

const roleMeta = computed(() => {
  const meta = {
    student: {
      label: '学生工作台',
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
  if (currentRole.value === 'student') {
    return logs.value.filter((log) => log.studentNo === currentUser.value.studentNo)
  }
  if (currentRole.value === 'teacher') {
    // 辅导员只能看本班级的日志
    return logs.value.filter((log) => log.className === currentUser.value.className)
  }
  return logs.value
})

const draftLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'draft'))
const pendingLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'pending'))
const rejectedLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'rejected'))
const approvedLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'approved'))
const recentLogs = computed(() => visibleLogs.value.slice(0, 4))

const stats = computed(() => {
  const baseStats = [
    { title: '日志总数', value: visibleLogs.value.length, tone: 'blue', target: '/logs' },
    {
      title: currentRole.value === 'student' ? '等待审批' : '审批待办',
      value: pendingLogs.value.length,
      tone: 'orange',
      target: currentRole.value === 'student' ? '/logs' : '/approval',
    },
    { title: '已通过', value: approvedLogs.value.length, tone: 'green', target: '/logs' },
    { title: '需修正', value: rejectedLogs.value.length, tone: 'red', target: '/logs' },
  ]

  // 学生端显示草稿数
  if (currentRole.value === 'student') {
    baseStats[0] = { title: '草稿箱', value: draftLogs.value.length, tone: 'gray', target: '/logs' }
  }

  return baseStats
})

const relationSteps = [
  { title: '学生', desc: '填写日志、保存草稿、提交审批、查看进度' },
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

    <!-- 学生端：草稿和退回提醒 -->
    <div v-if="currentRole === 'student' && (draftLogs.length > 0 || rejectedLogs.length > 0)" class="notice-grid">
      <div v-if="draftLogs.length > 0" class="notice-card draft-notice">
        <FileText :size="20" aria-hidden="true" />
        <div>
          <strong>{{ draftLogs.length }} 条草稿待完成</strong>
          <p>您有未提交的日志草稿，请及时完善并提交审批。</p>
        </div>
        <button class="secondary-button" type="button" @click="router.push('/logs')">查看草稿</button>
      </div>

      <div v-if="rejectedLogs.length > 0" class="notice-card reject-notice">
        <AlertCircle :size="20" aria-hidden="true" />
        <div>
          <strong>{{ rejectedLogs.length }} 条日志被退回</strong>
          <p>辅导员已退回部分日志，请根据意见修改后重新提交。</p>
        </div>
        <button class="danger-button" type="button" @click="router.push('/logs')">立即处理</button>
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
            :can-withdraw="currentRole === 'student'"
            @view="router.push(`/logs/detail/${$event}`)"
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
            <p>优先处理待办，审批结果将写入日志时间线并通知学生。</p>
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

@media (max-width: 480px) {
  .notice-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .notice-card button {
    margin-left: 0;
    width: 100%;
  }
}
</style>
