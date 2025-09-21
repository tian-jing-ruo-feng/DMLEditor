import Dexie, { EntityTable } from 'dexie'
import { dayjs, ElMessage } from 'element-plus'

// 定义返回结果类型
export type Result<T> = Promise<[Error | null, T | null]>

// 定义项目数据接口
export interface Project {
  id?: number // 可选，因为新建时可能没有ID
  name: string
  description?: string
  createdAt: string
  updatedAt?: string
  content?: string // 项目内容，可能是JSON字符串
  thumbnail?: string // 项目缩略图，可能是base64或URL
  lastOpenedAt?: string // 最后打开时间
  tags?: string[] // 项目标签
  isTemplate?: boolean // 是否为模板
  version?: number // 版本号
}

// 定义数据库类
class DMLEditorDatabase extends Dexie {
  // 定义表
  projects!: EntityTable<Project, 'id'> // number是主键类型

  constructor() {
    super('DMLEditorDatabase')

    // 定义数据库结构
    this.version(1).stores({
      projects: '++id, name, createdAt, updatedAt, isTemplate, tags', // ++id表示自增主键
      diagramElements: '++id, projectId, elementId, type, createdAt', // 图表元素表
    })
  }
}

// 创建数据库实例
const db = new DMLEditorDatabase()

// 项目操作服务
export const projectService = {
  /**
   * 获取所有项目
   */
  async getAllProjects(): Result<Project[]> {
    try {
      const projects = await db.projects.toArray()
      return [null, projects]
    } catch (error) {
      console.error('获取所有项目失败:', error)
      ElMessage.error('获取项目列表失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 根据ID获取项目
   */
  async getProjectById(id: number): Result<Project | undefined> {
    try {
      const project = await db.projects.get(id)
      return [null, project]
    } catch (error) {
      console.error(`获取项目(ID: ${id})失败:`, error)
      ElMessage.error('获取项目详情失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 添加新项目
   */
  async addProject(project: Omit<Project, 'id'>): Result<number> {
    try {
      const id = await db.projects.add(project)
      if (id === undefined) {
        throw new Error('添加项目失败: ID 未定义')
      }
      return [null, id]
    } catch (error) {
      console.error('添加项目失败:', error)
      ElMessage.error('添加项目失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 更新项目
   */
  async updateProject(id: number, changes: Partial<Project>): Result<number> {
    try {
      // 确保更新时间被设置
      changes.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const updateCount = await db.projects.update(id, changes)
      if (updateCount === 0) {
        throw new Error(`更新项目失败: 未找到ID为 ${id} 的项目`)
      }
      return [null, updateCount]
    } catch (error) {
      console.error(`更新项目(ID: ${id})失败:`, error)
      ElMessage.error('更新项目失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 删除项目
   */
  async deleteProject(id: number): Result<void> {
    try {
      // 事务：删除项目及其关联的所有图表元素
      await db.transaction('rw', [db.projects, db.diagramElements], async () => {
        // 先删除关联的图表元素
        await db.diagramElements.where('projectId').equals(id).delete()
        // 再删除项目
        const deleteCount = await db.projects.delete(id)
        if (deleteCount === 0) {
          throw new Error(`删除项目失败: 未找到ID为 ${id} 的项目`)
        }
      })
      return [null, undefined]
    } catch (error) {
      console.error(`删除项目(ID: ${id})失败:`, error)
      ElMessage.error('删除项目失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 搜索项目
   */
  async searchProjects(query: string): Result<Project[]> {
    try {
      const projects = await db.projects
        .filter(
          (project) =>
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            (project.description?.toLowerCase().includes(query.toLowerCase()) ?? false),
        )
        .toArray()
      return [null, projects]
    } catch (error) {
      console.error('搜索项目失败:', error)
      ElMessage.error('搜索项目失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 按更新时间排序获取项目
   */
  async getProjectsSortedByUpdated(ascending: boolean = false): Result<Project[]> {
    try {
      const collection = db.projects.orderBy('updatedAt')
      const projects = ascending ? await collection.toArray() : await collection.reverse().toArray()
      return [null, projects]
    } catch (error) {
      console.error('获取排序项目列表失败:', error)
      ElMessage.error('获取项目列表失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 获取最近打开的项目
   */
  async getRecentProjects(limit: number = 5): Result<Project[]> {
    try {
      const projects = await db.projects.orderBy('lastOpenedAt').reverse().limit(limit).toArray()
      return [null, projects]
    } catch (error) {
      console.error('获取最近项目失败:', error)
      ElMessage.error('获取最近项目失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 更新项目最后打开时间
   */
  async updateLastOpenedTime(id: number): Result<number> {
    try {
      const updateCount = await db.projects.update(id, {
        lastOpenedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      })
      if (updateCount === 0) {
        throw new Error(`更新项目打开时间失败: 未找到ID为 ${id} 的项目`)
      }
      return [null, updateCount]
    } catch (error) {
      console.error(`更新项目(ID: ${id})打开时间失败:`, error)
      ElMessage.error('更新项目状态失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 获取模板项目
   */
  async getTemplates(): Result<Project[]> {
    try {
      const templates = await db.projects.where('isTemplate').equals(1).toArray()
      return [null, templates]
    } catch (error) {
      console.error('获取模板项目失败:', error)
      ElMessage.error('获取模板列表失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 从模板创建项目
   */
  async createFromTemplate(templateId: number, newName: string): Result<number> {
    try {
      const template = await db.projects.get(templateId)
      if (!template) {
        throw new Error('未找到模板')
      }

      // 创建新项目，复制模板内容
      const newProject: Omit<Project, 'id'> = {
        name: newName,
        description: template.description,
        content: template.content,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isTemplate: false,
        tags: template.tags,
        version: 1,
      }

      // 添加新项目
      const [error, newProjectId] = await this.addProject(newProject)
      if (error || newProjectId === null) {
        throw error || new Error('从模板创建项目失败')
      }

      // 如果有图表元素，也复制它们
      const templateElements = await db.diagramElements
        .where('projectId')
        .equals(templateId)
        .toArray()

      if (templateElements.length > 0) {
        const newElements = templateElements.map((el) => ({
          projectId: newProjectId,
          elementId: el.elementId,
          type: el.type,
          data: el.data,
          position: el.position,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }))

        await db.diagramElements.bulkAdd(newElements)
      }

      return [null, newProjectId]
    } catch (error) {
      console.error(`从模板(ID: ${templateId})创建项目失败:`, error)
      ElMessage.error('从模板创建项目失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 按标签筛选项目
   */
  async getProjectsByTag(tag: string): Result<Project[]> {
    try {
      const projects = await db.projects
        .filter((project) => project.tags?.includes(tag) ?? false)
        .toArray()
      return [null, projects]
    } catch (error) {
      console.error(`按标签(${tag})筛选项目失败:`, error)
      ElMessage.error('按标签筛选项目失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 清空所有项目数据
   */
  async clearAllProjects(): Result<void> {
    try {
      await db.transaction('rw', [db.projects, db.diagramElements], async () => {
        await db.diagramElements.clear()
        await db.projects.clear()
      })
      return [null, undefined]
    } catch (error) {
      console.error('清空所有项目数据失败:', error)
      ElMessage.error('清空项目数据失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 导出项目数据
   */
  async exportProject(id: number): Result<string> {
    try {
      const project = await db.projects.get(id)
      if (!project) {
        throw new Error('未找到项目')
      }

      const elements = await db.diagramElements.where('projectId').equals(id).toArray()

      const exportData = {
        project,
        elements,
        exportedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      }

      return [null, JSON.stringify(exportData)]
    } catch (error) {
      console.error(`导出项目(ID: ${id})数据失败:`, error)
      ElMessage.error('导出项目数据失败')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },

  /**
   * 导入项目数据
   */
  async importProject(jsonData: string): Result<number> {
    try {
      const importData = JSON.parse(jsonData)
      const { project, elements } = importData

      // 移除ID，以便创建新项目
      const { id, ...projectData } = project
      projectData.createdAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
      projectData.updatedAt = projectData.createdAt
      projectData.name = `${projectData.name} (导入)`

      // 添加项目
      const [error, newProjectId] = await this.addProject(projectData)
      if (error || newProjectId === null) {
        throw error || new Error('导入项目失败')
      }

      // 添加图表元素
      if (elements && elements.length > 0) {
        const newElements = elements.map((el: any) => ({
          projectId: newProjectId,
          elementId: el.elementId,
          type: el.type,
          data: el.data,
          position: el.position,
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        }))

        await db.diagramElements.bulkAdd(newElements)
      }

      return [null, newProjectId]
    } catch (error) {
      console.error('导入项目失败:', error)
      ElMessage.error('导入项目数据格式错误')
      return [error instanceof Error ? error : new Error(String(error)), null]
    }
  },
}

// 数据库初始化函数
export async function initDatabase(): Result<void> {
  try {
    console.log('数据库初始化成功')
    return [null, undefined]
  } catch (error) {
    console.error('数据库初始化失败:', error)
    ElMessage.error('数据库初始化失败')
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}

// 导出数据库实例，以便在需要时可以直接访问
export default db
