<script setup>
import { inject, reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertCircle, RotateCcw, Save, Send } from '@lucide/vue'
import { addLog, addNotification, formatDateTime, getLogById, updateLog } from '@/data/storage'

const route = useRoute()
const router = useRouter()
const currentUser = inject('currentUser')
const showToast = inject('showToast')
const showConfirm = inject('showConfirm')
const errors = ref([])
const fieldErrors = ref({})

// 编辑模式只允许处理被退回或已撤回的日志，避免修改已提交/已通过记录。
const editId = ref(null)
const editLog = ref(null)

onMounted(() => {
  const id = route.query.editId
  if (id) {
    const log = getLogById(id)
    if (log && (log.status === 'rejected' || log.status === 'withdrawn')) {
      editId.value = Number(id)
      editLog.value = log
      // 将被退回日志数据填入表单
      Object.assign(form, {
        studentName: log.studentName,
        studentNo: log.studentNo,
        className: log.className,
        logDate: log.logDate,
        week: log.week,
        weekday: log.weekday,
        courseName: log.courseName,
        teacherName: log.teacherName,
        section: log.section,
        classroom: log.classroom,
        attendanceCount: log.attendanceCount,
        leaveCount: log.leaveCount,
        lateInfo: log.lateInfo,
        discipline: log.discipline,
        deviceStatus: log.deviceStatus,
        abnormalInfo: log.abnormalInfo,
        remark: log.remark,
      })
    }
  }
})

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

// 周次按固定学期开始日期估算，用户仍可在表单中手动修正。
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

async function submitLog(status = 'pending') {
  if (status === 'pending' && !validateForm()) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const now = formatDateTime()
  const operatorName = currentUser.value.name

  // 修改重提交会清空旧审批结果，并把新节点追加到原时间线。
  if (editId.value) {
    const confirmed = await showConfirm('确认修改并重新提交这条日志吗？提交后将重新进入审批流程。')
    if (!confirmed) return
    const oldLog = editLog.value
    const counselorName = currentUser.value.counselor || '辅导员'
    updateLog(editId.value, {
      ...form,
      attendanceCount: Number(form.attendanceCount),
      leaveCount: Number(form.leaveCount),
      abnormalInfo: form.abnormalInfo.trim() || '无',
      remark: form.remark.trim() || '',
      status: 'pending',
      submitTime: now,
      approver: '',
      approveOpinion: '',
      approveTime: '',
      timeline: [
        ...oldLog.timeline,
        { title: '班委修改并重新提交', time: now, operator: operatorName },
        { title: '辅导员待审批', time: now, target: counselorName },
      ],
    })
    // 通知辅导员有修改重提交。
    addNotification({
      type: 'info',
      title: '日志修改重提交',
      content: `${operatorName} 修改了「${form.courseName}」日志并重新提交，请及时审批。`,
      targetRole: 'teacher',
      targetStudentNo: '',
      targetClassName: form.className,
      logId: editId.value,
    })
    showToast('日志已修改并重新提交', 'success')
    router.push('/logs')
    return
  }

  // 新建日志时根据保存状态生成不同的初始时间线。
  const counselorName = currentUser.value.counselor || '辅导员'
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
        ? [{ title: '保存草稿', time: now, operator: operatorName }]
        : [
            { title: '提交班级日志', time: now, operator: operatorName },
            { title: '辅导员待审批', time: now, target: counselorName },
          ],
  }

  addLog(log)

  // 保存草稿不通知，正式提交才创建辅导员待办通知。
  if (status === 'pending') {
    addNotification({
      type: 'info',
      title: '新日志待审批',
      content: `${operatorName} 提交了「${form.courseName}」日志，请及时审批。`,
      targetRole: 'teacher',
      targetStudentNo: '',
      targetClassName: form.className,
      logId: log.id,
    })
  }

  showToast(status === 'draft' ? '草稿保存成功' : '日志已提交审批', 'success')
  router.push('/logs')
}
</script>

<template>
  <section class="page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">{{ editId ? '修改重提交' : '在线办理' }}</p>
        <h1>{{ editId ? '修改日志' : '班级日志填报' }}</h1>
        <p>{{ editId ? '根据审批意见修改内容，重新提交后进入审批流程。' : '请按课程实际情况如实填写，提交后进入辅导员审批流程。' }}</p>
      </div>
    </div>

    <form class="form-panel" @submit.prevent="submitLog('pending')">
      <!-- 编辑模式：显示退回意见 -->
      <div v-if="editLog" class="reject-hint" role="alert">
        <AlertCircle :size="18" aria-hidden="true" />
        <div>
          <strong>退回意见（{{ editLog.approver }}）</strong>
          <p>{{ editLog.approveOpinion }}</p>
        </div>
      </div>

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
        <button v-if="!editId" class="secondary-button" type="button" @click="submitLog('draft')">
          <Save :size="16" aria-hidden="true" />
          保存草稿
        </button>
        <button class="primary-button" type="submit">
          <Send :size="16" aria-hidden="true" />
          {{ editId ? '重新提交' : '提交审批' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.reject-hint {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px 20px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius);
  color: #92400e;
  background: #fffbeb;
  font-size: 14px;
  margin-bottom: 24px;
}

.reject-hint strong {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.reject-hint p {
  margin: 0;
  line-height: 1.5;
}

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
