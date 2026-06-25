<script setup>
import { UserCheck, ClipboardCheck, Shield } from '@lucide/vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

// 角色切换是演示系统入口，图标和文案保持在组件内集中维护。
const roles = [
  { label: '班委', value: 'student', icon: UserCheck },
  { label: '辅导员', value: 'teacher', icon: ClipboardCheck },
  { label: '管理员', value: 'admin', icon: Shield },
]

function select(value) {
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <div class="role-switcher" role="radiogroup" aria-label="切换角色">
    <button
      v-for="role in roles"
      :key="role.value"
      :class="['role-btn', { active: modelValue === role.value }]"
      type="button"
      role="radio"
      :aria-checked="modelValue === role.value"
      @click="select(role.value)"
    >
      <component :is="role.icon" :size="14" aria-hidden="true" />
      {{ role.label }}
    </button>
  </div>
</template>
