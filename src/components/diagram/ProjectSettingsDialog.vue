<template>
  <el-dialog v-model="visible" title="Project Settings" width="500px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="Project Name">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="Database Type">
        <el-select v-model="form.dbType" class="w-full">
          <el-option value="mysql" label="MySQL" />
          <el-option value="postgresql" label="PostgreSQL" />
          <el-option value="sqlserver" label="SQL Server" />
          <el-option value="oracle" label="Oracle" />
          <el-option value="sqlite" label="SQLite" />
        </el-select>
      </el-form-item>

      <el-form-item label="Export Options">
        <el-checkbox v-model="form.includeComments">Include Comments</el-checkbox>
        <el-checkbox v-model="form.includeDropStatements">Include DROP Statements</el-checkbox>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit">Save</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useDiagramStore } from '@/stores/useDiagramStore'

const emit = defineEmits(['submit'])

const diagramStore = useDiagramStore()
const visible = ref(false)
const form = reactive({
  name: '',
  dbType: 'mysql',
  includeComments: true,
  includeDropStatements: false,
})

const open = () => {
  form.name = diagramStore.projectName
  visible.value = true
}

const handleSubmit = () => {
  emit('submit', {
    name: form.name,
    dbType: form.dbType,
    includeComments: form.includeComments,
    includeDropStatements: form.includeDropStatements,
  })
  visible.value = false
}

defineExpose({
  open,
})
</script>
