// 表属性
export interface TableField {
  name: string
  type: string
  length?: number
  primaryKey: boolean
  notNull: boolean
  defaultValue?: string
  comment?: string
}

// 边属性
export interface EdgeProperty {
  id: string
  type: string
  sourceField: string
  targetField: string
  comment: string
}
