import EconfView from '@/views/EconfView.vue'
import HomeView from '@/views/HomeView.vue'
import ReactionView from '@/views/ReactionView.vue'
import TableView from '@/views/TableView.vue'

import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView  },
    { path: '/periodictable', name: 'periodic-table', component: TableView },
    { path: '/econfig', name: 'electron-configuration', component: EconfView },
    { path: '/reaction', name: 'reaction-analyzer', component: ReactionView}
  ],
})

export default router
