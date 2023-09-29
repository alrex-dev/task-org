import { createRouter, createWebHistory } from 'vue-router'
//import Dashboard from '../views/Dashboard.vue'
import Dashboard from '@/views/Dashboard.vue'
import RecentActivities from '@/views/RecentActivities.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard
    },
    {
      path: '/recent',
      name: 'recent-activities',
      component: RecentActivities
    }
    /*
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
    */
  ]
})

export default router
