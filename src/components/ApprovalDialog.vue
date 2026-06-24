<script setup>
import { ref, watch } from 'vue'
import { X } from '@lucide/vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  log: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['approve', 'reject', 'close'])
const opinion = ref('')

// 快捷审批意见模板
const approveTemplates = ['记录完整，情况属实。', '日志填报规范，予以通过。', '内容详实，审批通过。']
const rejectTemplates = ['请补充课堂纪律的具体描述。', '设备情况说明不够详细，请完善。', '异常情况需要说明处理结果。']

watch(
  () => props.visible,
  (visible) => {
    if (visible) opinion.value = ''
  },
)

function applyTemplate(template) {
  opinion.value = template
}

function submit(result) {
  if (!opinion.value.trim()) {
    window.alert('请填写审批意见')
    return
  }

  if (result === 'approve') {
    emit('approve', { id: props.log.id, opinion: opinion.value.trim() })
  } else {
    emit('reject', { id: props.log.id, opinion: opinion.value.trim() })
  }
}
</script>

<template>
  <div v-if="visible && log" class="dialog-backdrop" role="presentation" @click.self="$emit('close')">
    <section class="approval-dialog" role="dialog" aria-modal="true" aria-labelledby="approval-title">
      <header>
        <div>
          <p>审批日志</p>
          <h2 id="approval-title">{{ log.className }} / {{ log.courseName }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="关闭审批弹窗" @click="$emit('close')">
          <X :size="18" aria-hidden="true" />
        </button>
      </header>
      <dl class="dialog-summary">
        <div>
          <dt>填报人</dt>
          <dd>{{ log.studentName }}</dd>
        </div>
        <div>
          <dt>上课日期</dt>
          <dd>{{ log.logDate }}</dd>
        </div>
        <div>
          <dt>到课 / 请假</dt>
          <dd>{{ log.attendanceCount }} / {{ log.leaveCount }}</dd>
        </div>
      </dl>
      <label class="field full">
        <span>审批意见</span>
        <textarea v-model="opinion" rows="4" placeholder="请填写通过意见或退回原因"></textarea>
      </label>
      <div class="template-section">
        <div class="template-group">
          <span class="template-label">通过模板</span>
          <button
            v-for="t in approveTemplates"
            :key="t"
            type="button"
            class="template-chip approve"
            @click="applyTemplate(t)"
          >
            {{ t }}
          </button>
        </div>
        <div class="template-group">
          <span class="template-label">退回模板</span>
          <button
            v-for="t in rejectTemplates"
            :key="t"
            type="button"
            class="template-chip reject"
            @click="applyTemplate(t)"
          >
            {{ t }}
          </button>
        </div>
      </div>
      <footer>
        <button class="ghost-button" type="button" @click="$emit('close')">取消</button>
        <button class="danger-button" type="button" @click="submit('reject')">退回修改</button>
        <button class="primary-button" type="button" @click="submit('approve')">审批通过</button>
      </footer>
    </section>
  </div>
</template>

<style scoped>
.template-section {
  padding: 0 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.template-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  margin-right: 4px;
}

.template-chip {
  padding: 5px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--border);
  background: var(--surface);
  color: #475569;
  transition: all 0.2s ease;
}

.template-chip.approve:hover {
  border-color: var(--green);
  color: var(--green);
  background: #ecfdf5;
}

.template-chip.reject:hover {
  border-color: var(--red);
  color: var(--red);
  background: #fef2f2;
}
</style>
