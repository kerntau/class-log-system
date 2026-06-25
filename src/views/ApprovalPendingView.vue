<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ApprovalDialog from '@/components/ApprovalDialog.vue'
import EmptyState from '@/components/EmptyState.vue'
import LogRecordItem from '@/components/LogRecordItem.vue'
import { canAccessLog, getAccessibleLogs } from '@/data/access'
import { addNotification, formatDateTime, getLogById, getLogs, logsVersion, updateLog } from '@/data/storage'

const router = useRouter()
const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const logs = ref(getLogs())
const selectedLog = ref(null)
const dialogVisible = ref(false)

watch([currentRole, logsVersion], refreshLogs, { immediate: true })

const pendingLogs = computed(() => {
  // 辅导员只处理自己班级内仍处于 pending 的日志。
  return getAccessibleLogs(currentRole.value, currentUser.value, logs.value).filter(
    (log) => log.status === 'pending',
  )
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
  if (!log || log.status !== 'pending' || !canAccessLog(currentRole.value, currentUser.value, log)) return

  const now = formatDateTime()
  const approved = result === 'approve'
  const approverName = currentUser.value.name

  // 审批结果写回日志，并作为时间线节点永久保留。
  updateLog(id, {
    status: approved ? 'approved' : 'rejected',
    approver: approverName,
    approveOpinion: opinion,
    approveTime: now,
    timeline: [
      ...log.timeline,
      {
        title: approved ? '审批通过' : '退回修改',
        time: now,
        operator: approverName,
        opinion,
      },
    ],
  })

  // 生成站内通知给学生，通知详情页可直接跳转到对应日志。
  addNotification({
    type: approved ? 'success' : 'warning',
    title: approved ? '日志审批通过' : '日志被退回',
    content: `您提交的「${log.courseName}」日志已${approved ? '审批通过' : '退回'}：${opinion}`,
    targetStudentNo: log.studentNo,
    targetRole: 'student',
    logId: id,
  })

  closeDialog()
  refreshLogs()
}
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">待办数量 {{ pendingLogs.length }}</p>
        <h2>{{ currentUser.className }} 待审批日志</h2>
      </div>
    </header>

    <div class="stack">
      <article v-for="log in pendingLogs" :key="log.id" class="approval-item">
        <LogRecordItem :log="log" @view="router.push(`/logs/detail/${$event}`)" />
        <div class="approval-actions">
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
</template>
