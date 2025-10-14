import { Graph, Cell, Node } from '@antv/x6'
import { Ref } from 'vue'
import type { EdgeProperty, TableField } from '@/types/modelEditor'
import emitter from '@/eventBus'

/**
 * 设置图表事件监听
 * @param graph 图表实例
 * @param selectedCell 选中的单元格引用
 * @param tableProps 表格属性
 * @param edgeProps 边属性
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
) => {
  console.log(graph.isSnaplineEnabled(), '对齐线是否启用')

  // 监听选择变化
  graph.on('cell:click', ({ cell }) => {
    // 测试
    // const markup = cell.getMarkup()
    // console.log(markup, '<<<<< markUp')

    emitter.emit('node:click')

    selectedCell.value?.removeTools()
    selectedCell.value = cell

    if (cell.isNode()) {
      const data = cell.getData() || {}
      tableProps.id = cell.id as string
      tableProps.name = data.name || '未命名表'
      tableProps.comment = data.comment || ''
      tableProps.fields = [...(data.fields || [])]
      // 添加边界工具
      // cell.addTools([
      //   {
      //     name: 'boundary',
      //     args: {
      //       padding: 5,
      //       attrs: {
      //         fill: '#7c68fc',
      //         stroke: '#333',
      //         'stroke-width': 1,
      //         'fill-opacity': 0.2,
      //       },
      //     },
      //   },
      // ])
    } else if (cell.isEdge()) {
      const data = cell.getData() || {}
      edgeProps.id = cell.id as string
      edgeProps.type = data.type || 'oneToMany'
      edgeProps.sourceField = data.sourceField || ''
      edgeProps.targetField = data.targetField || ''
      edgeProps.comment = data.comment || ''
    }
  })

  graph.on('cell:mouseenter', ({ cell }) => {
    cell.addTools({
      name: 'button-remove',
    })
  })

  graph.on('cell:mouseleave', ({ cell }) => {
    if (cell.hasTool('button-remove')) {
      cell.removeTool('button-remove')
    }
  })

  graph.on('node:mouseenter', ({ node }) => {
    const size = node.size()
    // 悬浮设置port 大小
    node.setPortProp('custom-port', {
      attrs: {
        fo: {
          width: size.width,
          height: size.height - 37,
        },
      },
    })
  })

  graph.on('node:mouseleave', ({ node }) => {})

  // 点击空白区域取消选择
  graph.on('blank:click', () => {
    emitter.emit('blank:click')
    selectedCell.value?.removeTools()
    selectedCell.value = null
  })

  // 监听历史状态变化
  graph.on('history:change', () => {
    // alert('历史状态变化')
  })
}
