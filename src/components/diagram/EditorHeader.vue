<template>
  <header class="bg-white border-b border-gray-200 shadow-sm">
    <div class="container mx-auto px-4 py-2">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <router-link to="/" class="text-gray-600 hover:text-gray-900">
            <el-icon><back /></el-icon>
          </router-link>
          <h1 class="text-xl font-semibold text-gray-800">{{ projectName }}</h1>
          <el-input v-model="localProjectName" size="small" class="w-64" placeholder="项目名称" @change="updateProjectName" />
        </div>
        <div class="flex items-center space-x-2">
          <el-button-group>
            <el-button :icon="Refresh" @click="$emit('reset-view')" title="重置视图"></el-button>
            <el-button :icon="ZoomIn" @click="$emit('zoom-in')" title="放大"></el-button>
            <el-button :icon="ZoomOut" @click="$emit('zoom-out')" title="缩小"></el-button>
          </el-button-group>
          <el-button-group>
            <el-button :icon="Back" @click="$emit('undo')" :disabled="!canUndo" title="撤销"></el-button>
            <el-button :icon="Right" @click="$emit('redo')" :disabled="!canRedo" title="重做"></el-button>
          </el-button-group>
          <el-dropdown trigger="click">
            <el-button>
              导出 <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$emit('export-sql')">导出 SQL</el-dropdown-item>
                <el-dropdown-item @click="$emit('export-image')">导出图片</el-dropdown-item>
                <el-dropdown-item @click="$emit('export-json')">导出 JSON</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" @click="$emit('save')">保存</el-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { Back, Right, ZoomIn, ZoomOut, Refresh, ArrowDown } from '@element-plus/icons-vue';

export default defineComponent({
  name: 'EditorHeader',
  components: {
    Back, Right, ZoomIn, ZoomOut, Refresh, ArrowDown
  },
  props: {
    projectName: {
      type: String,
      required: true
    },
    canUndo: {
      type: Boolean,
      default: false
    },
    canRedo: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'update:project-name',
    'reset-view',
    'zoom-in',
    'zoom-out',
    'undo',
    'redo',
    'export-sql',
    'export-image',
    'export-json',
    'save'
  ],
  setup(props, { emit }) {
    const localProjectName = ref(props.projectName);

    watch(() => props.projectName, (newVal) => {
      localProjectName.value = newVal;
    });

    const updateProjectName = () => {
      emit('update:project-name', localProjectName.value);
    };

    return {
      localProjectName,
      updateProjectName,
      Back,
      Right,
      ZoomIn,
      ZoomOut,
      Refresh,
      ArrowDown
    };
  }
});
</script>