<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FilePlus2, Search } from '@lucide/vue'
import EmptyState from '@/components/EmptyState.vue'
import LogRecordItem from '@/components/LogRecordItem.vue'
import { getAccessibleLogs } from '@/data/access'
import { statusOptions } from '@/data/mockData'
import { addNotification, deleteLog, formatDateTime, getLogById, getLogs, logsVersion, updateLog } from '@/data/storage'

const router = useRouter()
const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const showConfirm = inject('showConfirm')
const showToast = inject('showToast')
const logs = ref(getLogs())
const statusFilter = ref('all')
const searchKeyword = ref('')

watch([currentRole, logsVersion], refreshLogs, { immediate: true })

function refreshLogs() {
  logs.value = getLogs()
}

const filteredLogs = computed(() => {
  // 先按角色权限取数，再叠加页面筛选条件。
  return getAccessibleLogs(currentRole.value, currentUser.value, logs.value).filter((log) => {
    const statusMatched = statusFilter.value === 'all' ? true : log.status === statusFilter.value
    const keyword = searchKeyword.value.trim()
    const keywordMatched = keyword
      ? [log.courseName, log.className, log.logDate, log.teacherName, log.studentName]
          .some((item) => String(item).includes(keyword))
      : true

    return statusMatched && keywordMatched
  })
})

async function submitDraft(id) {
  const log = getLogById(id)
  if (!log || log.status !== 'draft') return
  const confirmed = await showConfirm('确认提交这条草稿日志进行审批吗？')
  if (!confirmed) return

  const now = formatDateTime()
  const operatorName = currentUser.value.name
  const counselorName = currentUser.value.counselor || '辅导员'

  // 草稿提交后进入和新建提交一致的待审批流程。
  updateLog(id, {
    status: 'pending',
    submitTime: now,
    timeline: [
      ...log.timeline,
      { title: '提交班级日志', time: now, operator: operatorName },
      { title: '辅导员待审批', time: now, target: counselorName },
    ],
  })

  // 通知辅导员处理新待办。
  addNotification({
    type: 'info',
    title: '新日志待审批',
    content: `${operatorName} 提交了「${log.courseName}」日志，请及时审批。`,
    targetRole: 'teacher',
    targetStudentNo: '',
    targetClassName: log.className,
    logId: id,
  })

  showToast('草稿已提交审批', 'success')
  refreshLogs()
}

async function removeLog(id) {
  const confirmed = await showConfirm('确认删除这条日志吗？删除后不可恢复。')
  if (!confirmed) return
  deleteLog(id)
  refreshLogs()
}
</script>

<template>
  <section class="page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">办件查询</p>
        <h1>日志记录</h1>
        <p>按状态、课程、班级、日期快速查询班级日志。</p>
      </div>
      <button
        v-if="currentRole === 'student'"
        class="primary-button"
        type="button"
        @click="router.push('/logs/create')"
      >
        <FilePlus2 :size="18" aria-hidden="true" />
        填报日志
      </button>
    </div>

    <section class="panel">
      <div class="filters">
        <label class="field small">
          <span>状态筛选</span>
          <select v-model="statusFilter">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>
        <label class="field search-field">
          <span>关键词</span>
          <div class="input-with-icon">
            <Search :size="16" aria-hidden="true" />
            <input v-model="searchKeyword" type="search" placeholder="搜索课程、班级、教师、日期" />
          </div>
        </label>
      </div>

      <div class="stack">
        <LogRecordItem
          v-for="log in filteredLogs"
          :key="log.id"
          :log="log"
          :can-edit="
            currentRole === 'student' &&
            (log.studentNo === currentUser.studentNo) &&
            (log.status === 'rejected' || log.status === 'withdrawn')
          "
          :can-delete="currentRole === 'admin'"
          :can-submit-draft="currentRole === 'student' && log.studentNo === currentUser.studentNo"
          @view="router.push(`/logs/detail/${$event}`)"
          @edit="router.push(`/logs/create?editId=${$event}`)"
          @delete="removeLog"
          @submit-draft="submitDraft"
        />
        <EmptyState
          v-if="filteredLogs.length === 0"
          text="没有符合条件的日志"
          :action-text="currentRole === 'student' ? '填报日志' : ''"
          @action="router.push('/logs/create')"
        />
      </div>
    </section>
  </section>
</template>
