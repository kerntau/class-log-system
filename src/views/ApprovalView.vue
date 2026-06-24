<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LockKeyhole, SearchCheck } from '@lucide/vue'
import ApprovalDialog from '@/components/ApprovalDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import LogRecordItem from '@/components/LogRecordItem.vue'
import { addNotification, formatDateTime, getLogById, getLogs, updateLog } from '@/data/storage'

const router = useRouter()
const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const logs = ref(getLogs())
const selectedLog = ref(null)
const dialogVisible = ref(false)

watch(currentRole, refreshLogs)

const canApprove = computed(() => currentRole.value !== 'student')

// 辅导员只能看本班级的待审批日志，管理员可看全部
const pendingLogs = computed(() => {
  const pending = logs.value.filter((log) => log.status === 'pending')
  if (currentRole.value === 'teacher') {
    return pending.filter((log) => log.className === currentUser.value.className)
  }
  return pending
})

function refreshLogs() {
  logs.value = getLogs()
}

function openDialog(log) {
  selectedLog.value = log
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
  selectedLog.value = null
}

function handleResult({ id, opinion }, result) {
  const log = getLogById(id)
  if (!log || log.status !== 'pending') return

  const now = formatDateTime()
  const approved = result === 'approve'
  const approver = currentRole.value === 'admin' ? '管理员' : '辅导员'

  updateLog(id, {
    status: approved ? 'approved' : 'rejected',
    approver,
    approveOpinion: opinion,
    approveTime: now,
    timeline: [
      ...log.timeline,
      {
        title: approved ? '审批通过' : '退回修改',
        time: now,
        opinion,
      },
    ],
  })

  // 生成站内通知给学生
  addNotification({
    type: approved ? 'success' : 'warning',
    title: approved ? '日志审批通过' : '日志被退回',
    content: `您提交的「${log.courseName}」日志已${approved ? '审批通过' : '退回'}：${opinion}`,
    targetStudentNo: log.studentNo,
    logId: id,
  })

  closeDialog()
  refreshLogs()
}
</script>

<template>
  <section class="page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">审批工作台</p>
        <h1>审批管理</h1>
        <p>集中处理学生提交的待审批班级日志，审批结果将通知学生。</p>
      </div>
    </div>

    <section v-if="!canApprove" class="panel access-panel">
      <LockKeyhole :size="36" aria-hidden="true" />
      <h2>当前学生角色不可审批</h2>
      <p>请在顶部切换为辅导员或管理员角色后查看审批待办。</p>
    </section>

    <section v-else class="panel">
      <header class="panel-header">
        <div>
          <p class="eyebrow">待办数量 {{ pendingLogs.length }}</p>
          <h2>{{ currentRole === 'teacher' ? `${currentUser.className} 待审批日志` : '全部待审批日志' }}</h2>
        </div>
        <button class="secondary-button" type="button" @click="router.push('/logs')">
          <SearchCheck :size="16" aria-hidden="true" />
          查看全部日志
        </button>
      </header>

      <div class="stack">
        <article v-for="log in pendingLogs" :key="log.id" class="approval-item">
          <LogRecordItem :log="log" @view="router.push(`/logs/detail/${$event}`)" />
          <div class="approval-actions">
            <button class="ghost-button" type="button" @click="router.push(`/logs/detail/${log.id}`)">
              查看详情
            </button>
            <button class="primary-button" type="button" @click="openDialog(log)">审批处理</button>
          </div>
        </article>
        <EmptyState
          v-if="pendingLogs.length === 0"
          text="暂无待审批日志"
          action-text="查看日志记录"
          @action="router.push('/logs')"
        />
      </div>
    </section>

    <ApprovalDialog
      :visible="dialogVisible"
      :log="selectedLog"
      @approve="handleResult($event, 'approve')"
      @reject="handleResult($event, 'reject')"
      @close="closeDialog"
    />
  </section>
</template>
