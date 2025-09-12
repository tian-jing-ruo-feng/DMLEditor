<template>
  <el-dialog v-model="visible" title="Export Database Model" width="600px">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="SQL" name="sql">
        <el-form :model="sqlForm" label-width="120px">
          <el-form-item label="Database Type">
            <el-select v-model="sqlForm.dbType" class="w-full">
              <el-option value="mysql" label="MySQL" />
              <el-option value="postgresql" label="PostgreSQL" />
              <el-option value="sqlserver" label="SQL Server" />
              <el-option value="oracle" label="Oracle" />
              <el-option value="sqlite" label="SQLite" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Options">
            <el-checkbox v-model="sqlForm.includeComments">Include Comments</el-checkbox>
            <el-checkbox v-model="sqlForm.includeDropStatements">Include DROP Statements</el-checkbox>
          </el-form-item>
          
          <el-form-item label="SQL Preview">
            <el-input
              v-model="sqlPreview"
              type="textarea"
              :rows="10"
              readonly
              resize="none"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
      
      <el-tab-pane label="Image" name="image">
        <el-form :model="imageForm" label-width="120px">
          <el-form-item label="Format">
            <el-select v-model="imageForm.format" class="w-full">
              <el-option value="png" label="PNG" />
              <el-option value="jpg" label="JPEG" />
              <el-option value="svg" label="SVG" />
              <el-option value="pdf" label="PDF" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="Quality">
            <el-slider
              v-model="imageForm.quality"
              :min="10"
              :max="100"
              :step="5"
              show-input
            />
          </el-form-item>
          
          <el-form-item label="Preview">
            <div class="border border-gray-200 p-4 flex justify-center">
              <div class="bg-white p-2 shadow-md">
                <div class="text-center text-gray-500">Diagram Preview</div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleExport">Export</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { useDiagramStore } from '@/stores/useDiagramStore';

const emit = defineEmits(['export']);

const diagramStore = useDiagramStore();
const visible = ref(false);
const activeTab = ref('sql');

const sqlForm = reactive({
  dbType: 'mysql',
  includeComments: true,
  includeDropStatements: false
});

const imageForm = reactive({
  format: 'png',
  quality: 90
});

const sqlPreview = computed(() => {
  // 这里应该生成实际的 SQL 预览
  return '-- SQL preview will be generated here\n-- based on the current diagram';
});

const open = () => {
  visible.value = true;
};

const handleExport = () => {
  if (activeTab.value === 'sql') {
    emit('export', {
      type: 'sql',
      ...sqlForm
    });
  } else {
    emit('export', {
      type: 'image',
      ...imageForm
    });
  }
  visible.value = false;
};

defineExpose({
  open
});
</script>

<style scoped>
:deep(.el-tabs__content) {
  padding: 0 20px;
}
</style>