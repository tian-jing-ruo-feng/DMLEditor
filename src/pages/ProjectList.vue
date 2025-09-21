<template>
  <MainLayout>
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">数据库建模工具</h1>
        <div class="flex gap-2">
          <input
            type="file"
            id="import-project"
            accept=".json"
            class="hidden"
            @change="importProject"
          />
          <label for="import-project" class="cursor-pointer">
            <el-button>导入项目</el-button>
          </label>
          <el-button type="primary" @click="createNewProject">创建新项目</el-button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.id as number"
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
                  <el-dropdown-item @click="openProject(project.id as number)"
                    >打开</el-dropdown-item
                  >
                  <el-dropdown-item @click="duplicateProject(project.id as number)"
                    >复制</el-dropdown-item
                  >
                  <el-dropdown-item @click="exportProject(project.id as number)"
                    >导出</el-dropdown-item
                  >
                  <el-dropdown-item
                    divided
                    @click="deleteProject(project.id as number)"
                    class="text-red-500"
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
            <el-button type="primary" plain @click="openProject(project.id as number)"
              >打开项目</el-button
            >
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
        <el-form ref="projectForm" :model="newProject" :rules="rules" label-position="top">
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
import { ref, reactive, onMounted, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, More } from '@element-plus/icons-vue'
import { dayjs, ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import MainLayout from '@/layouts/MainLayout.vue'
import { projectService, initDatabase, type Project } from '@/utils/indexDB'
import { omit } from 'es-toolkit'

const router = useRouter()
const projects = ref<Project[]>([])
const dialogVisible = ref(false)
const projectForm = useTemplateRef<FormInstance>('projectForm')
const newProject = reactive<Project>({
  name: '',
  description: '',
  createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
})
const rules = [
  {
    name: {
      required: true,
      message: '请输入项目名称',
      trigger: 'blur',
    },
  },
]

// 初始化数据库并加载项目
onMounted(async () => {
  try {
    await initDatabase()
    await loadProjects()
  } catch (error) {
    console.error('初始化数据库失败:', error)
    ElMessage.error('加载项目列表失败')
  }
})

// 加载项目列表
const loadProjects = async () => {
  const [error, projectList] = await projectService.getAllProjects()
  if (error) {
    console.error('加载项目失败:', error)
    ElMessage.error('加载项目列表失败')
    return
  }
  projects.value = projectList || []
}

const createNewProject = () => {
  dialogVisible.value = true
  Object.assign(newProject, {
    name: '',
    description: '',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  })
}

const saveNewProject = async () => {
  projectForm.value?.validate(async (validate) => {
    if (validate) {
      const [error, projectId] = await projectService.addProject({
        ...newProject,
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isTemplate: false,
        tags: [],
        content: JSON.stringify({}),
      })
      if (error || !projectId) {
        ElMessage.error('创建项目失败')
        return
      }

      dialogVisible.value = false
      ElMessage.success('项目创建成功')

      // 创建后直接打开项目
      router.push(`/editor/${projectId}`)
    }
  })
}

const openProject = async (id: number) => {
  const [error] = await projectService.updateLastOpenedTime(id)
  if (error) {
    console.error('更新项目打开时间失败:', error)
    // 仍然允许打开项目，只是不显示错误
  }
  router.push(`/editor/${id}`)
}

const duplicateProject = async (id: number) => {
  const [error, project] = await projectService.getProjectById(id)
  if (error || !project) {
    ElMessage.error('获取项目失败')
    return
  }

  const duplicated: Omit<Project, 'id'> = {
    ...omit(project, ['id']),
    name: `${project.name} (副本)`,
  }

  const [addError] = await projectService.addProject(duplicated)
  if (addError) {
    ElMessage.error('复制项目失败')
    return
  }

  ElMessage.success('项目复制成功')
  loadProjects() // 重新加载项目列表
}

const exportProject = async (id: number) => {
  const [error, jsonData] = await projectService.exportProject(id)
  if (error || !jsonData) {
    ElMessage.error('导出项目失败')
    return
  }

  // 创建下载链接
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const [projectError, project] = await projectService.getProjectById(id)
  a.href = url
  a.download = `${project?.name || 'project'}_export_${dayjs().format('YYYYMMDD_HHmmss')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('项目导出成功')
}

const deleteProject = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除此项目吗？此操作不可恢复。', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const [error] = await projectService.deleteProject(id)
    if (error) {
      ElMessage.error('删除项目失败')
      return
    }

    ElMessage.success('项目删除成功')
    loadProjects() // 重新加载项目列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除项目失败')
    }
  }
}

// 导入项目
const importProject = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  const reader = new FileReader()

  reader.onload = async (e) => {
    const jsonData = e.target?.result as string
    const [error] = await projectService.importProject(jsonData)
    if (error) {
      console.error('导入项目失败:', error)
      ElMessage.error('导入项目失败，请检查文件格式')
      return
    }

    ElMessage.success('项目导入成功')
    await loadProjects() // 重新加载项目列表
  }

  reader.readAsText(file)
  // 重置input，以便可以重复导入同一个文件
  input.value = ''
}
</script>
