<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">数据库建模工具</h1>
        <el-button type="primary" @click="createNewProject">创建新项目</el-button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.id"
          class="card hover:shadow-lg transition-shadow duration-300"
        >
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold text-gray-700">{{ project.name }}</h2>
            <el-dropdown>
              <span class="el-dropdown-link cursor-pointer">
                <el-icon>
                  <more />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="openProject(project.id)">打开</el-dropdown-item>
                  <el-dropdown-item @click="duplicateProject(project.id)">复制</el-dropdown-item>
                  <el-dropdown-item @click="exportProject(project.id)">导出</el-dropdown-item>
                  <el-dropdown-item divided @click="deleteProject(project.id)" class="text-red-500"
                    >删除</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <p class="text-gray-500 mb-4">{{ project.description }}</p>
          <div class="flex justify-between items-center text-xs text-gray-400">
            <span>创建于: {{ project.createdAt }}</span>
            <span v-if="project.updatedAt">修改于: {{ project.updatedAt }}</span>
          </div>
          <div class="mt-4">
            <el-button type="primary" plain @click="openProject(project.id)">打开项目</el-button>
          </div>
        </div>

        <!-- 空项目卡片 -->
        <div
          v-if="projects.length === 0"
          class="card flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer"
          @click="createNewProject"
        >
          <el-icon class="text-4xl text-gray-400 mb-2">
            <plus />
          </el-icon>
          <p class="text-gray-500">创建新项目</p>
        </div>
      </div>

      <!-- 新建项目对话框 -->
      <el-dialog v-model="dialogVisible" title="创建新项目" width="500px">
        <el-form :model="newProject" label-position="top">
          <el-form-item label="项目名称" required>
            <el-input v-model="newProject.name" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="项目描述">
            <el-input
              v-model="newProject.description"
              type="textarea"
              placeholder="请输入项目描述"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveNewProject">创建</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </MainLayout>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, More } from '@element-plus/icons-vue'
import { v4 as uuidv4 } from 'uuid'
import { dayjs, ElMessage } from 'element-plus'
import { useProjectsStore, type Project } from '@/stores/userProjectsStore'
import { storeToRefs } from 'pinia'
import MainLayout from '@/layouts/MainLayout.vue'

const router = useRouter()
const projectsStore = useProjectsStore()
const { projects } = storeToRefs(projectsStore)
const { addProject, removeProject, getProjectById } = projectsStore

const dialogVisible = ref(false)
const newProject = reactive<Project>({
  id: '',
  name: '',
  description: '',
  createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  updatedAt: '',
})

const createNewProject = () => {
  dialogVisible.value = true
  Object.assign(newProject, {
    id: uuidv4(),
    name: '',
    description: '',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: '',
  })
}

const saveNewProject = () => {
  if (!newProject.name.trim()) {
    ElMessage.warning('项目名称不能为空')
    return
  }
  addProject(newProject)
  dialogVisible.value = false
  ElMessage.success('项目创建成功')

  // 创建后直接打开项目
  router.push(`/editor/${newProject.id}`)
}

const openProject = (id: string) => {
  router.push(`/editor/${id}`)
}

const duplicateProject = (id: string) => {
  const project = getProjectById(id)
  if (project) {
    const newId = Date.now().toString()
    const duplicated: Project = {
      ...project,
      id: uuidv4(),
      name: `${project.name} (副本)`,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: '',
    }
    addProject(duplicated)
    ElMessage.success('项目复制成功')
  }
}

const exportProject = (id: string) => {
  ElMessage.info('导出功能开发中...')
}

const deleteProject = (id: string) => {
  removeProject(id)
  ElMessage.success('项目删除成功')
}
</script>
