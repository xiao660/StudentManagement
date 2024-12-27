<template>
  <div class="header">
    <div class="left">
      <h2>学生信息管理系统</h2>
    </div>
    <div class="right">
      <el-dropdown 
        @command="handleCommand"
        trigger="click"
        :teleported="false"
      >
        <span class="user-info" role="button" tabindex="0">
          {{ userStore.user?.name }}
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </span>
        <template #dropdown>
         
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
         
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { 
  CaretBottom,
  User,
  Lock,
  SwitchButton
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'password':
      router.push('/password')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            draggable: true
          }
        )
        
        // 清除用户状态
        userStore.logout()
        
        // 显示提示消息
        ElMessage.success('已退出登录')
        
        // 使用完整的URL进行跳转
        window.location.href = `${window.location.origin}/login`
        
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
          ElMessage.error('退出失败')
          console.error('退出失败:', error)
        }
      }
      break
  }
}
</script>

<style scoped>
.header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
  background-color: #fff;
}

.left h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  color: #409EFF;
  background-color: #f5f7fa;
}

.el-icon--right {
  margin-left: 5px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 0;
}
</style> 