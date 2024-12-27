<template>
  <div class="student-form">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑学生' : '添加学生' }}</h2>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item label="学号" prop="studentId">
          <el-input v-model="form.studentId" placeholder="请输入学号" />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="班级" prop="classId">
          <el-select v-model="form.classId" placeholder="请选择班级" :loading="loading">
            <el-option
              v-for="item in classes"
              :key="item._id"
              :label="`${item.grade}级${item.name}`"
              :value="item._id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="住址" prop="address">
          <el-input v-model="form.address" placeholder="请输入住址" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const classes = ref([])

const isEdit = computed(() => !!route.params.id)

const form = ref({
  studentId: '',
  name: '',
  gender: 1,
  classId: '',
  phone: '',
  email: '',
  address: ''
})

const rules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d{8}$/, message: '学号必须为8位数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 获取班级列表
const fetchClasses = async () => {
  try {
    loading.value = true
    console.log('[班级表单] 准备获取班级列表')

    const res = await request.get('/classes', {
      params: {
        page: 1,
        pageSize: 100  // 获取所有班级
      }
    })
    console.log('[班级表单] 获取班级列表成功:', res)

    if (res.code === 0 && Array.isArray(res.data.list)) {
      classes.value = res.data.list.map(item => ({
        _id: item._id,
        grade: item.grade,
        name: item.name,
        teacherName: item.teacherName
      }))
      console.log('[班级表单] 处理后的班级列表:', classes.value)
    } else {
      console.error('[班级表单] 班级数据格式错误:', res)
      ElMessage.warning('班级数据格式错误')
    }
  } catch (error) {
    console.error('[班级表单] 获取班级列表失败:', error)
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      userStore.logout()
      router.push('/login')
    } else {
      ElMessage.error(error.response?.data?.message || '获取班级列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 获取学生信息
const fetchStudent = async (id) => {
  try {
    loading.value = true
    console.log('[学生表单] 获取学生信息:', id)
    
    const res = await request.get(`/students/${id}`)
    if (res.code === 0) {
      Object.assign(form.value, res.data)
    }
  } catch (error) {
    console.error('[学生表单] 获取学生信息失败:', error)
    ElMessage.error('获取学生信息失败')
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    console.log('[学生表单] 提交数据:', {
      isEdit: isEdit.value,
      data: form.value
    })

    if (isEdit.value) {
      const res = await request.put(`/students/${route.params.id}`, form.value)
      if (res.code === 0) {
        ElMessage.success('更新成功')
        router.push('/students')
      }
    } else {
      const res = await request.post('/students', form.value)
      if (res.code === 0) {
        ElMessage.success('创建成功')
        router.push('/students')
      }
    }
  } catch (error) {
    console.error('[学生表单] 保存失败:', error)
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  console.log('[学生表单] 组件挂载')
  fetchClasses()
  if (isEdit.value) {
    fetchStudent(route.params.id)
  }
})
</script>

<style scoped>
.student-form {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.el-form {
  max-width: 600px;
}
</style>