<template>
  <el-progress type="dashboard" :percentage="percentage" :width="80">
    <template #default="{ percentage }">
      <span class="percentage-value">{{ percentage }}%</span>
    </template>
  </el-progress>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'

// 注入依赖
const getNode = inject('getNode') as () => any

// 响应式数据
const percentage = ref(80)

// 生命周期钩子
onMounted(() => {
  const node = getNode()
  console.log(node)
})
</script>