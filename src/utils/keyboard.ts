import { Graph } from '@antv/x6'

// 复制
export const useKeyBoard = (graph: Graph) => {
  graph.bindKey(['ctrl+c', 'cmd+c'], () => {
    const cells = graph.getSelectedCells()
    if (cells.length) {
      graph.copy(cells)
    }
    return false
  })

  // 粘贴
  graph.bindKey(['ctrl+v', 'cmd+v'], () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 32 })
      graph.cleanSelection()
      graph.select(cells)
    }
    return false
  })

  // 撤销
  graph.bindKey(['ctrl+z', 'cmd+z'], () => {
    graph.undo()
  })

  // 重做
  graph.bindKey(['ctrl+y', 'cmd+y'], () => {
    graph.redo()
  })
}
