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
    <el-splitter class="flex-1 flex overflow-hidden" lazy>
      <!-- 左侧工具面板 -->
      <el-splitter-panel size="256" collapsible>
        <editor-toolbox @add-table="addTable" @add-note="addNote" @set-edge-type="setEdgeType" />
      </el-splitter-panel>
      <!-- 中间画布区域 -->
      <el-splitter-panel collapsible resizable>
        <div ref="graphContainer"></div>
      </el-splitter-panel>
      <!-- 右侧属性面板 -->
      <el-splitter-panel :size="propertyPanelSize" collapsible>
        <editor-properties
          :selected-cell="selectedCell!"
          :table-props="tableProps"
          :edge-props="edgeProps"
          :data-types="dataTypes"
          @update-edge-type="updateEdgeType"
          @update-edge="updateEdge"
        />
      </el-splitter-panel>
    </el-splitter>

    <TableNodeContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, Ref, computed } from 'vue'
import { Graph, Shape, Cell, Util } from '@antv/x6'
import { register, getTeleport } from '@antv/x6-vue-shape'
import { ElMessage } from 'element-plus'
import { createTableNode, createRelationEdge, initializeGraph } from '../utils/diagramUtils'
import { setupGraphEventHandlers } from '../utils/eventHandler'
import { dataTypes } from '@/constants'
import { generateSQL } from '@/utils/sqlGenerator'
import type { EdgeProperty, TableField } from '@/types/modelEditor'
import { type Project, projectService } from '@/utils/indexDB'
import emitter from '@/eventBus'
import TableNode from '@/components/TableNode.vue'
import EditorProperties from '../components/diagram/EditorProperties.vue'
import EditorHeader from '../components/diagram/EditorHeader.vue'
import EditorToolbox from '../components/diagram/EditorToolbox.vue'

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

const curProject = ref<Project>()
/** 右侧属性面板大小 */
const propertyPanelSize = ref(0)
/** 事件监听 */
emitter.on('node:click', () => {
  propertyPanelSize.value = 467
})
emitter.on('blank:click', () => {
  propertyPanelSize.value = 0
})

// 初始化
const graphContainer = ref<HTMLElement | null>(null)
const graph = ref<Graph | null>(null)
const projectName = ref('未命名项目')
const selectedCell = ref<Cell>()
const canUndo = computed(() => graph.value?.canUndo())
const canRedo = computed(() => graph.value?.canRedo())
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
    graph.value = initializeGraph(graphContainer.value, currentEdgeType.value)

    // 设置图表事件监听
    if (graph.value) {
      setupGraphEventHandlers(
        graph.value as Graph,
        selectedCell as Ref<Cell>,
        tableProps,
        edgeProps,
      )
    }

    // 加载项目数据
    loadProject(props.id)
  }
})

// 加载项目数据
const loadProject = async (id: string) => {
  const [, project] = await projectService.getProjectById(Number(id))
  if (project) {
    curProject.value = project
    projectName.value = project.name
    const content = JSON.parse(project.content!)
    console.log(content, '<<<<< 画布数据')
    graph.value?.fromJSON(content)
  }
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
  }
}

// 添加注释
const addNote = () => {
  if (graph.value) {
    Shape.HTML.register({
      shape: 'custom-html',
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
    const pos = graph.value.clientToLocal(300, 200)
    graph.value?.addNode({
      shape: 'custom-html',
      x: pos.x,
      y: pos.y,
    })
  }
}

// 设置边类型
const setEdgeType = (type: string) => {
  currentEdgeType.value = type
  ElMessage.success(
    `已设置关系类型为: ${type === 'oneToOne' ? '一对一' : type === 'oneToMany' ? '一对多' : '多对多'}`,
  )
}

// 更新边类型
const updateEdgeType = (type: string) => {
  if (graph.value && selectedCell.value && selectedCell.value.isEdge()) {
    const edge = selectedCell.value
    edge.updateData({
      type,
    })
    // edge.setData({
    //   ...edge.getData(),
    //   // type: edgeProps.type,
    // })

    // 更新边的标签
    const labelText = type === 'oneToOne' ? '1:1' : type === 'oneToMany' ? '1:N' : 'N:M'
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

    if (type === 'oneToOne') {
      sourceMarker = { name: 'circle', size: 6 }
      // sourceMarker = {
      //   tagName: 'image',
      //   'xlink:href': '/ERtu-yiduiduo-4.png',
      //   width: 32,
      //   height: 32,
      //   x: 0,
      //   y: -16,
      // }
      // targetMarker = { name: 'circle', size: 6 }
      targetMarker = {
        tagName: 'path',
        fill: 'yellow', // 使用自定义填充色
        stroke: 'green', // 使用自定义边框色
        strokeWidth: 2,
        d: 'M 20 -10 0 0 20 10 Z',
      }
    } else if (type === 'oneToMany') {
      sourceMarker = { name: 'circle', size: 6 }
      targetMarker = { name: 'classic', size: 8 }
    } else if (type === 'manyToMany') {
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
  const sql = generateSQL({
    dbType: 'mysql',
    includeComments: true,
    includeDropStatements: false,
  })
  console.log(sql, '<<<< export sql')
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
const saveProject = async () => {
  const [, res] = await projectService.updateProject(Number(props.id), {
    content: JSON.stringify(graph.value?.toJSON()),
  })
  if (res) {
    ElMessage.success('项目已保存')
  }
}
</script>
