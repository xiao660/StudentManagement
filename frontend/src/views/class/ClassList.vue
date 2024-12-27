<template>
  <div class="class-list">
    <div class="page-header">
      <h2>班级管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加班级
      </el-button>
    </div>

    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" @keyup.enter="handleSearch">
        <el-form-item label="年级">
          <el-input v-model="searchForm.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input v-model="searchForm.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 班级列表 -->
    <el-card class="list-card">
      <el-table
        v-loading="loading"
        :data="classList"
        border
        style="width: 100%"
      >
        <el-table-column prop="grade" label="年级" width="120" />
        <el-table-column prop="name" label="班级名称" width="120" />
        <el-table-column label="班主任" width="120">
          <template #default="{ row }">
            {{ row.teacherName || '未分配' }}
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
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const loading = ref(false)
const classList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = ref({
  grade: '',
  name: ''
})

// 获取班级列表
const fetchClasses = async () => {
  try {
    loading.value = true
    console.log('[班级列表] 获取班级列表, 参数:', {
      page: page.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })

    const res = await request.get('/classes', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        ...searchForm.value
      }
    })

    if (res.code === 0) {
      classList.value = res.data.list.map(item => ({
        ...item,
        teacherName: item.teacherName || '未分配'
      }))
      total.value = res.data.total

      console.log('[班级列表] 获取成功:', {
        total: total.value,
        list: classList.value
      })
    }
  } catch (error) {
    console.error('[班级列表] 获取失败:', error)
    ElMessage.error('获取班级列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  page.value = 1
  fetchClasses()
}

// 处理重置
const handleReset = () => {
  searchForm.value = {
    grade: '',
    name: ''
  }
  handleSearch()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchClasses()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchClasses()
}

// 处理添加
const handleAdd = () => {
  router.push('/classes/add')
}

// 处理编辑
const handleEdit = (row) => {
  router.push(`/classes/${row._id}/edit`)
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除班级 ${row.grade}级${row.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await request.delete(`/classes/${row._id}`)
      if (res.code === 0) {
        ElMessage.success('删除成功')
        fetchClasses()
      }
    } catch (error) {
      console.error('[班级列表] 删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  console.log('[班级列表] 组件挂载')
  fetchClasses()
})
</script>

<style scoped>
.class-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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