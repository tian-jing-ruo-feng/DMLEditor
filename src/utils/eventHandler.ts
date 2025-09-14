import { Graph, Cell } from '@antv/x6'
import { Ref } from 'vue'
import type { EdgeProperty, TableField } from '@/types/modelEditor'

/**
 * 设置图表事件监听
 * @param graph 图表实例
 * @param selectedCell 选中的单元格引用
 * @param tableProps 表格属性
 * @param edgeProps 边属性
 * @param canUndo 是否可撤销
 * @param canRedo 是否可重做
 */
export const setupGraphEventHandlers = (
  graph: Graph,
  selectedCell: Ref<Cell | null>,
  tableProps: {
    id: string
    name: string
    comment: string
    fields: TableField[]
  },
  edgeProps: EdgeProperty,
  canUndo: Ref<boolean>,
  canRedo: Ref<boolean>,
) => {
  // 监听选择变化
  graph.on('cell:click', ({ cell }) => {
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

  // 点击空白区域取消选择
  graph.on('blank:click', () => {
    selectedCell.value = null
  })

  // 监听历史状态变化
  graph.on('history:change', () => {
    canUndo.value = true
    canRedo.value = true
  })
}
