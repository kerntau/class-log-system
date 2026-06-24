<script setup>
import { provide, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppToast from '@/components/AppToast.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { getRole, getUser, setRole } from '@/data/storage'

const role = ref(getRole())
const user = ref(getUser())
const toastRef = ref(null)
const confirmRef = ref(null)

function handleRoleChange(nextRole) {
  role.value = nextRole
  setRole(nextRole)
  user.value = getUser()
}

function refreshUser() {
  user.value = getUser()
}

function showToast(message, type = 'info') {
  toastRef.value?.addToast(message, type)
}

function showConfirm(message) {
  return confirmRef.value?.show(message) ?? Promise.resolve(false)
}

provide('currentRole', role)
provide('currentUser', user)
provide('refreshUser', refreshUser)
provide('showToast', showToast)
provide('showConfirm', showConfirm)
</script>

<template>
  <div class="app-shell">
    <AppHeader :role="role" :user="user" @role-change="handleRoleChange" />
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppToast ref="toastRef" />
    <ConfirmDialog ref="confirmRef" />
  </div>
</template>
