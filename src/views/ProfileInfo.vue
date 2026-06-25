<script setup>
import { inject, reactive, ref, watch } from 'vue'
import { Save, UserRoundPen } from '@lucide/vue'
import { getLogs, saveLogs, saveUser } from '@/data/storage'

const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const refreshUser = inject('refreshUser')
const showToast = inject('showToast')
const saved = ref(false)

const roleText = {
  student: '班委',
  teacher: '辅导员',
  admin: '管理员',
}

const form = reactive({ ...currentUser.value })

// 角色切换时同步重置表单，先清空可避免残留旧角色字段。
watch(currentUser, (newUser) => {
  Object.keys(form).forEach((key) => delete form[key])
  Object.assign(form, { ...newUser })
})

// 保存前只保留当前角色字段，防止学生/教师/管理员字段互相串入。
const roleFieldMap = {
  student: ['name', 'studentNo', 'className', 'department', 'phone', 'counselor'],
  teacher: ['name', 'employeeNo', 'className', 'department', 'phone', 'title'],
  admin: ['name', 'employeeNo', 'department', 'phone', 'title'],
}

function submitProfile() {
  // 学生修改学号、姓名、班级时，同步更新该学生已有日志的展示信息。
  if (currentRole.value === 'student' && currentUser.value.studentNo) {
    const previousStudentNo = currentUser.value.studentNo
    const updatedLogs = getLogs().map((log) => {
      if (log.studentNo !== previousStudentNo) return log
      return {
        ...log,
        studentName: form.name,
        studentNo: form.studentNo,
        className: form.className,
      }
    })
    saveLogs(updatedLogs)
  }

  const allowedFields = roleFieldMap[currentRole.value] || ['name']
  const cleaned = {}
  for (const key of allowedFields) {
    if (form[key] !== undefined) cleaned[key] = form[key]
  }

  saveUser(cleaned)
  refreshUser()
  showToast('资料已保存', 'success')
  saved.value = true
  window.setTimeout(() => {
    saved.value = false
  }, 1800)
}
</script>

<template>
  <section class="page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">个人中心</p>
        <h1>个人资料</h1>
        <p>维护个人基本资料信息。</p>
      </div>
    </div>

    <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">个人资料</p>
        <h2>{{ form.name }}</h2>
      </div>
      <span class="status-tag status-blue">{{ roleText[currentRole] }}</span>
    </header>

    <form class="profile-form" @submit.prevent="submitProfile">
      <label class="field">
        <span>姓名</span>
        <input v-model.trim="form.name" type="text" required />
      </label>

      <!-- 学生字段 -->
      <template v-if="currentRole === 'student'">
        <label class="field">
          <span>学号</span>
          <input v-model.trim="form.studentNo" type="text" required />
        </label>
        <label class="field">
          <span>班级</span>
          <input v-model.trim="form.className" type="text" required />
        </label>
        <label class="field">
          <span>学院</span>
          <input v-model.trim="form.department" type="text" required />
        </label>
        <label class="field">
          <span>手机号</span>
          <input v-model.trim="form.phone" type="tel" />
        </label>
        <label class="field">
          <span>辅导员</span>
          <input v-model.trim="form.counselor" type="text" />
        </label>
      </template>

      <!-- 辅导员字段 -->
      <template v-if="currentRole === 'teacher'">
        <label class="field">
          <span>工号</span>
          <input v-model.trim="form.employeeNo" type="text" required />
        </label>
        <label class="field">
          <span>负责班级</span>
          <input v-model.trim="form.className" type="text" required />
        </label>
        <label class="field">
          <span>学院</span>
          <input v-model.trim="form.department" type="text" required />
        </label>
        <label class="field">
          <span>手机号</span>
          <input v-model.trim="form.phone" type="tel" />
        </label>
        <label class="field">
          <span>职务</span>
          <input v-model.trim="form.title" type="text" />
        </label>
      </template>

      <!-- 管理员字段 -->
      <template v-if="currentRole === 'admin'">
        <label class="field">
          <span>工号</span>
          <input v-model.trim="form.employeeNo" type="text" required />
        </label>
        <label class="field">
          <span>部门</span>
          <input v-model.trim="form.department" type="text" required />
        </label>
        <label class="field">
          <span>手机号</span>
          <input v-model.trim="form.phone" type="tel" />
        </label>
        <label class="field">
          <span>职务</span>
          <input v-model.trim="form.title" type="text" />
        </label>
      </template>

      <div class="profile-save-row">
        <div class="profile-hint">
          <UserRoundPen :size="18" aria-hidden="true" />
          <span>个人信息保存在本机数据文件中，新增日志会自动带入最新资料。</span>
        </div>
        <button class="primary-button" type="submit">
          <Save :size="16" aria-hidden="true" />
          保存资料
        </button>
      </div>
    </form>
  </section>
  </section>
</template>
