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

watch(
  () => props.visible,
  (visible) => {
    if (visible) opinion.value = ''
  },
)

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
  <div v-if="visible && log" class="dialog-backdrop" role="presentation">
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
      <footer>
        <button class="secondary-button" type="button" @click="$emit('close')">取消</button>
        <button class="danger-button" type="button" @click="submit('reject')">退回</button>
        <button class="primary-button" type="button" @click="submit('approve')">通过</button>
      </footer>
    </section>
  </div>
</template>
