<script setup>
import { Inbox } from '@lucide/vue'

defineProps({
  text: {
    type: String,
    default: '暂无数据',
  },
  actionText: {
    type: String,
    default: '',
  },
})

defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <Inbox :size="36" aria-hidden="true" />
    <p>{{ text }}</p>
    <button v-if="actionText" class="secondary-button" type="button" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>
