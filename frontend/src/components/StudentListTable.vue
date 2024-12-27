<template>
  <div class="student-list">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" @keyup.enter="handleSearch">
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentId" placeholder="请输入学号" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" placeholder="请选择班级" clearable>
            <el-option
              v-for="item in classList"
              :key="item._id"
              :label="`${item.grade}级${item.name}`"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 学生列表 -->
    <el-card class="list-card">
      <el-table
        v-loading="loading"
        :data="studentList"
        border
        style="width: 100%"
      >
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column label="班级">
          <template #default="{ row }">
            {{ row.className }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="createdAt" label="添加时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const studentList = ref([])
const classList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  studentId: '',
  name: '',
  classId: ''
})

// 获取班级列表
const fetchClasses = async () => {
  try {
    const userStore = useUserStore()
    if (!userStore.token) {
      console.log('[学生列表] 未登录，跳转到登录页')
      router.push('/login')
      return
    }
    const res = await request.get('/classes', {
      params: {
        page: 1,
        pageSize: 100
      }
    })
    // 打印返回的响应数据，检查其结构
    console.log('[学生列表] 返回数据:', res)
    if (res.code === 0) {
      classList.value = res.data.list
      console.log('[学生列表] 获取班级列表成功:', classList.value)
    }
  } catch (error) {
    console.error('[学生列表] 获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
  }
}

// 获取学生列表
const fetchStudents = async () => {
  try {
    const userStore = useUserStore()
    if (!userStore.token) {
      console.log('[学生列表] 未登录，跳转到登录页')
      router.push('/login')
      return
    }

    loading.value = true
    console.log('[学生列表] 获取学生列表, 参数:', {
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })

    const res = await request.get('/students', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        ...searchForm.value
      }
    })

    if (res.code === 0) {
      studentList.value = res.data.list.map(student => ({
        ...student,
        className: student.className || '未分配班级',
        createdAt: formatDate(student.createdAt)
      }))
      total.value = res.data.total

      console.log('[学生列表] 获取成功:', {
        total: total.value,
        list: studentList.value
      })
    }
  } catch (error) {
    console.error('[学生列表] 获取失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  page.value = 1
  fetchStudents()
}

// 处理重置
const handleReset = () => {
  searchForm.value = {
    studentId: '',
    name: '',
    classId: ''
  }
  handleSearch()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchStudents()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchStudents()
}

// 处理编辑
const handleEdit = (row) => {
  router.push(`/students/${row._id}/edit`)
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除学生 ${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await request.delete(`/students/${row._id}`)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchStudents()
      }
    } catch (error) {
      console.error('[学生列表] 删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  console.log('[学生列表] 组件挂载')
  fetchClasses()
  fetchStudents()
})
</script>

<style scoped>
.student-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 