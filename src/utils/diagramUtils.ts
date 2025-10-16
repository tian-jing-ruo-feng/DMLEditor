import { Shape, Graph, Node, Edge } from '@antv/x6'
import type { TableField } from '@/types/modelEditor'
import { Selection } from '@antv/x6-plugin-selection'
import { History } from '@antv/x6-plugin-history'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Clipboard } from '@antv/x6-plugin-clipboard'
import { Keyboard } from '@antv/x6-plugin-keyboard'
import { useKeyBoard } from './keyboard'

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
        list: {
          markup: [
            // 自定义的port容器
            {
              tagName: 'foreignObject',
              selector: 'fo',
              style: {
                transform: 'none',
                // border: '1px solid #000',
              },
            },
          ],
          attrs: {
            fo: {
              width: 0,
              height: 0,
              magnet: true,
            },
          },
          position: [0, 37],
        },
        top: {
          position: 'top',
          attrs: {
            circle: {
              stroke: '#5F95FF',
              strokeWidth: 1,
              r: 4,
              magnet: true,
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              stroke: '#5F95FF',
              strokeWidth: 1,
              r: 4,
              magnet: true,
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              stroke: '#5F95FF',
              strokeWidth: 1,
              r: 4,
              magnet: true,
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              stroke: '#5F95FF',
              strokeWidth: 1,
              r: 4,
              magnet: true,
            },
          },
        },
      },
      items: [
        // {
        //   id: 'custom-port',
        //   group: 'list',
        // },
        {
          id: 'port-top',
          group: 'top',
          attrs: {
            circle: {
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        {
          id: 'port-right',
          group: 'right',
          attrs: {
            circle: {
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        {
          id: 'port-bottom',
          group: 'bottom',
          attrs: {
            circle: {
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
        {
          id: 'port-left',
          group: 'left',
          attrs: {
            circle: {
              style: {
                visibility: 'hidden',
              },
            },
          },
        },
      ],
    },
    data: {
      id,
      name,
      comment,
      fields,
    },
  } as Node.Properties
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

  const marker = {
    tagName: 'image',
    'xlink:href': '/ERtu-yiduiduo-3.png',
    width: 32,
    height: 32,
    x: -1,
    y: -16,
  }
  const tMarker = {
    tagName: 'image',
    'xlink:href': '/ERtu-yiduiduo-4.png',
    width: 32,
    height: 32,
    x: -1,
    y: -16,
  }
  if (type === 'oneToOne') {
    // sourceMarker = { name: 'circle', size: 6 }
    sourceMarker = { ...marker }
    targetMarker = { name: 'circle', size: 6 }
  } else if (type === 'oneToMany') {
    // sourceMarker = { name: 'circle', size: 6 }
    sourceMarker = { ...marker }

    // targetMarker = { name: 'classic', size: 8 }
    targetMarker = { ...tMarker }
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
  // Graph.registerPortLayout(
  //   'erPortPosition',
  //   (portsPositionArgs, elemBBox) => {
  //     console.log(portsPositionArgs, elemBBox, 'portsPositionArgs, elemBBox')
  //     return portsPositionArgs.map((_, index) => {
  //       return {
  //         position: {
  //           x: 0,
  //           y: elemBBox.height,
  //         },
  //         angle: 0,
  //       }
  //     })
  //   },
  //   true,
  // )
  // 注册自定义边起始箭头
  Graph.registerEdgeTool('circle-source-arrowhead', {
    inherit: 'source-arrowhead',
    tagName: 'circle',
    attrs: {
      r: 8,
      fill: '#fe854f',
      // 'fill-opacity': 0.3,
      stroke: '#fe854f',
      'stroke-width': 4,
      cursor: 'move',
    },
  })

  const graph = new Graph({
    container,
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#eee', // 主网格线颜色
          thickness: 1, // 主网格线宽度
        },
        {
          color: '#ddd', // 次网格线颜色
          thickness: 1, // 次网格线宽度
          factor: 4, // 主次网格线间隔
        },
      ],
    },
    panning: {
      enabled: true,
    },
    autoResize: true,
    connecting: {
      router: 'manhattan',
      allowBlank: false,
      // 锚点：设置再正交点
      // anchor: 'orth',
      // 使用boundary作为连接点
      connectionPoint: 'boundary',
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#5F6368',
              strokeWidth: 2,
              // sourceMarker: {
              //   tagName: 'image',
              //   'xlink:href': '/ERtu-yiduiduo-3.png',
              //   width: 32,
              //   height: 32,
              //   x: -8,
              //   y: -16,
              // },
              // targetMarker: {
              //   name: 'classic',
              //   size: 8,
              // },
              // targetMarker: {
              //   tagName: 'image',
              //   'xlink:href': '/ERtu-yiduiduo-3.png',
              //   width: 32,
              //   height: 32,
              //   x: -1,
              //   y: -16,
              // },
              // sourceMarker: {
              //   tagName: 'image',
              //   'xlink:href': '/ERtu-yiduiduo-3.png',
              //   width: 32,
              //   height: 32,
              //   x: -1,
              //   y: -16,
              // },
            },
          },
          connector: {
            name: 'rounded',
            args: {
              radius: 8,
            },
          },
          zIndex: -1,
          data: {
            type: currentEdgeType,
            sourceField: '',
            targetField: '',
            comment: '',
          },
        })
      },
      validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet }) {
        // 不允许自连
        if (sourceView === targetView) {
          return false
        }
        // if (!sourceMagnet || !targetMagnet) {
        //   return false
        // }
        return true
      },
    },
    highlighting: {
      magnetAvailable: {
        name: 'stroke',
        args: {
          padding: 0,
          attrs: {
            strokeWidth: 10,
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

  graph
    .use(
      new Selection({
        enabled: true,
        multiple: true,
        rubberband: true,
        movable: true,
        showNodeSelectionBox: true,
      }),
    )
    .use(
      new Snapline({
        enabled: true,
      }),
    )
    .use(
      new History({
        enabled: true,
      }),
    )
    .use(
      new Clipboard({
        enabled: true,
      }),
    )
    .use(
      new Keyboard({
        enabled: true,
      }),
    )

  useKeyBoard(graph)

  return graph
}

export function getTableNodeWidth() {
  return 240
}
