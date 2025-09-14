<template>
  <div class="h-screen flex flex-col">
    <!-- 顶部工具栏 -->
    <editor-header
      :project-name="projectName"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @update:project-name="projectName = $event"
      @reset-view="resetView"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @undo="undo"
      @redo="redo"
      @export-sql="exportSQL"
      @export-image="exportImage"
      @export-json="exportJSON"
      @save="saveProject"
    />

    <!-- 主要内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧工具面板 -->
      <editor-toolbox @add-table="addTable" @add-note="addNote" @set-edge-type="setEdgeType" />

      <!-- 中间画布区域 -->
      <div class="flex-1 relative">
        <div ref="graphContainer" class="absolute inset-0 bg-gray-100"></div>
      </div>

      <!-- 右侧属性面板 -->
      <editor-properties
        :selected-cell="selectedCell"
        :table-props="tableProps"
        :edge-props="edgeProps"
        :data-types="dataTypes"
        @update-table="updateTable"
        @update-table-name="updateTableName"
        @update-table-comment="updateTableComment"
        @add-field="addField"
        @remove-field="removeField"
        @update-edge-type="updateEdgeType"
        @update-edge="updateEdge"
      />
    </div>

    <TableNodeContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Graph, Shape, Node, Cell } from '@antv/x6'
import EditorHeader from '../components/diagram/EditorHeader.vue'
import EditorToolbox from '../components/diagram/EditorToolbox.vue'
import EditorProperties from '../components/diagram/EditorProperties.vue'
import { ElMessage, Table } from 'element-plus'
import { createTableNode, createRelationEdge } from '../utils/diagramUtils'
import { register, getTeleport } from '@antv/x6-vue-shape'
import TableNode from '@/components/TableNode.vue'
import type { EdgeProperty, TableField } from '@/types/modelEditor'
import { dataTypes } from '@/constants'

// 注册自定义节点
register({
  shape: 'custom-vue-node',
  width: 100,
  height: 100,
  component: TableNode,
})
const TableNodeContainer = getTeleport()

// 定义属性
const props = defineProps<{
  id: string
}>()

// 初始化
const graphContainer = ref<HTMLElement | null>(null)
const graph = ref<Graph | null>(null)
const projectName = ref('未命名项目')
const selectedCell = ref<Cell | null>(null)
const canUndo = ref(false)
const canRedo = ref(false)
const currentEdgeType = ref('oneToMany')

const tableProps = reactive({
  id: '',
  name: '',
  comment: '',
  fields: [] as TableField[],
})

// 关系属性
const edgeProps: EdgeProperty = reactive({
  id: '',
  type: 'oneToMany',
  sourceField: '',
  targetField: '',
  comment: '',
})

// 初始化图表
onMounted(() => {
  if (graphContainer.value) {
    graph.value = new Graph({
      container: graphContainer.value,
      grid: {
        visible: true,
        type: 'dot',
        size: 10,
      },
      autoResize: true,
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'boundary',
        allowBlank: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#5F6368',
                strokeWidth: 2,
                targetMarker: {
                  name: 'classic',
                  size: 8,
                },
              },
            },
            router: {
              name: 'manhattan',
            },
            connector: {
              name: 'rounded',
              args: {
                radius: 8,
              },
            },
            zIndex: 0,
            data: {
              type: currentEdgeType.value,
              sourceField: '',
              targetField: '',
              comment: '',
            },
          })
        },
        validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet }) {
          if (sourceView === targetView) {
            return false
          }
          if (!sourceMagnet || !targetMagnet) {
            return false
          }
          return true
        },
      },
      highlighting: {
        magnetAvailable: {
          name: 'stroke',
          args: {
            padding: 4,
            attrs: {
              strokeWidth: 2,
              stroke: '#4F46E5',
            },
          },
        },
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
    })

    // 监听选择变化
    graph.value.on('cell:click', ({ cell }) => {
      selectedCell.value = cell

      if (cell.isNode()) {
        const data = cell.getData() || {}
        tableProps.id = cell.id as string
        tableProps.name = data.name || '未命名表'
        tableProps.comment = data.comment || ''
        tableProps.fields = [...(data.fields || [])]
      } else if (cell.isEdge()) {
        const data = cell.getData() || {}
        edgeProps.id = cell.id as string
        edgeProps.type = data.type || 'oneToMany'
        edgeProps.sourceField = data.sourceField || ''
        edgeProps.targetField = data.targetField || ''
        edgeProps.comment = data.comment || ''
      }
    })

    graph.value.on('blank:click', () => {
      selectedCell.value = null
    })

    // 监听历史状态变化
    graph.value.on('history:change', () => {
      canUndo.value = graph.value?.historyManager.canUndo() || false
      canRedo.value = graph.value?.historyManager.canRedo() || false
    })

    // 加载项目数据
    loadProject(props.id)
  }
})

