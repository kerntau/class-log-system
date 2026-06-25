<script setup>
import { ref } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from '@lucide/vue'

// 全局轻提示队列，由 App.vue 通过 expose 调用。
const toasts = ref([])
let toastId = 0

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

function addToast(message, type = 'info', duration = 2500) {
  const id = ++toastId
  toasts.value.push({ id, message, type, leaving: false })

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
}

function removeToast(id) {
  const toast = toasts.value.find((t) => t.id === id)
  if (!toast || toast.leaving) return
  toast.leaving = true
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 200)
}

defineExpose({ addToast })
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`, { leaving: toast.leaving }]"
        role="alert"
      >
        <component :is="iconMap[toast.type]" :size="18" aria-hidden="true" />
        <span>{{ toast.message }}</span>
        <button class="toast-close" type="button" aria-label="关闭" @click="removeToast(toast.id)">
          <X :size="14" />
        </button>
      </div>
    </div>
  </Teleport>
</template>
