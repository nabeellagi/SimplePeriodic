import HomeView from '@/views/HomeView.vue'
import TableView from '@/views/TableView.vue'

import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView  },
    { path: '/periodictable', name: 'periodic-table', component: TableView },
  ],
})

export default router
