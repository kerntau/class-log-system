<script setup>
import { computed, inject, ref } from 'vue'
import { Database, Download, FileJson, RotateCcw, Upload } from '@lucide/vue'
import {
  buildExportData,
  exportFileData,
  getLogs,
  importFileData,
  resetDemoData,
} from '@/data/storage'

const refreshUser = inject('refreshUser')
const showConfirm = inject('showConfirm')
const logs = ref(getLogs())
const fileInput = ref(null)
const message = ref('')

// 估算当前导出 JSON 的体积，方便管理员判断备份文件规模。
const dataSize = computed(() => `${(JSON.stringify(buildExportData()).length / 1024).toFixed(1)} KB`)

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

async function importData(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const confirmed = await showConfirm(`确认导入文件「${file.name}」吗？当前数据将被覆盖。`)
  if (!confirmed) {
    event.target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    try {
      // 导入只校验必要结构，具体数据会进入内存缓存。
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
</template>
