<script setup>
import { ref } from 'vue'
import { AlertTriangle } from '@lucide/vue'

const visible = ref(false)
const message = ref('')
let resolvePromise = null

function show(msg) {
  message.value = msg
  visible.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

function confirm() {
  visible.value = false
  if (resolvePromise) resolvePromise(true)
}

function cancel() {
  visible.value = false
  if (resolvePromise) resolvePromise(false)
}

defineExpose({ show })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="confirm-backdrop" @click.self="cancel">
      <div class="confirm-dialog" role="alertdialog" aria-modal="true">
        <p>
          <AlertTriangle :size="18" style="color: var(--orange); vertical-align: -3px; margin-right: 6px;" aria-hidden="true" />
          {{ message }}
        </p>
        <div class="confirm-actions">
          <button class="ghost-button" type="button" @click="cancel">取消</button>
          <button class="primary-button" type="button" @click="confirm">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
