<script setup>
import { Eye, Pencil, Send, Trash2 } from '@lucide/vue'
import StatusTag from './StatusTag.vue'

// 日志列表项只负责展示和抛出动作，权限判断由调用方传入。
defineProps({
  log: {
    type: Object,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
  canSubmitDraft: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['view', 'edit', 'delete', 'submit-draft'])
</script>

<template>
  <article class="log-item">
    <div class="log-item-main">
      <div class="log-item-title">
        <h3>{{ log.courseName }}</h3>
        <StatusTag :status="log.status" />
      </div>
      <div class="log-item-meta">
        <span>{{ log.className }}</span>
        <span>{{ log.studentName }}</span>
        <span>{{ log.logDate }}</span>
        <span>{{ log.section }}</span>
      </div>
      <p>{{ log.discipline }}</p>
    </div>
    <div class="log-actions">
      <button class="ghost-button" type="button" @click="$emit('view', log.id)">
        <Eye :size="16" aria-hidden="true" />
        详情
      </button>
      <button
        v-if="canEdit && (log.status === 'rejected' || log.status === 'withdrawn')"
        class="ghost-button primary"
        type="button"
        @click="$emit('edit', log.id)"
      >
        <Pencil :size="16" aria-hidden="true" />
        修改
      </button>
      <button
        v-if="canSubmitDraft && log.status === 'draft'"
        class="ghost-button primary"
        type="button"
        @click="$emit('submit-draft', log.id)"
      >
        <Send :size="16" aria-hidden="true" />
        提交
      </button>
      <button
        v-if="canDelete"
        class="ghost-button danger"
        type="button"
        @click="$emit('delete', log.id)"
      >
        <Trash2 :size="16" aria-hidden="true" />
        删除
      </button>
    </div>
  </article>
</template>
