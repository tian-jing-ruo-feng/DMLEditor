<template>
  <div class="w-120 bg-white border-l border-gray-200 flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-medium text-gray-700">属性</h2>
    </div>
    <div class="p-4 overflow-y-auto flex-1">
      <!-- 表属性编辑 -->
      <div v-if="selectedCell && selectedCell.isNode()">
        <h3 class="text-md font-medium text-gray-700 mb-4">表属性</h3>
        <el-form label-position="top">
          <el-form-item label="表名">
            <el-input v-model="localTableProps.name" @change="updateTable" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="localTableProps.comment" type="textarea" rows="2" @change="updateTable" />
          </el-form-item>
          
          <div class="flex justify-between items-center mt-6 mb-2">
            <h4 class="text-md font-medium text-gray-700">字段列表</h4>
            <el-button type="primary" size="small" @click="addField" :icon="Plus">添加字段</el-button>
          </div>
          
          <el-table :data="localTableProps.fields" style="width: 100%" size="small">
            <el-table-column label="名称" min-width="100">
              <template #default="{ row, $index }">
                <el-input v-model="row.name" size="small" @change="updateTable" />
              </template>
            </el-table-column>
            <el-table-column label="类型" min-width="100">
              <template #default="{ row, $index }">
                <el-select v-model="row.type" size="small" @change="updateTable">
                  <el-option v-for="type in dataTypes" :key="type" :label="type" :value="type" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row, $index }">
                <div class="flex justify-between">
                  <div>
                    <el-checkbox v-model="row.primaryKey" @change="updateTable" size="small" label="PK" border />
                  </div>
                  <el-checkbox v-model="row.notNull" @change="updateTable" size="small" label="NN" border />
                  <el-button type="danger" size="small" :icon="Delete" @click="removeField($index)" border/>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </div>

      <!-- 关系属性编辑 -->
      <div v-else-if="selectedCell && selectedCell.isEdge()">
        <h3 class="text-md font-medium text-gray-700 mb-4">关系属性</h3>
        <el-form label-position="top">
          <el-form-item label="关系类型">
            <el-select v-model="localEdgeProps.type" @change="updateEdgeType">
              <el-option label="一对一 (1:1)" value="oneToOne" />
              <el-option label="一对多 (1:N)" value="oneToMany" />
              <el-option label="多对多 (N:M)" value="manyToMany" />
            </el-select>
          </el-form-item>
          <el-form-item label="源表外键">
            <el-input v-model="localEdgeProps.sourceField" @change="updateEdge" />
          </el-form-item>
          <el-form-item label="目标表外键">
            <el-input v-model="localEdgeProps.targetField" @change="updateEdge" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="localEdgeProps.comment" type="textarea" rows="2" @change="updateEdge" />
          </el-form-item>
        </el-form>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
        <el-icon class="text-4xl mb-2"><info-filled /></el-icon>
        <p>选择一个表或关系来编辑属性</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, watch } from 'vue';
import { InfoFilled, Plus, Delete } from '@element-plus/icons-vue';
import { Cell } from '@antv/x6';

// 定义属性
interface TableField {
  name: string;
  type: string;
  primaryKey: boolean;
  notNull: boolean;
}

interface TableProps {
  id: string;
  name: string;
  comment: string;
  fields: TableField[];
}

interface EdgeProps {
  id: string;
  type: string;
  sourceField: string;
  targetField: string;
  comment: string;
}

const props = defineProps<{
  selectedCell: Cell | null;
  tableProps: TableProps;
  edgeProps: EdgeProps;
  dataTypes: string[];
}>();

// 定义事件
const emit = defineEmits<{
  'update-edge-type': [];
  'update-edge': [];
}>();


// 本地响应式状态
const localTableProps = reactive<TableProps>({
  id: '',
  name: '',
  comment: '',
  fields: []
});

const localEdgeProps = reactive<EdgeProps>({
  id: '',
  type: 'oneToMany',
  sourceField: '',
  targetField: '',
  comment: ''
});

// 监听表属性变化
watch(() => props.tableProps, (newVal) => {
  localTableProps.id = newVal.id;
  localTableProps.name = newVal.name;
  localTableProps.comment = newVal.comment;
  localTableProps.fields = [...newVal.fields];
}, { deep: true });

// 监听边属性变化
watch(() => props.edgeProps, (newVal) => {
  localEdgeProps.id = newVal.id;
  localEdgeProps.type = newVal.type;
  localEdgeProps.sourceField = newVal.sourceField;
  localEdgeProps.targetField = newVal.targetField;
  localEdgeProps.comment = newVal.comment;
}, { deep: true });

// 方法定义
// 更新节点数据

const updateTable = () => {
  props.selectedCell?.updateData({...localTableProps})
};

const addField = () => {
  localTableProps.fields.push({
    name: '',
    type: 'INT',
    primaryKey: false,      
    notNull: false,
  });
  updateTable();
};

const removeField = (index: number) => {
  localTableProps.fields.splice(index, 1);
  nextTick(() => {
    updateTable();
  })
};

const updateEdgeType = () => {
  emit('update-edge-type');
};

const updateEdge = () => {
  emit('update-edge');
};
</script>