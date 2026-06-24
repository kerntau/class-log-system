<script setup>
import { computed, inject, ref } from 'vue'
import { useRouter } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import LogRecordItem from '@/components/LogRecordItem.vue'
import { getLogs } from '@/data/storage'

const router = useRouter()
const currentUser = inject('currentUser')
const logs = ref(getLogs())
const myLogs = computed(() => logs.value.filter((log) => log.studentNo === currentUser.value.studentNo))
</script>

<template>
  <section class="panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">我的日志</p>
        <h2>本人提交记录</h2>
      </div>
    </header>
    <div class="stack">
      <LogRecordItem
        v-for="log in myLogs"
        :key="log.id"
        :log="log"
        @view="router.push(`/logs/detail/${$event}`)"
      />
      <EmptyState v-if="myLogs.length === 0" text="暂无本人日志" action-text="新增日志" @action="router.push('/logs/create')" />
    </div>
  </section>
</template>
