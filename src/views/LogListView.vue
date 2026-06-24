<script setup>
import { computed, inject, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FilePlus2, Search } from '@lucide/vue'
import EmptyState from '@/components/EmptyState.vue'
import LogRecordItem from '@/components/LogRecordItem.vue'
import { statusOptions } from '@/data/mockData'
import { deleteLog, formatDateTime, getLogById, getLogs, updateLog } from '@/data/storage'

const router = useRouter()
const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const showConfirm = inject('showConfirm')
const logs = ref(getLogs())
const statusFilter = ref('all')
const searchKeyword = ref('')

watch(currentRole, refreshLogs)

function refreshLogs() {
  logs.value = getLogs()
}

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    let roleMatched = true
    if (currentRole.value === 'student') {
      roleMatched = log.studentNo === currentUser.value.studentNo
    } else if (currentRole.value === 'teacher') {
      roleMatched = log.className === currentUser.value.className
    }
    const statusMatched = statusFilter.value === 'all' ? true : log.status === statusFilter.value
    const keyword = searchKeyword.value.trim()
    const keywordMatched = keyword
      ? [log.courseName, log.className, log.logDate, log.teacherName, log.studentName]
          .some((item) => String(item).includes(keyword))
      : true

    return roleMatched && statusMatched && keywordMatched
  })
})

async function withdrawLog(id) {
  const log = getLogById(id)
  if (!log || log.status !== 'pending') return
  const confirmed = await showConfirm('确认撤回这条待审批日志吗？')
  if (!confirmed) return

  updateLog(id, {
    status: 'withdrawn',
    timeline: [
      ...log.timeline,
      { title: '学生撤回日志', time: formatDateTime() },
    ],
  })
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
          :can-withdraw="currentRole === 'student'"
          :can-delete="currentRole === 'admin'"
          @view="router.push(`/logs/detail/${$event}`)"
          @withdraw="withdrawLog"
          @delete="removeLog"
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
