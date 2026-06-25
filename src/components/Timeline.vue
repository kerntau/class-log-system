<script setup>
// 审批流时间线支持 operator、target、opinion 三类补充信息。
defineProps({
  nodes: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <ol class="timeline">
    <li v-for="(node, index) in nodes" :key="`${node.title}-${node.time}-${index}`">
      <span class="timeline-dot" aria-hidden="true"></span>
      <div>
        <strong>
          <span v-if="node.operator" class="timeline-operator">{{ node.operator }}</span>
          {{ node.title }}
          <span v-if="node.target" class="timeline-target">→ {{ node.target }}</span>
        </strong>
        <time>{{ node.time }}</time>
        <p v-if="node.opinion" class="timeline-opinion">{{ node.opinion }}</p>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline li {
  position: relative;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 12px;
  padding-bottom: 20px;
}

.timeline li:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  z-index: 1;
  width: 12px;
  height: 12px;
  margin-top: 3px;
  border-radius: 50%;
  background: var(--primary);
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px var(--primary-soft);
}

.timeline li::before {
  position: absolute;
  top: 16px;
  bottom: 0;
  left: 5px;
  width: 2px;
  background: var(--border);
  content: '';
}

.timeline li:last-child::before {
  display: none;
}

.timeline strong {
  display: block;
  font-size: 14px;
  color: var(--text-dark);
  margin-bottom: 2px;
}

.timeline-operator {
  color: var(--primary);
  font-weight: 700;
  margin-right: 4px;
}

.timeline-target {
  color: var(--text-hint);
  font-weight: 500;
  font-size: 13px;
  margin-left: 4px;
}

.timeline time {
  display: block;
  font-size: 12px;
  color: var(--text-hint);
  margin-bottom: 4px;
}

.timeline-opinion {
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--surface-soft);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  margin: 6px 0 0;
  line-height: 1.5;
}
</style>
