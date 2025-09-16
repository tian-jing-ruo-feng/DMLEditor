import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

const mockProjects = [
  {
    id: '1',
    name: '电商系统数据库',
    description: '包含用户、商品、订单、支付等模块的数据库设计',
    createdAt: '2025-06-01 00:00:00',
    updatedAt: '',
  },
  {
    id: '2',
    name: '博客系统数据库',
    description: '包含用户、文章、评论、标签等模块的数据库设计',
    createdAt: '2025-07-20 00:00:00',
    updatedAt: '2025-08-25 00:00:00',
  },
]

export const useProjectsStore = defineStore(
  'projects',
  () => {
    const projects = ref<Array<Project>>(mockProjects)

    function addProject(project: Project) {
      projects.value.push(project)
    }

    function removeProject(id: string) {
      projects.value = projects.value.filter((project) => project.id !== id)
    }

    function getProjectById(id: string) {
      return projects.value.find((project) => project.id === id)
    }

    return { projects, addProject, removeProject, getProjectById }
  },
  {
    persist: true,
  },
)
