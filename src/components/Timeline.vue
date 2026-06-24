<script setup>
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
        <strong>{{ node.title }}</strong>
        <time>{{ node.time }}</time>
        <p v-if="node.opinion">{{ node.opinion }}</p>
      </div>
    </li>
  </ol>
</template>
