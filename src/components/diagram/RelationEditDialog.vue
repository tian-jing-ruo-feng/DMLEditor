<template>
  <el-dialog v-model="visible" title="Edit Relation" width="500px">
    <el-form :model="form" label-width="100px">
      <el-form-item label="Source Table">
        <el-select v-model="form.source" class="w-full" disabled>
          <el-option :value="form.source" :label="sourceTableName" />
        </el-select>
      </el-form-item>
      <el-form-item label="Source Field">
        <el-select v-model="form.sourceField" class="w-full">
          <el-option
            v-for="field in sourceFields"
            :key="field.name"
            :value="field.name"
            :label="field.name"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="Relation Type">
        <el-select v-model="form.type" class="w-full">
          <el-option value="oneToOne" label="One to One (1:1)" />
          <el-option value="oneToMany" label="One to Many (1:N)" />
          <el-option value="manyToMany" label="Many to Many (N:M)" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="Target Table">
        <el-select v-model="form.target" class="w-full" disabled>
          <el-option :value="form.target" :label="targetTableName" />
        </el-select>
      </el-form-item>
      <el-form-item label="Target Field">
        <el-select v-model="form.targetField" class="w-full">
          <el-option
            v-for="field in targetFields"
            :key="field.name"
            :value="field.name"
            :label="field.name"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="Comment">
        <el-input v-model="form.comment" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleSubmit">Save</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { useDiagramStore } from '@/stores/useDiagramStore';

const emit = defineEmits(['submit']);

const diagramStore = useDiagramStore();
const visible = ref(false);
const form = reactive({
  source: '',
  target: '',
  type: 'oneToOne',
  sourceField: '',
  targetField: '',
  comment: ''
});

const sourceTableName = computed(() => {
  const table = diagramStore.tables.find(t => t.id === form.source);
  return table?.name || '';
});

const targetTableName = computed(() => {
  const table = diagramStore.tables.find(t => t.id === form.target);
  return table?.name || '';
});

const sourceFields = computed(() => {
  const table = diagramStore.tables.find(t => t.id === form.source);
  return table?.fields || [];
});

const targetFields = computed(() => {
  const table = diagramStore.tables.find(t => t.id === form.target);
  return table?.fields || [];
});

const open = (data: {
  source: string;
  target: string;
  type?: string;
  sourceField?: string;
  targetField?: string;
  comment?: string;
}) => {
  form.source = data.source;
  form.target = data.target;
  form.type = data.type || 'oneToOne';
  form.sourceField = data.sourceField || '';
  form.targetField = data.targetField || '';
  form.comment = data.comment || '';
  visible.value = true;
};

const handleSubmit = () => {
  emit('submit', {
    source: form.source,
    target: form.target,
    type: form.type,
    sourceField: form.sourceField,
    targetField: form.targetField,
    comment: form.comment
  });
  visible.value = false;
};

defineExpose({
  open
});
</script>