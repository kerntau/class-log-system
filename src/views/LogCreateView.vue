<script setup>
import { inject, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCcw, Save, Send } from '@lucide/vue'
import { addLog, formatDateTime } from '@/data/storage'

const router = useRouter()
const currentUser = inject('currentUser')
const errors = ref([])

const initialForm = {
  studentName: currentUser.value.name,
  studentNo: currentUser.value.studentNo,
  className: currentUser.value.className,
  logDate: new Date().toISOString().slice(0, 10),
  week: '第17周',
  weekday: '星期三',
  courseName: '',
  teacherName: '',
  section: '',
  classroom: '',
  attendanceCount: 0,
  leaveCount: 0,
  lateInfo: '无',
  discipline: '',
  deviceStatus: '',
  abnormalInfo: '',
  remark: '',
}

const form = reactive({ ...initialForm })

function resetForm() {
  Object.assign(form, {
    ...initialForm,
    studentName: currentUser.value.name,
    studentNo: currentUser.value.studentNo,
    className: currentUser.value.className,
  })
  errors.value = []
}

function validateForm() {
  errors.value = []

  if (!form.logDate) errors.value.push('请选择填报日期')
  if (!form.className.trim()) errors.value.push('请填写班级')
  if (!form.courseName.trim()) errors.value.push('请填写课程名称')
  if (!form.teacherName.trim()) errors.value.push('请填写任课教师')
  if (!form.section.trim()) errors.value.push('请填写上课节次')
  if (Number(form.attendanceCount) < 0) errors.value.push('到课人数不能小于 0')
  if (Number(form.leaveCount) < 0) errors.value.push('请假人数不能小于 0')

  return errors.value.length === 0
}

function submitLog(status = 'pending') {
  if (!validateForm()) return

  const now = formatDateTime()
  const log = {
    id: Date.now(),
    ...form,
    attendanceCount: Number(form.attendanceCount),
    leaveCount: Number(form.leaveCount),
    abnormalInfo: form.abnormalInfo.trim() || '无',
    status,
    submitTime: now,
    approver: '',
    approveOpinion: '',
    approveTime: '',
    timeline:
      status === 'draft'
        ? [{ title: '保存草稿', time: now }]
        : [
            { title: '提交班级日志', time: now },
            { title: '辅导员待审批', time: now },
          ],
  }

  addLog(log)
  window.alert(status === 'draft' ? '草稿保存成功' : '日志已提交审批')
  router.push('/logs')
}
</script>

<template>
  <section class="page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">在线办理</p>
        <h1>班级日志填报</h1>
        <p>请按课程实际情况填写，提交后进入辅导员审批流程。</p>
      </div>
    </div>

    <form class="form-panel" @submit.prevent="submitLog('pending')">
      <div v-if="errors.length" class="error-summary" role="alert">
        <strong>请先修正以下内容</strong>
        <ul>
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <fieldset>
        <legend>基础信息</legend>
        <label class="field">
          <span>填报人</span>
          <input v-model="form.studentName" type="text" readonly />
        </label>
        <label class="field">
          <span>学号</span>
          <input v-model="form.studentNo" type="text" readonly />
        </label>
        <label class="field">
          <span>班级</span>
          <input v-model="form.className" type="text" />
        </label>
        <label class="field">
          <span>填报日期</span>
          <input v-model="form.logDate" type="date" />
        </label>
        <label class="field">
          <span>周次</span>
          <input v-model="form.week" type="text" />
        </label>
        <label class="field">
          <span>星期</span>
          <select v-model="form.weekday">
            <option>星期一</option>
            <option>星期二</option>
            <option>星期三</option>
            <option>星期四</option>
            <option>星期五</option>
            <option>星期六</option>
            <option>星期日</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>课程信息</legend>
        <label class="field">
          <span>课程名称</span>
          <input v-model="form.courseName" type="text" placeholder="如 JavaScript前端框架应用" />
        </label>
        <label class="field">
          <span>任课教师</span>
          <input v-model="form.teacherName" type="text" placeholder="如 王老师" />
        </label>
        <label class="field">
          <span>上课节次</span>
          <input v-model="form.section" type="text" placeholder="如 1-2节" />
        </label>
        <label class="field">
          <span>教室</span>
          <input v-model="form.classroom" type="text" placeholder="如 信息楼305" />
        </label>
      </fieldset>

      <fieldset>
        <legend>课堂情况</legend>
        <label class="field">
          <span>到课人数</span>
          <input v-model.number="form.attendanceCount" min="0" type="number" />
        </label>
        <label class="field">
          <span>请假人数</span>
          <input v-model.number="form.leaveCount" min="0" type="number" />
        </label>
        <label class="field full">
          <span>迟到早退情况</span>
          <input v-model="form.lateInfo" type="text" />
        </label>
        <label class="field full">
          <span>课堂纪律</span>
          <textarea v-model="form.discipline" rows="3" placeholder="请填写课堂纪律情况"></textarea>
        </label>
        <label class="field full">
          <span>教学设备情况</span>
          <textarea v-model="form.deviceStatus" rows="3" placeholder="请填写设备使用情况"></textarea>
        </label>
      </fieldset>

      <fieldset>
        <legend>补充说明</legend>
        <label class="field full">
          <span>异常情况</span>
          <textarea v-model="form.abnormalInfo" rows="3" placeholder="无异常可留空"></textarea>
        </label>
        <label class="field full">
          <span>备注</span>
          <textarea v-model="form.remark" rows="3" placeholder="可填写其他说明"></textarea>
        </label>
      </fieldset>

      <div class="form-actions">
        <button class="secondary-button" type="button" @click="resetForm">
          <RotateCcw :size="16" aria-hidden="true" />
          重置
        </button>
        <button class="secondary-button" type="button" @click="submitLog('draft')">
          <Save :size="16" aria-hidden="true" />
          保存草稿
        </button>
        <button class="primary-button" type="submit">
          <Send :size="16" aria-hidden="true" />
          提交审批
        </button>
      </div>
    </form>
  </section>
</template>
