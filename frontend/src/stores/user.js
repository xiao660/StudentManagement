import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

  // 监听 token 变化
  watch(token, (newToken) => {
    console.log('[用户状态] token 变化:', newToken ? '已设置' : '已清除')
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  })

  // 监听用户信息变化
  watch(user, (newUser) => {
    console.log('[用户状态] 用户信息变化:', newUser)
    if (Object.keys(newUser).length > 0) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }, { deep: true })

  const setToken = (newToken) => {
    if (!newToken) {
      console.log('[用户状态] 清除 token')
      token.value = ''
      localStorage.removeItem('token')
      return
    }
    console.log('[用户状态] 设置新 token')
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser) => {
    console.log('[用户状态] 设置用户信息:', newUser)
    user.value = newUser || {}
  }

  const getToken = () => {
    const currentToken = token.value || localStorage.getItem('token')
    console.log('[用户状态] 获取 token:', currentToken ? '存在' : '不存在')
    return currentToken
  }

  const logout = () => {
    console.log('[用户状态] 退出登录')
    token.value = ''
    user.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    setToken,
    setUser,
    getToken,
    logout
  }
})