// 加载项目数据
const loadProject = (id: string) => {
  if (id === '1') {
    projectName.value = '电商系统数据库'
    loadCommerceExample()
  } else if (id === '2') {
    projectName.value = '博客系统数据库'
    loadBlogExample()
  } else {
    projectName.value = '新建项目'
  }
}

// 加载电商系统示例
const loadCommerceExample = () => {
  if (!graph.value) return

  // 用户表
  const userTable = createTableNode({
    id: 'user-table',
    name: 'users',
    comment: '用户表',
    fields: [
      { name: 'id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'username', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'email', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'password', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'created_at', type: 'DATETIME', primaryKey: false, notNull: true },
    ],
    x: 100,
    y: 100,
  })

  // 商品表
  const productTable = createTableNode({
    id: 'product-table',
    name: 'products',
    comment: '商品表',
    fields: [
      { name: 'id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'name', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'price', type: 'DECIMAL', primaryKey: false, notNull: true },
      { name: 'description', type: 'TEXT', primaryKey: false, notNull: false },
      { name: 'stock', type: 'INT', primaryKey: false, notNull: true },
      { name: 'category_id', type: 'INT', primaryKey: false, notNull: true },
    ],
    x: 500,
    y: 100,
  })

  // 订单表
  const orderTable = createTableNode({
    id: 'order-table',
    name: 'orders',
    comment: '订单表',
    fields: [
      { name: 'id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'user_id', type: 'INT', primaryKey: false, notNull: true },
      { name: 'total_amount', type: 'DECIMAL', primaryKey: false, notNull: true },
      { name: 'status', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'created_at', type: 'DATETIME', primaryKey: false, notNull: true },
    ],
    x: 100,
    y: 400,
  })

  // 订单项表
  const orderItemTable = createTableNode({
    id: 'order-item-table',
    name: 'order_items',
    comment: '订单项表',
    fields: [
      { name: 'id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'order_id', type: 'INT', primaryKey: false, notNull: true },
      { name: 'product_id', type: 'INT', primaryKey: false, notNull: true },
      { name: 'quantity', type: 'INT', primaryKey: false, notNull: true },
      { name: 'price', type: 'DECIMAL', primaryKey: false, notNull: true },
    ],
    x: 500,
    y: 400,
  })

  // 添加关系
  const userOrderEdge = createRelationEdge({
    source: userTable.id,
    target: orderTable.id,
    type: 'oneToMany',
    sourceField: 'id',
    targetField: 'user_id',
    comment: '用户拥有多个订单',
  })

  const orderOrderItemEdge = createRelationEdge({
    source: orderTable.id,
    target: orderItemTable.id,
    type: 'oneToMany',
    sourceField: 'id',
    targetField: 'order_id',
    comment: '订单包含多个订单项',
  })

  const productOrderItemEdge = createRelationEdge({
    source: productTable.id,
    target: orderItemTable.id,
    type: 'oneToMany',
    sourceField: 'id',
    targetField: 'product_id',
    comment: '商品包含在多个订单项中',
  })

  graph.value.addNode(userTable)
  graph.value.addNode(productTable)
  graph.value.addNode(orderTable)
  graph.value.addNode(orderItemTable)

  graph.value.addEdge(userOrderEdge)
  graph.value.addEdge(orderOrderItemEdge)
  graph.value.addEdge(productOrderItemEdge)
}

// 加载博客系统示例
const loadBlogExample = () => {
  if (!graph.value) return

  // 用户表
  const userTable = createTableNode({
    id: 'user-table',
    name: 'users',
    comment: '用户表',
    fields: [
      { name: 'id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'username', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'email', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'password', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'created_at', type: 'DATETIME', primaryKey: false, notNull: true },
    ],
    x: 100,
    y: 100,
  })

  // 文章表
  const postTable = createTableNode({
    id: 'post-table',
    name: 'posts',
    comment: '文章表',
    fields: [
      { name: 'id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'title', type: 'VARCHAR', primaryKey: false, notNull: true },
      { name: 'content', type: 'TEXT', primaryKey: false, notNull: true },
      { name: 'user_id', type: 'INT', primaryKey: false, notNull: true },
      { name: 'created_at', type: 'DATETIME', primaryKey: false, notNull: true },
      { name: 'updated_at', type: 'DATETIME', primaryKey: false, notNull: true },
    ],
    x: 500,
    y: 100,
  })

  // 评论表
  const commentTable = createTableNode({
    id: 'comment-table',
    name: 'comments',
    comment: '评论表',
    fields: [
      { name: 'id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'content', type: 'TEXT', primaryKey: false, notNull: true },
      { name: 'user_id', type: 'INT', primaryKey: false, notNull: true },
      { name: 'post_id', type: 'INT', primaryKey: false, notNull: true },
      { name: 'created_at', type: 'DATETIME', primaryKey: false, notNull: true },
    ],
    x: 100,
    y: 400,
  })

  // 标签表
  const tagTable = createTableNode({
    id: 'tag-table',
    name: 'tags',
    comment: '标签表',
    fields: [
      { name: 'id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'name', type: 'VARCHAR', primaryKey: false, notNull: true },
    ],
    x: 500,
    y: 400,
  })

  // 文章标签关联表
  const postTagTable = createTableNode({
    id: 'post-tag-table',
    name: 'post_tags',
    comment: '文章标签关联表',
    fields: [
      { name: 'post_id', type: 'INT', primaryKey: true, notNull: true },
      { name: 'tag_id', type: 'INT', primaryKey: true, notNull: true },
    ],
    x: 300,
    y: 250,
  })

  // 添加关系
  const userPostEdge = createRelationEdge({
    source: userTable.id,
    target: postTable.id,
    type: 'oneToMany',
    sourceField: 'id',
    targetField: 'user_id',
    comment: '用户拥有多篇文章',
  })

  const userCommentEdge = createRelationEdge({
    source: userTable.id,
    target: commentTable.id,
    type: 'oneToMany',
    sourceField: 'id',
    targetField: 'user_id',
    comment: '用户发表多条评论',
  })

  const postCommentEdge = createRelationEdge({
    source: postTable.id,
    target: commentTable.id,
    type: 'oneToMany',
    sourceField: 'id',
    targetField: 'post_id',
    comment: '文章有多条评论',
  })

  const postPostTagEdge = createRelationEdge({
    source: postTable.id,
    target: postTagTable.id,
    type: 'oneToMany',
    sourceField: 'id',
    targetField: 'post_id',
    comment: '文章有多个标签',
  })

  const tagPostTagEdge = createRelationEdge({
    source: tagTable.id,
    target: postTagTable.id,
    type: 'oneToMany',
    sourceField: 'id',
    targetField: 'tag_id',
    comment: '标签属于多篇文章',
  })

  graph.value.addNode(userTable)
  graph.value.addNode(postTable)
  graph.value.addNode(commentTable)
  graph.value.addNode(tagTable)
  graph.value.addNode(postTagTable)

  graph.value.addEdge(userPostEdge)
  graph.value.addEdge(userCommentEdge)
  graph.value.addEdge(postCommentEdge)
  graph.value.addEdge(postPostTagEdge)
  graph.value.addEdge(tagPostTagEdge)
}

// 添加表
const addTable = () => {
  if (graph.value) {
    const id = `table-${Date.now()}`
    const pos = graph.value.clientToLocal(300, 200)

    const tableNode = createTableNode({
      id,
      name: '新建表',
      comment: '',
      fields: [{ name: 'id', type: 'INT', primaryKey: true, notNull: true }],
      x: pos.x,
      y: pos.y,
    })

    graph.value.addNode(tableNode)
    graph.value?.cleanSelection()
    graph.value?.select(tableNode)
  }
}

// 添加注释
const addNote = () => {
  if (graph.value) {
    const id = `note-${Date.now()}`
    const pos = graph.value.clientToLocal(300, 200)

    const noteNode = new Shape.HTML({
      id,
      x: pos.x,
      y: pos.y,
      width: 200,
      height: 100,
      html: `
        <div class="note-node bg-yellow-100 p-3 rounded-md shadow-md border border-yellow-200">
          <div class="text-gray-700">点击编辑注释</div>
        </div>
      `,
      data: {
        type: 'note',
        content: '点击编辑注释',
      },
    })

    graph.value?.addNode(noteNode)
    graph.value?.cleanSelection()
    graph.value?.select(noteNode)
  }
}

// 设置边类型
const setEdgeType = (type: string) => {
  currentEdgeType.value = type
  ElMessage.success(
    `已设置关系类型为: ${type === 'oneToOne' ? '一对一' : type === 'oneToMany' ? '一对多' : '多对多'}`,
  )
}

// 更新表
const updateTable = (data: TableField) => {
  if (graph.value && selectedCell.value && selectedCell.value.isNode()) {
    console.log(data, '<<<<< params data')
    selectedCell.value.setData(
      {
        // name: tableProps.name,
        // comment: tableProps.comment,
        // fields: tableProps.fields,
        ...data,
      },
      {
        deep: true,
        silent: false,
      },
    )

    // 更新表格视图
    const fields = tableProps.fields
    selectedCell.value.setProp('table', {
      ...selectedCell.value.getProp('table'),
      // name: tableProps.name,
      // comment: tableProps.comment,
      // fields: tableProps.fields,
      ...data,
    })

    selectedCell.value.resize(240, 40 + fields.length * 32)
  }
}

// 更新表名
const updateTableName = (data: TableField) => {
  console.log(data, '<<<<< upat data')
  updateTable(data)
}

// 更新表注释
const updateTableComment = (data: TableField) => {
  updateTable(data)
}

// 添加字段
const addField = () => {
  tableProps.fields.push({
    name: '新字段',
    type: 'VARCHAR',
    primaryKey: false,
    notNull: false,
  })
  updateTable(tableProps as unknown as TableField)
}

// 删除字段
const removeField = (index: number) => {
  tableProps.fields.splice(index, 1)
  updateTable(tableProps as unknown as TableField)
}

// 更新边类型
const updateEdgeType = () => {
  if (graph.value && selectedCell.value && selectedCell.value.isEdge()) {
    const edge = selectedCell.value

    edge.setData({
      ...edge.getData(),
      type: edgeProps.type,
    })

    // 更新边的标签
    const labelText =
      edgeProps.type === 'oneToOne' ? '1:1' : edgeProps.type === 'oneToMany' ? '1:N' : 'N:M'
    edge.setLabels([
      {
        attrs: {
          text: {
            text: labelText,
            fill: '#5F6368',
            fontSize: 12,
            textAnchor: 'middle',
            textVerticalAnchor: 'middle',
            pointerEvents: 'none',
          },
          rect: {
            fill: '#fff',
            stroke: '#5F6368',
            strokeWidth: 1,
            rx: 3,
            ry: 3,
          },
        },
        position: {
          distance: 0.5,
        },
      },
    ])

    // 更新边的标记
    let sourceMarker = {}
    let targetMarker = {}

    if (edgeProps.type === 'oneToOne') {
      sourceMarker = { name: 'circle', size: 6 }
      targetMarker = { name: 'circle', size: 6 }
    } else if (edgeProps.type === 'oneToMany') {
      sourceMarker = { name: 'circle', size: 6 }
      targetMarker = { name: 'classic', size: 8 }
    } else if (edgeProps.type === 'manyToMany') {
      sourceMarker = { name: 'classic', size: 8 }
      targetMarker = { name: 'classic', size: 8 }
    }

    edge.setAttrByPath('line/sourceMarker', sourceMarker)
    edge.setAttrByPath('line/targetMarker', targetMarker)
  }
}

// 更新边
const updateEdge = () => {
  if (graph.value && selectedCell.value && selectedCell.value.isEdge()) {
    selectedCell.value.setData({
      type: edgeProps.type,
      sourceField: edgeProps.sourceField,
      targetField: edgeProps.targetField,
      comment: edgeProps.comment,
    })
  }
}

// 重置视图
const resetView = () => {
  graph.value?.zoomTo(1)
  graph.value?.centerContent()
}

// 放大
const zoomIn = () => {
  const zoom = graph.value?.zoom() || 1
  graph.value?.zoomTo(Math.min(zoom + 0.1, 3))
}

// 缩小
const zoomOut = () => {
  const zoom = graph.value?.zoom() || 1
  graph.value?.zoomTo(Math.max(zoom - 0.1, 0.5))
}

// 撤销
const undo = () => {
  graph.value?.undo()
}

// 重做
const redo = () => {
  graph.value?.redo()
}

// 导出SQL
const exportSQL = () => {
  ElMessage.info('导出SQL功能开发中...')
}

// 导出图片
const exportImage = () => {
  ElMessage.info('导出图片功能开发中...')
}

// 导出JSON
const exportJSON = () => {
  ElMessage.info('导出JSON功能开发中...')
}

// 保存项目
const saveProject = () => {
  ElMessage.success('项目已保存')
}
</script>
