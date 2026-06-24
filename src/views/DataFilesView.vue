<script setup>
import { computed, inject, ref } from 'vue'
import { Database, Download, FileJson, LockKeyhole, RotateCcw, Upload } from '@lucide/vue'
import EmptyState from '@/components/EmptyState.vue'
import {
  buildExportData,
  exportFileData,
  getLogs,
  importFileData,
  resetDemoData,
} from '@/data/storage'

const currentRole = inject('currentRole')
const refreshUser = inject('refreshUser')
const showConfirm = inject('showConfirm')
const logs = ref(getLogs())
const fileInput = ref(null)
const message = ref('')

const canManage = computed(() => currentRole.value === 'admin')
const dataSize = computed(() => `${(JSON.stringify(buildExportData()).length / 1024).toFixed(1)} KB`)
const pendingCount = computed(() => logs.value.filter((log) => log.status === 'pending').length)

function refreshLogs() {
  logs.value = getLogs()
}

function downloadData() {
  exportFileData()
  message.value = '数据文件已导出'
}

function chooseFile() {
  fileInput.value?.click()
}

function importData(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      importFileData(JSON.parse(String(reader.result)))
      refreshLogs()
      refreshUser()
      message.value = '数据文件已导入'
    } catch (error) {
      message.value = error.message || '导入失败'
    } finally {
      event.target.value = ''
    }
  }
  reader.readAsText(file, 'utf-8')
}

async function resetData() {
  const confirmed = await showConfirm('确认恢复初始 JSON 数据吗？当前本机数据会被覆盖。')
  if (!confirmed) return
  resetDemoData()
  refreshLogs()
  refreshUser()
  message.value = '已恢复初始数据'
}
</script>

<template>
  <section class="page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">管理员</p>
        <h1>数据文件管理</h1>
        <p>系统数据以 JSON 文件结构保存，管理员可导入、导出、恢复初始数据。</p>
      </div>
    </div>

    <section v-if="!canManage" class="panel access-panel">
      <LockKeyhole :size="36" aria-hidden="true" />
      <h2>当前角色不可管理数据文件</h2>
      <p>请切换为管理员角色后再进行导入导出。</p>
    </section>

    <template v-else>
      <div class="file-stats">
        <article>
          <Database :size="22" aria-hidden="true" />
          <span>日志记录</span>
          <strong>{{ logs.length }}</strong>
        </article>
        <article>
          <FileJson :size="22" aria-hidden="true" />
          <span>文件大小</span>
          <strong>{{ dataSize }}</strong>
        </article>
        <article>
          <Upload :size="22" aria-hidden="true" />
          <span>待审批</span>
          <strong>{{ pendingCount }}</strong>
        </article>
      </div>

      <section class="panel file-panel">
        <header class="panel-header">
          <div>
            <p class="eyebrow">JSON 文件</p>
            <h2>导入与导出</h2>
          </div>
        </header>
        <div class="file-actions">
          <button class="primary-button" type="button" @click="downloadData">
            <Download :size="16" aria-hidden="true" />
            导出数据文件
          </button>
          <button class="secondary-button" type="button" @click="chooseFile">
            <Upload :size="16" aria-hidden="true" />
            导入数据文件
          </button>
          <button class="danger-button" type="button" @click="resetData">
            <RotateCcw :size="16" aria-hidden="true" />
            恢复初始数据
          </button>
          <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="importData" />
        </div>
        <p v-if="message" class="save-tip" role="status">{{ message }}</p>
      </section>

      <section class="panel">
        <header class="panel-header">
          <div>
            <p class="eyebrow">文件预览</p>
            <h2>最近 5 条记录</h2>
          </div>
        </header>
        <div class="data-preview">
          <div v-for="log in logs.slice(0, 5)" :key="log.id">
            <strong>{{ log.courseName }}</strong>
            <span>{{ log.studentName }} / {{ log.className }} / {{ log.status }}</span>
          </div>
          <EmptyState v-if="logs.length === 0" text="暂无数据记录" />
        </div>
      </section>
    </template>
  </section>
</template>
