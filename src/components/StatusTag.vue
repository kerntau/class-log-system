<script setup>
import { statusMap } from '@/data/storage'

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
