<script setup>
import { Eye, RotateCcw, Trash2 } from '@lucide/vue'
import StatusTag from './StatusTag.vue'

defineProps({
  log: {
    type: Object,
    required: true,
  },
  canWithdraw: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['view', 'withdraw', 'delete'])
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
        v-show="canWithdraw && log.status === 'pending'"
        class="ghost-button warn"
        type="button"
        @click="$emit('withdraw', log.id)"
      >
        <RotateCcw :size="16" aria-hidden="true" />
        撤回
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
