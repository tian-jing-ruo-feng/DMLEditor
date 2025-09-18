import { Shape, Graph } from '@antv/x6'
import type { TableField } from '@/types/modelEditor'
import { Selection } from '@antv/x6-plugin-selection'
import { History } from '@antv/x6-plugin-history'

/**
 * 创建表节点
 */
export const createTableNode = ({
  id,
  name,
  comment,
  fields,
  x,
  y,
}: {
  id: string
  name: string
  comment?: string
  fields: Array<TableField>
  x: number
  y: number
}) => {
  return {
    id,
    x,
    y,
    // width/height 可选属性
    // width: getTableNodeWidth(),
    // height: getTableNodeHeight(fields),
    shape: 'custom-vue-node',
    props: {
      table: {
        id,
        name,
        comment,
        fields,
        x,
        y,
      },
    },
    ports: {
      groups: {
        in: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F6368',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        out: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#5F6368',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { id: 'port-left', group: 'in' },
        { id: 'port-right', group: 'out' },
      ],
    },
    data: {
      id,
      name,
      comment,
      fields,
    },
  }
}

/**
 * 创建关系边
 */
export const createRelationEdge = ({
  source,
  target,
  type,
  sourceField,
  targetField,
  comment,
}: {
  source: string
  target: string
  type: string
  sourceField: string
  targetField: string
  comment?: string
}) => {
  let sourceMarker = {}
  let targetMarker = {}

  if (type === 'oneToOne') {
    sourceMarker = { name: 'circle', size: 6 }
    targetMarker = { name: 'circle', size: 6 }
  } else if (type === 'oneToMany') {
    sourceMarker = { name: 'circle', size: 6 }
    targetMarker = { name: 'classic', size: 8 }
  } else if (type === 'manyToMany') {
    sourceMarker = { name: 'classic', size: 8 }
    targetMarker = { name: 'classic', size: 8 }
  }

  return new Shape.Edge({
    source: { cell: source, port: 'port-right' },
    target: { cell: target, port: 'port-left' },
    attrs: {
      line: {
        stroke: '#5F6368',
        strokeWidth: 2,
        sourceMarker,
        targetMarker,
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
    labels: [
      {
        attrs: {
          text: {
            text: type === 'oneToOne' ? '1:1' : type === 'oneToMany' ? '1:N' : 'N:M',
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
    ],
    zIndex: 0,
    data: {
      type,
      sourceField,
      targetField,
      comment,
    },
  })
}

/**
 * 初始化图表
 * @param container 图表容器元素
 * @param currentEdgeType 当前边类型
 * @returns 初始化后的图表实例
 */
export const initializeGraph = (container: HTMLElement, currentEdgeType: string = 'oneToMany') => {
  const graph = new Graph({
    container,
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
            type: currentEdgeType,
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

  graph.use(
    new Selection({
      enabled: true,
      multiple: true,
      rubberband: true,
      movable: true,
      showNodeSelectionBox: true,
    }),
    new History({
      enabled: true,
    }),
  )

  return graph
}

export function getTableNodeWidth() {
  return 240
}
