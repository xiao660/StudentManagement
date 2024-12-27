<template>
  <div class="class-form">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑班级' : '添加班级' }}</h2>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item label="年级" prop="grade">
          <el-input v-model="form.grade" placeholder="请输入年级，如：2024" />
        </el-form-item>

        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入班级名称，如：1班" />
        </el-form-item>

        <el-form-item label="班主任" prop="teacherId">
          <el-select 
            v-model="form.teacherId" 
            placeholder="请选择班主任"
            clearable
            :loading="teachersLoading"
          >
            <el-option
              v-for="item in teachers"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
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
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const teachersLoading = ref(false)
const teachers = ref([])

const isEdit = computed(() => !!route.params.id)

const form = ref({
  grade: '',
  name: '',
  teacherId: ''
})

const rules = {
  grade: [
    { required: true, message: '请输入年级', trigger: 'blur' },
    { pattern: /^\d{4}$/, message: '年级必须是4位数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { pattern: /^[1-9]\d*班$/, message: '班级名称格式必须为"数字+班"，如"1班"', trigger: 'blur' }
  ]
}

// 获取教师列表
const fetchTeachers = async () => {
  try {
    teachersLoading.value = true
    console.log('[班级表单] 获取教师列表')
    
    const res = await request.get('/teachers', {
      params: {
        page: 1,
        pageSize: 100
      }
    })
    
    if (res.code === 0 && Array.isArray(res.data.list)) {
      teachers.value = res.data.list.map(item => ({
        _id: item._id,
        name: item.name
      }))
      console.log('[班级表单] 教师列表:', teachers.value)
    }
  } catch (error) {
    console.error('[班级表单] 获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
  } finally {
    teachersLoading.value = false
  }
}

// 获取班级信息
const fetchClass = async (id) => {
  try {
    loading.value = true
    console.log('[班级表单] 获取班级信息:', id)
    
    const res = await request.get(`/classes/${id}`)
    if (res.code === 0) {
      const { grade, name, teacherId } = res.data
      Object.assign(form.value, { grade, name, teacherId })
    }
  } catch (error) {
    console.error('[班级表单] 获取班级信息失败:', error)
    ElMessage.error('获取班级信息失败')
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
    
    console.log('[班级表单] 提交数据:', {
      isEdit: isEdit.value,
      data: form.value
    })

    if (isEdit.value) {
      const res = await request.put(`/classes/${route.params.id}`, form.value)
      if (res.code === 0) {
        ElMessage.success('更新成功')
        router.push('/classes')
      }
    } else {
      const res = await request.post('/classes', form.value)
      if (res.code === 0) {
        ElMessage.success('创建成功')
        router.push('/classes')
      }
    }
  } catch (error) {
    console.error('[班级表单] 保存失败:', error)
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
  console.log('[班级表单] 组件挂载')
  fetchTeachers()
  if (isEdit.value) {
    fetchClass(route.params.id)
  }
})
</script>

<style scoped>
.class-form {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.el-form {
  max-width: 600px;
}
</style> 