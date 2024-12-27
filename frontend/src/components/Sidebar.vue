<template>
  <el-menu
    :default-active="route.path"
    class="sidebar-menu"
    :collapse="isCollapse"
    router
  >
    <el-menu-item index="/dashboard">
      <el-icon><HomeFilled /></el-icon>
      <span>首页</span>
    </el-menu-item>

    <el-menu-item index="/students">
      <el-icon><User /></el-icon>
      <span>学生管理</span>
    </el-menu-item>

    <el-menu-item index="/classes">
      <el-icon><Collection /></el-icon>
      <span>班级管理</span>
    </el-menu-item>

    <!-- 系统管理菜单 -->
    <el-sub-menu index="/system" v-if="showAdminMenu">
      <template #title>
        <el-icon><Setting /></el-icon>
        <span>系统管理</span>
      </template>
     
      <el-menu-item index="/system/users">
        <el-icon><UserFilled /></el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <el-menu-item index="/system/logs">
        <el-icon><List /></el-icon>
        <span>操作日志</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  User,
  Collection,
  Setting,
  Tools,
  UserFilled,
  List
} from '@element-plus/icons-vue'

const route = useRoute()
const userStore = useUserStore()

const isCollapse = computed(() => false)

const showAdminMenu = computed(() => {
  const user = userStore.user
  console.log('Checking admin menu visibility:', {
    user,
    role: user?.role,
    isAdmin: user?.role?.toLowerCase() === 'admin'
  })
  return user?.role?.toLowerCase() === 'admin'
})

// 监听用户状态变化
watch(() => userStore.user, (newUser) => {
  console.log('User state changed:', newUser)
}, { immediate: true })
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

:deep(.el-sub-menu .el-menu-item) {
  min-width: 200px;
}
</style>