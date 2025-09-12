<template>
  <el-card class="table-node" shadow="hover">
    <template #header>
      <div class="table-header">
        <span class="table-name">{{ table.name }}</span>
        <el-tag v-if="table.comment" size="small" type="info">{{ table.comment }}</el-tag>
      </div>
    </template>
    
    <div class="table-fields">
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

<script lang="ts" setup>
defineProps<{
  table: {
    id: string;
    name: string;
    comment?: string;
    fields: Array<{
      name: string;
      type: string;
      primaryKey: boolean;
      notNull: boolean;
    }>;
    x: number;
    y: number;
  };
}>();
</script>

<style scoped>
.table-node {
  width: 240px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
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
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px dashed #eee;
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