<script setup>
import { provide, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppToast from '@/components/AppToast.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { getRole, getUser, setRole } from '@/data/storage'

const router = useRouter()
const role = ref(getRole())
const user = ref(getUser())
const toastRef = ref(null)
const confirmRef = ref(null)

function handleRoleChange(nextRole) {
  role.value = nextRole
  setRole(nextRole)
  user.value = getUser()

  // 切换角色后立即校验当前路由，避免停留在无权限页面。
  const currentRoute = router.currentRoute.value
  const noAccess = currentRoute.matched.some(
    (record) => record.meta.allowedRoles && !record.meta.allowedRoles.includes(nextRole),
  )
  if (noAccess) {
    router.replace({ name: 'Home' })
  }
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

// 向页面提供少量全局能力，避免为每个视图层层传递 props。
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
