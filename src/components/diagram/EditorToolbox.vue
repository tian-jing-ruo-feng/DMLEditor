<template>
  <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-700">工具箱</h2>
    </div>
    <div class="p-4 space-y-4 overflow-y-auto">
      <div class="card cursor-pointer hover:bg-gray-50" @click="$emit('add-table')">
        <div class="flex items-center">
          <el-icon class="mr-2 text-primary"><grid /></el-icon>
          <span>添加表</span>
        </div>
      </div>
      <div class="card cursor-pointer hover:bg-gray-50" @click="$emit('add-note')">
        <div class="flex items-center">
          <el-icon class="mr-2 text-secondary"><document /></el-icon>
          <span>添加注释</span>
        </div>
      </div>
      <div class="mt-6">
        <h3 class="text-sm font-medium text-gray-500 mb-2">关系类型</h3>
        <div class="space-y-2">
          <div
            class="card cursor-pointer hover:bg-gray-50"
            @click="$emit('set-edge-type', 'oneToOne')"
          >
            <div class="flex items-center">
              <span class="mr-2 text-xs font-bold">1:1</span>
              <span>一对一关系</span>
            </div>
          </div>
          <div
            class="card cursor-pointer hover:bg-gray-50"
            @click="$emit('set-edge-type', 'oneToMany')"
          >
            <div class="flex items-center">
              <span class="mr-2 text-xs font-bold">1:N</span>
              <span>一对多关系</span>
            </div>
          </div>
          <div
            class="card cursor-pointer hover:bg-gray-50"
            @click="$emit('set-edge-type', 'manyToMany')"
          >
            <div class="flex items-center">
              <span class="mr-2 text-xs font-bold">N:M</span>
              <span>多对多关系</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Grid, Document } from '@element-plus/icons-vue'

// 定义事件
defineEmits<{
  'add-table': []
  'add-note': []
  'set-edge-type': [type: string]
}>()
</script>
