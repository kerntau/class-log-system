<script setup>
const tabs = [
  { label: '个人资料', path: '/profile/info' },
  { label: '我的日志', path: '/profile/my-logs' },
]
</script>

<template>
  <section class="page">
    <div class="page-heading compact">
      <div>
        <p class="eyebrow">个人中心</p>
        <h1>我的工作台</h1>
        <p>维护个人资料，并查看本人提交的班级日志。</p>
      </div>
    </div>

    <div class="profile-layout">
      <aside class="profile-tabs">
        <RouterLink v-for="tab in tabs" :key="tab.path" :to="tab.path">
          {{ tab.label }}
        </RouterLink>
      </aside>
      <RouterView />
    </div>
  </section>
</template>
