<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-primary text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Database Modeler</h1>
        <div class="flex items-center gap-4">
          <el-button type="text" class="text-white">
            <el-icon><User /></el-icon>
          </el-button>
          <el-button type="text" class="text-white">
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </div>
    </header>
    
    <main class="flex-1">
      <slot />
    </main>
    
    <footer class="bg-gray-100 p-2 text-center text-sm text-gray-600">
      Database Modeler © 2025 - Powered by Vue 3 & AntV X6
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { User, Setting } from '@element-plus/icons-vue';
</script>

<style scoped>
header {
  background-color: var(--el-color-primary);
}
</style>