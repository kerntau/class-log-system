<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ClipboardCheck,
  Database,
  FilePlus2,
  FolderClock,
  PenLine,
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
      title: '今日需要完成的班级日志',
      intro: '负责按课程如实填报班级日志，提交后等待辅导员审批；个人资料可在个人中心修改。',
      icon: PenLine,
      primaryText: '新增日志',
      primaryPath: '/logs/create',
    },
    teacher: {
      label: '辅导员工作台',
      title: '待审批日志集中处理',
      intro: '查看本班学生提交记录，完成通过或退回，并保留审批意见和流转时间。',
      icon: UserCheck,
      primaryText: '处理审批',
      primaryPath: '/approval',
    },
    admin: {
      label: '管理员工作台',
      title: '全量数据与文件归档',
      intro: '维护系统数据文件，查看全量日志，必要时导入导出 JSON 数据完成备份。',
      icon: Database,
      primaryText: '数据文件',
      primaryPath: '/data-files',
    },
  }

  return meta[currentRole.value] || meta.student
})

const visibleLogs = computed(() => {
  if (currentRole.value === 'student') {
    return logs.value.filter((log) => log.studentNo === currentUser.value.studentNo)
  }
  return logs.value
})

const pendingLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'pending'))
const rejectedLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'rejected'))
const approvedLogs = computed(() => visibleLogs.value.filter((log) => log.status === 'approved'))
const recentLogs = computed(() => visibleLogs.value.slice(0, 4))

const stats = computed(() => [
  { title: '日志总数', value: visibleLogs.value.length, tone: 'blue', target: '/logs' },
  {
    title: currentRole.value === 'student' ? '等待审批' : '审批待办',
    value: pendingLogs.value.length,
    tone: 'orange',
    target: currentRole.value === 'student' ? '/logs' : '/approval',
  },
  { title: '已通过', value: approvedLogs.value.length, tone: 'green', target: '/logs' },
  { title: '需修正', value: rejectedLogs.value.length, tone: 'red', target: '/logs' },
])

const relationSteps = [
  { title: '学生', desc: '填写日志、保存草稿、提交审批、修改个人资料' },
  { title: '辅导员', desc: '查看提交记录、审批通过、退回修改、跟踪班级情况' },
  { title: '管理员', desc: '查看全量数据、维护文件、导入导出、删除异常记录' },
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
          <button class="ghost-button" type="button" @click="router.push('/logs')">
            <FolderClock :size="18" aria-hidden="true" />
            查看记录
          </button>
        </div>
      </div>

      <div class="identity-panel">
        <div class="identity-avatar">{{ currentUser.name.slice(0, 1) }}</div>
        <div>
          <strong>{{ currentUser.name }}</strong>
          <span>{{ currentUser.className }} · {{ currentUser.studentNo }}</span>
        </div>
        <button class="secondary-button" type="button" @click="router.push('/profile/info')">
          <PenLine :size="16" aria-hidden="true" />
          修改资料
        </button>
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
            action-text="新增日志"
            @action="router.push('/logs/create')"
          />
        </div>
      </section>

      <section class="panel relation-panel">
        <header class="panel-header">
          <div>
            <p class="eyebrow">角色关系</p>
            <h2>单一系统权限链路</h2>
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
        <div v-if="currentRole !== 'student'" class="queue-card">
          <ClipboardCheck :size="20" aria-hidden="true" />
          <div>
            <strong>{{ pendingLogs.length }} 条待审批</strong>
            <p>优先处理待办，审批结果将写入日志时间线。</p>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
