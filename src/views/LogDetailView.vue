<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Printer } from '@lucide/vue'
import EmptyState from '@/components/EmptyState.vue'
import StatusTag from '@/components/StatusTag.vue'
import Timeline from '@/components/Timeline.vue'
import { getLogById } from '@/data/storage'

const route = useRoute()
const router = useRouter()
const log = ref(getLogById(route.params.id))

const fields = computed(() => {
  if (!log.value) return []
  return [
    ['填报人', log.value.studentName],
    ['学号', log.value.studentNo],
    ['班级', log.value.className],
    ['日期', log.value.logDate],
    ['周次', log.value.week],
    ['星期', log.value.weekday],
    ['课程名称', log.value.courseName],
    ['任课教师', log.value.teacherName],
    ['上课节次', log.value.section],
    ['教室', log.value.classroom],
    ['到课人数', log.value.attendanceCount],
    ['请假人数', log.value.leaveCount],
    ['迟到早退', log.value.lateInfo],
    ['课堂纪律', log.value.discipline],
    ['教学设备', log.value.deviceStatus],
    ['异常情况', log.value.abnormalInfo],
    ['备注', log.value.remark || '无'],
    ['提交时间', log.value.submitTime],
    ['审批人', log.value.approver || '暂无'],
    ['审批意见', log.value.approveOpinion || '暂无'],
    ['审批时间', log.value.approveTime || '暂无'],
  ]
})
</script>

<template>
  <section class="page">
    <div class="page-toolbar">
      <button class="ghost-button" type="button" @click="router.back()">
        <ArrowLeft :size="16" aria-hidden="true" />
        返回
      </button>
      <button v-if="log" class="secondary-button" type="button" @click="window.print()">
        <Printer :size="16" aria-hidden="true" />
        打印
      </button>
    </div>

    <EmptyState v-if="!log" text="未找到对应日志记录" action-text="返回日志列表" @action="router.push('/logs')" />

    <template v-else>
      <div class="detail-heading">
        <div>
          <p class="eyebrow">日志详情</p>
          <h1>{{ log.courseName }}</h1>
          <p>{{ log.className }} / {{ log.logDate }} / {{ log.section }}</p>
        </div>
        <StatusTag :status="log.status" />
      </div>

      <div class="detail-layout">
        <section class="panel">
          <header class="panel-header">
            <div>
              <p class="eyebrow">表单内容</p>
              <h2>完整填报信息</h2>
            </div>
          </header>
          <dl class="detail-grid">
            <div v-for="[label, value] in fields" :key="label">
              <dt>{{ label }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </dl>
        </section>

        <section class="panel">
          <header class="panel-header">
            <div>
              <p class="eyebrow">审批流程</p>
              <h2>流转时间线</h2>
            </div>
          </header>
          <Timeline :nodes="log.timeline" />
        </section>
      </div>
    </template>
  </section>
</template>
