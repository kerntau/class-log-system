<script setup>
import { computed } from 'vue'
import { ChevronDown } from '@lucide/vue'
import { roleOptions } from '@/data/mockData'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedRole = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})
</script>

<template>
  <label class="role-switcher">
    <span>当前角色</span>
    <select v-model="selectedRole" aria-label="切换当前角色">
      <option v-for="role in roleOptions" :key="role.value" :value="role.value">
        {{ role.label }}
      </option>
    </select>
    <ChevronDown :size="16" aria-hidden="true" />
  </label>
</template>
