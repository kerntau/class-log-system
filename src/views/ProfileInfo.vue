<script setup>
import { inject, reactive, ref } from 'vue'
import { Save, UserRoundPen } from '@lucide/vue'
import { getLogs, saveLogs, saveUser } from '@/data/storage'

const currentRole = inject('currentRole')
const currentUser = inject('currentUser')
const refreshUser = inject('refreshUser')
const saved = ref(false)

const roleText = {
  student: '学生',
  teacher: '辅导员',
  admin: '管理员',
}

const form = reactive({ ...currentUser.value })

function submitProfile() {
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
  saveUser(form)
  refreshUser()
  saved.value = true
  window.setTimeout(() => {
    saved.value = false
  }, 1800)
}
</script>

<template>
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
      <p v-if="saved" class="save-tip" role="status">资料已保存</p>
    </form>
  </section>
</template>
