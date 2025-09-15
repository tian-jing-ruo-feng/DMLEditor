import { defineStore } from 'pinia'
import { Graph } from '@antv/x6'
import { ref } from 'vue'

export const useDiagramStore = defineStore('diagram', () => {
  const graph = ref<Graph | null>(null)
  const selectedNode = ref<any>(null)
  const selectedEdge = ref<any>(null)
  const zoom = ref(1)
  const projectName = ref('Untitled Project')
  const tables = ref<
    Array<{
      id: string
      name: string
      comment?: string
      fields: Array<{
        name: string
        type: string
        primaryKey: boolean
        notNull: boolean
      }>
      x: number
      y: number
    }>
  >([])
  const relations = ref<
    Array<{
      source: string
      target: string
      type: string
      sourceField: string
      targetField: string
      comment?: string
    }>
  >([])

  function setGraph(instance: Graph) {
    graph.value = instance
  }

  function addTable(table: {
    name: string
    comment?: string
    fields: Array<{
      name: string
      type: string
      primaryKey: boolean
      notNull: boolean
    }>
    x: number
    y: number
  }) {
    const id = `table-${Date.now()}`
    tables.value.push({
      id,
      ...table,
    })
    return id
  }

  function updateTable(
    id: string,
    table: {
      name: string
      comment?: string
      fields: Array<{
        name: string
        type: string
        primaryKey: boolean
        notNull: boolean
      }>
    },
  ) {
    const index = tables.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tables.value[index] = {
        ...tables.value[index],
        ...table,
      }
    }
  }

  function removeTable(id: string) {
    tables.value = tables.value.filter((t) => t.id !== id)
    relations.value = relations.value.filter((r) => r.source !== id && r.target !== id)
  }

  function addRelation(relation: {
    source: string
    target: string
    type: string
    sourceField: string
    targetField: string
    comment?: string
  }) {
    relations.value.push(relation)
  }

  function removeRelation(index: number) {
    relations.value.splice(index, 1)
  }

  function setSelectedNode(node: any) {
    selectedNode.value = node
  }

  function setSelectedEdge(edge: any) {
    selectedEdge.value = edge
  }

  function setZoom(value: number) {
    zoom.value = value
  }

  function setProjectName(name: string) {
    projectName.value = name
  }

  function reset() {
    graph.value = null
    selectedNode.value = null
    selectedEdge.value = null
    zoom.value = 1
    projectName.value = 'Untitled Project'
    tables.value = []
    relations.value = []
  }

  return {
    graph,
    selectedNode,
    selectedEdge,
    zoom,
    projectName,
    tables,
    relations,
    setGraph,
    addTable,
    updateTable,
    removeTable,
    addRelation,
    removeRelation,
    setSelectedNode,
    setSelectedEdge,
    setZoom,
    setProjectName,
    reset,
  }
})
