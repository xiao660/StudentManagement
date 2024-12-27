<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>学生管理系统登录</h2>
      </template>
      
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    loading.value = true
    console.log('[登录] 开始登录:', { username: loginForm.username })

    const res = await request.post('/auth/login', loginForm)
    console.log('[登录] 登录响应:', res)

    if (res.code === 0 && res.data.token) {
      const { token, user } = res.data
      
      // 确保先清除旧数据
      userStore.logout()
      
      // 立即保存到 localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // 再更新 store
      userStore.setToken(token)
      userStore.setUser(user)
      
      console.log('[登录] 登录成功，已保存用户信息:', {
        token: token.substring(0, 10) + '...',
        user
      })
      
      ElMessage.success('登录成功')
      
      // 确保数据已保存后再跳转
      await nextTick()
      router.push('/')
    }
  } catch (error) {
    console.error('[登录] 登录失败:', error)
    ElMessage.error(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

.login-card :deep(.el-card__header) {
  text-align: center;
}

.login-card h2 {
  margin: 0;
  color: #303133;
}
</style> 