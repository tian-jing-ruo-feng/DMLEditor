import { Shape } from '@antv/x6'
import type { TableField } from '@/types/modelEditor'

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
    width: 240,
    height: 40 + fields.length * 32,
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
