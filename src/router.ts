import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import ProjectList from './pages/ProjectList.vue'
import ModelEditor from './pages/ModelEditor.vue'
import App from './App.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: App,
    children: [
      {
        alias: '/',
        path: '/project-list',
        name: 'ProjectList',
        component: ProjectList,
      },
    ],
  },
  {
    path: '/editor/:id',
    name: 'ModelEditor',
    component: ModelEditor,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
