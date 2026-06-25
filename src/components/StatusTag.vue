<script setup>
import { statusMap } from '@/data/storage'

// 状态文案和颜色由 storage.js 统一映射，未知状态降级显示原值。
defineProps({
  status: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <span class="status-tag" :class="`status-${statusMap[status]?.className || 'gray'}`">
    {{ statusMap[status]?.text || status }}
  </span>
</template>
