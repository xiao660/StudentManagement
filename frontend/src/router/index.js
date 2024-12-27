import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: '/students',
          name: 'StudentList',
          component: () => import('@/views/student/StudentList.vue')
        },
        {
          path: '/students/add',
          name: 'StudentAdd',
          component: () => import('@/views/student/StudentForm.vue')
        },
        {
          path: '/students/:id/edit',
          name: 'StudentEdit',
          component: () => import('@/views/student/StudentForm.vue')
        },
        {
          path: '/classes',
          name: 'ClassList',
          component: () => import('@/views/class/ClassList.vue')
        },
        {
          path: '/classes/add',
          name: 'ClassAdd',
          component: () => import('@/views/class/ClassForm.vue')
        },
        {
          path: '/classes/:id/edit',
          name: 'ClassEdit',
          component: () => import('@/views/class/ClassForm.vue')
        },
        {
          path: '/system/settings',
          name: 'SystemSettings',
          component: () => import('@/views/system/Settings.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: '/system/users',
          name: 'UserManagement',
          component: () => import('@/views/system/Users.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: '/system/logs',
          name: 'OperationLogs',
          component: () => import('@/views/system/Logs.vue'),
          meta: { requiresAdmin: true }
        }
      ]
    }
  ]
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')
  
  console.log('[路由守卫] 路由变化:', {
    to: to.path,
    hasToken: !!token
  })

  // 如果是登录页面，直接放行
  if (to.path === '/login') {
    next()
    return
  }

  // 检查是否有 token
  if (!token) {
    console.log('[路由守卫] 无 token，重定向到登录页')
    next('/login')
    return
  }

  // 如果有 token 但 store 中没有，从 localStorage 恢复
  if (token && !userStore.token) {
    console.log('[路由守卫] 从 localStorage 恢复 token')
    userStore.setToken(token)
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      userStore.setUser(JSON.parse(savedUser))
    }
  }

  next()
})

export default router;

