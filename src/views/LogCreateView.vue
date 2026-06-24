<script setup>
import { inject, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, RotateCcw, Save, Send } from '@lucide/vue'
import { addLog, formatDateTime } from '@/data/storage'

const router = useRouter()
const currentUser = inject('currentUser')
const errors = ref([])
const fieldErrors = ref({})

const initialForm = {
  studentName: currentUser.value.name,
  studentNo: currentUser.value.studentNo,
  className: currentUser.value.className,
  logDate: new Date().toISOString().slice(0, 10),
  week: '',
  weekday: '',
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

// 计算当前是第几周
const currentWeek = computed(() => {
  const startDate = new Date('2026-02-16') // 学期开始日期
  const today = new Date()
  const diffTime = today - startDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const weekNumber = Math.ceil(diffDays / 7)
  return `第${weekNumber}周`
})

// 根据日期自动计算星期
function updateWeekday() {
  if (!form.logDate) return
  const date = new Date(form.logDate)
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  form.weekday = weekdays[date.getDay()]
  form.week = currentWeek.value
}

function resetForm() {
  Object.assign(form, {
    ...initialForm,
    studentName: currentUser.value.name,
    studentNo: currentUser.value.studentNo,
    className: currentUser.value.className,
  })
  errors.value = []
  fieldErrors.value = {}
}

function validateForm() {
  errors.value = []
  fieldErrors.value = {}

  if (!form.logDate) {
    errors.value.push('请选择填报日期')
    fieldErrors.value.logDate = true
  }
  if (!form.week.trim()) {
    errors.value.push('请填写周次')
    fieldErrors.value.week = true
  }
  if (!form.weekday) {
    errors.value.push('请选择星期')
    fieldErrors.value.weekday = true
  }
  if (!form.courseName.trim()) {
    errors.value.push('请填写课程名称')
    fieldErrors.value.courseName = true
  }
  if (!form.teacherName.trim()) {
    errors.value.push('请填写任课教师')
    fieldErrors.value.teacherName = true
  }
  if (!form.section.trim()) {
    errors.value.push('请填写上课节次')
    fieldErrors.value.section = true
  }
  if (!form.classroom.trim()) {
    errors.value.push('请填写教室')
    fieldErrors.value.classroom = true
  }
  if (Number(form.attendanceCount) < 0) {
    errors.value.push('到课人数不能小于 0')
    fieldErrors.value.attendanceCount = true
  }
  if (Number(form.leaveCount) < 0) {
    errors.value.push('请假人数不能小于 0')
    fieldErrors.value.leaveCount = true
  }
  if (!form.discipline.trim()) {
    errors.value.push('请填写课堂纪律情况')
    fieldErrors.value.discipline = true
  }
  if (!form.deviceStatus.trim()) {
    errors.value.push('请填写教学设备情况')
    fieldErrors.value.deviceStatus = true
  }

  return errors.value.length === 0
}

function submitLog(status = 'pending') {
  if (status === 'pending' && !validateForm()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const now = formatDateTime()
  const log = {
    id: Date.now(),
    ...form,
    attendanceCount: Number(form.attendanceCount),
    leaveCount: Number(form.leaveCount),
    abnormalInfo: form.abnormalInfo.trim() || '无',
    remark: form.remark.trim() || '',
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
        <p>请按课程实际情况如实填写，提交后进入辅导员审批流程。</p>
      </div>
    </div>

    <form class="form-panel" @submit.prevent="submitLog('pending')">
      <div v-if="errors.length" class="error-summary" role="alert">
        <AlertCircle :size="18" aria-hidden="true" />
        <div>
          <strong>请先修正以下内容</strong>
          <ul>
            <li v-for="error in errors" :key="error">{{ error }}</li>
          </ul>
        </div>
      </div>

      <fieldset>
        <legend>基础信息</legend>
        <label class="field">
          <span>填报人 <small class="text-muted">（自动填充）</small></span>
          <input v-model="form.studentName" type="text" readonly />
        </label>
        <label class="field">
          <span>学号 <small class="text-muted">（自动填充）</small></span>
          <input v-model="form.studentNo" type="text" readonly />
        </label>
        <label class="field">
          <span>班级 <small class="text-muted">（自动填充）</small></span>
          <input v-model="form.className" type="text" readonly />
        </label>
        <label class="field" :class="{ 'field-error': fieldErrors.logDate }">
          <span>填报日期 <em class="required">*</em></span>
          <input v-model="form.logDate" type="date" required @change="updateWeekday" />
        </label>
        <label class="field" :class="{ 'field-error': fieldErrors.week }">
          <span>周次 <em class="required">*</em></span>
          <input v-model="form.week" type="text" placeholder="如 第17周" required />
        </label>
        <label class="field" :class="{ 'field-error': fieldErrors.weekday }">
          <span>星期 <em class="required">*</em></span>
          <select v-model="form.weekday" required>
            <option value="">请选择</option>
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
        <label class="field" :class="{ 'field-error': fieldErrors.courseName }">
          <span>课程名称 <em class="required">*</em></span>
          <input v-model="form.courseName" type="text" placeholder="如 JavaScript前端框架应用" required />
        </label>
        <label class="field" :class="{ 'field-error': fieldErrors.teacherName }">
          <span>任课教师 <em class="required">*</em></span>
          <input v-model="form.teacherName" type="text" placeholder="如 王老师" required />
        </label>
        <label class="field" :class="{ 'field-error': fieldErrors.section }">
          <span>上课节次 <em class="required">*</em></span>
          <input v-model="form.section" type="text" placeholder="如 1-2节" required />
        </label>
        <label class="field" :class="{ 'field-error': fieldErrors.classroom }">
          <span>教室 <em class="required">*</em></span>
          <input v-model="form.classroom" type="text" placeholder="如 信息楼305" required />
        </label>
      </fieldset>

      <fieldset>
        <legend>课堂情况</legend>
        <label class="field" :class="{ 'field-error': fieldErrors.attendanceCount }">
          <span>到课人数 <em class="required">*</em></span>
          <input v-model.number="form.attendanceCount" min="0" type="number" required />
        </label>
        <label class="field" :class="{ 'field-error': fieldErrors.leaveCount }">
          <span>请假人数 <em class="required">*</em></span>
          <input v-model.number="form.leaveCount" min="0" type="number" required />
        </label>
        <label class="field full">
          <span>迟到早退情况 <small class="text-muted">（无则填"无"）</small></span>
          <input v-model="form.lateInfo" type="text" placeholder="如 1 人迟到 5 分钟" />
        </label>
        <label class="field full" :class="{ 'field-error': fieldErrors.discipline }">
          <span>课堂纪律 <em class="required">*</em></span>
          <textarea
            v-model="form.discipline"
            rows="3"
            placeholder="描述课堂纪律情况，如学生听讲状态、互动情况等"
            required
          ></textarea>
        </label>
        <label class="field full" :class="{ 'field-error': fieldErrors.deviceStatus }">
          <span>教学设备情况 <em class="required">*</em></span>
          <textarea
            v-model="form.deviceStatus"
            rows="3"
            placeholder="描述投影仪、电脑、网络等设备使用情况"
            required
          ></textarea>
        </label>
      </fieldset>

      <fieldset>
        <legend>补充说明</legend>
        <label class="field full">
          <span>异常情况 <small class="text-muted">（选填，无异常可留空）</small></span>
          <textarea
            v-model="form.abnormalInfo"
            rows="3"
            placeholder="如有突发情况、设备故障等请在此说明"
          ></textarea>
        </label>
        <label class="field full">
          <span>备注 <small class="text-muted">（选填）</small></span>
          <textarea v-model="form.remark" rows="3" placeholder="其他需要说明的内容"></textarea>
        </label>
      </fieldset>

      <div class="form-actions">
        <button class="ghost-button" type="button" @click="resetForm">
          <RotateCcw :size="16" aria-hidden="true" />
          重置表单
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

<style scoped>
.error-summary {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px 20px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius);
  color: #991b1b;
  background: #fef2f2;
  font-size: 14px;
  margin-bottom: 24px;
}

.error-summary strong {
  display: block;
  font-size: 15px;
  margin-bottom: 8px;
}

.error-summary ul {
  margin: 0;
  padding-left: 20px;
}

.error-summary li {
  margin-top: 4px;
}

.required {
  color: #ef4444;
  font-style: normal;
  margin-left: 2px;
}

.text-muted {
  color: var(--muted);
  font-weight: 400;
  font-size: 12px;
}

.field-error input,
.field-error select,
.field-error textarea {
  border-color: #ef4444;
  background: #fef2f2;
}

.field-error input:focus,
.field-error select:focus,
.field-error textarea:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
}
</style>
