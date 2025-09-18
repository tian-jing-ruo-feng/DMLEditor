<template>
  <el-card class="table-node text-sm" shadow="always">
    <template #header>
      <div class="table-header">
        <span class="table-name">{{ table.name }}</span>
        <el-tag v-if="table.comment" size="small" type="info">{{ table.comment }}</el-tag>
      </div>
    </template>

    <div class="table-fields" ref="tableFields">
      <div v-for="field in table.fields" :key="field.name" class="table-field">
        <div class="field-name">
          <el-tag v-if="field.primaryKey" size="small" type="warning">PK</el-tag>
          <el-tag v-if="field.notNull" size="small" type="danger">NN</el-tag>
          {{ field.name }}
        </div>
        <div class="field-type">{{ field.type }}</div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { getTableNodeWidth } from '@/utils/diagramUtils'
import { Cell, Node } from '@antv/x6'
import { reactive, inject, watchEffect, computed, useTemplateRef, nextTick, watch } from 'vue'

// 定义类型
interface Field {
  name: string
  type: string
  primaryKey: boolean
  notNull: boolean
}

interface Table {
  id: string
  name: string
  comment: string
  fields: Field[]
  x: number
  y: number
}

// 注入依赖
const getNode = inject('getNode') as () => any
const node = getNode() as Node
const tableFieldsRef = useTemplateRef('tableFields')

node.on('change:data', (args: any) => {
  Object.assign(table, args.current)
})

// 响应式数据
const table = reactive<Table>({
  id: '1',
  name: 'user',
  comment: '用户表',
  fields: [
    {
      name: 'id',
      type: 'int',
      primaryKey: true,
      notNull: true,
    },
    {
      name: 'name',
      type: 'varchar(255)',
      primaryKey: false,
      notNull: false,
    },
    {
      name: 'age',
      type: 'int',
      primaryKey: false,
      notNull: false,
    },
  ],
  x: 0,
  y: 0,
})

// 动态设置节点大小
watch(
  () => table.fields,
  async () => {
    await nextTick()
    const height = tableFieldsRef.value?.clientHeight || 0
    const tableFieldHeight = 36.67
    const cardBodyPaddingY = 32
    const width = getTableNodeWidth()
    node.setAttrs({
      size: {
        width,
        height,
      },
    })
    node.resize(width, height + tableFieldHeight + cardBodyPaddingY)
  },
  {
    deep: true,
  },
)

watchEffect(() => {
  const node = getNode()
  Object.assign(table, node.data)
})
</script>

<style lang="scss" scoped>
.table-node {
  width: 240px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;

  :deep(.el-card__header) {
    padding: 8px;
  }
  :deep(.el-card__body) {
    padding: 16px;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-name {
  font-weight: bold;
}

.table-fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-field {
  display: flex;
  gap: 4px;
  justify-content: space-between;
  // align-items: center;
  border-bottom: 1px dashed var(--el-border-color);
}

.field-name {
  display: flex;
  gap: 4px;
  align-items: center;
}

.field-type {
  color: #888;
  font-size: 0.8em;
}
</style>
