<script setup>
import { provide, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { getRole, getUser, setRole } from '@/data/storage'

const role = ref(getRole())
const user = ref(getUser())

function handleRoleChange(nextRole) {
  role.value = nextRole
  setRole(nextRole)
}

function refreshUser() {
  user.value = getUser()
}

provide('currentRole', role)
provide('currentUser', user)
provide('refreshUser', refreshUser)
</script>

<template>
  <div class="app-shell">
    <AppHeader :role="role" :user="user" @role-change="handleRoleChange" />
    <div class="app-body">
      <AppSidebar :role="role" />
      <main class="app-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>
