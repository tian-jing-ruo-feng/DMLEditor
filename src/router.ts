import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import ProjectList from './pages/ProjectList.vue'
import ModelEditor from './pages/ModelEditor.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: ProjectList,
  },
  {
    path: '/editor/:id',
    name: 'ModelEditor',
    component: ModelEditor,
    props: true,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
