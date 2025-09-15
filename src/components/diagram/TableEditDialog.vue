<template>
  <el-dialog v-model="visible" title="Edit Table" width="600px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="Table Name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="Comment">
        <el-input v-model="form.comment" type="textarea" :rows="2" />
      </el-form-item>

      <el-divider>Fields</el-divider>

      <div v-for="(field, index) in form.fields" :key="index" class="field-item mb-4">
        <div class="flex items-center gap-4">
          <el-form-item label="Field Name" class="flex-1">
            <el-input v-model="field.name" />
          </el-form-item>
          <el-form-item label="Type" class="flex-1">
            <el-select v-model="field.type" class="w-full">
              <el-option v-for="type in fieldTypes" :key="type" :value="type" :label="type" />
            </el-select>
          </el-form-item>
        </div>
        <div class="flex items-center gap-4 mt-2">
          <el-form-item label="Primary Key">
            <el-checkbox v-model="field.primaryKey" />
          </el-form-item>
          <el-form-item label="Not Null">
            <el-checkbox v-model="field.notNull" />
          </el-form-item>
          <el-button type="danger" size="small" plain circle @click="removeField(index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <el-button type="primary" plain @click="addField">
        <el-icon><Plus /></el-icon>
        Add Field
      </el-button>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit">Save</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'

const emit = defineEmits(['submit'])

const visible = ref(false)
const form = reactive({
  id: '',
  name: '',
  comment: '',
  fields: [] as Array<{
    name: string
    type: string
    primaryKey: boolean
    notNull: boolean
  }>,
})

const fieldTypes = [
  'INT',
  'VARCHAR',
  'TEXT',
  'DATE',
  'DATETIME',
  'TIMESTAMP',
  'BOOLEAN',
  'FLOAT',
  'DOUBLE',
  'DECIMAL',
  'BLOB',
  'JSON',
]

const open = (data: {
  id: string
  name: string
  comment?: string
  fields: Array<{
    name: string
    type: string
    primaryKey: boolean
    notNull: boolean
  }>
}) => {
  form.id = data.id
  form.name = data.name
  form.comment = data.comment || ''
  form.fields = [...data.fields]
  visible.value = true
}

const addField = () => {
  form.fields.push({
    name: '',
    type: 'VARCHAR',
    primaryKey: false,
    notNull: false,
  })
}

const removeField = (index: number) => {
  form.fields.splice(index, 1)
}

const handleSubmit = () => {
  emit('submit', {
    id: form.id,
    name: form.name,
    comment: form.comment,
    fields: form.fields,
  })
  visible.value = false
}

defineExpose({
  open,
})
</script>

<style scoped>
.field-item {
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}
</style>
