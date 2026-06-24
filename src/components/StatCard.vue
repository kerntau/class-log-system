<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  tone: {
    type: String,
    default: 'blue',
  },
})

defineEmits(['select'])
</script>

<template>
  <button class="stat-card" :class="`tone-${tone}`" type="button" @click="$emit('select')">
    <span>{{ title }}</span>
    <strong>{{ value }}</strong>
  </button>
</template>
