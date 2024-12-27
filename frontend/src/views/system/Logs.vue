<template>
  <div class="logs-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>操作日志</h2>
          <el-button type="danger" @click="handleClear">清空日志</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" @keyup.enter="handleSearch">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.username" placeholder="请输入操作人" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.type" placeholder="请选择操作类型" clearable>
            <el-option label="登录" value="login" />
            <el-option label="新增" value="create" />
            <el-option label="修改" value="update" />
            <el-option label="删除" value="delete" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 日志列表 -->
      <el-table :data="logList" border v-loading="loading">
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTagType(row.type)">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="操作内容" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="createdAt" label="操作时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const logList = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  username: '',
  type: '',
  timeRange: []
})

// 获取日志列表
const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      username: searchForm.username,
      type: searchForm.type,
      startTime: searchForm.timeRange?.[0],
      endTime: searchForm.timeRange?.[1]
    }
    console.log('获取日志列表, 参数:', params)
    
    const res = await request.get('/logs', { params })
    console.log('日志列表响应:', res)
    
    logList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    console.error('获取日志列表失败:', error)
    ElMessage.error('获取日志列表失败')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  page.value = 1
  fetchLogs()
}

// 处理重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    type: '',
    timeRange: []
  })
  handleSearch()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchLogs()
}

const handleCurrentChange = (val) => {
  page.value = val
  fetchLogs()
}

// 处理清空
const handleClear = () => {
  ElMessageBox.confirm(
    '确定要清空所有日志吗？此操作不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.delete('/logs')
      ElMessage.success('清空成功')
      fetchLogs()
    } catch (error) {
      ElMessage.error('清空失败')
    }
  })
}

// 获取操作类型名称
const getTypeName = (type) => {
  const typeMap = {
    login: '登录',
    create: '新增',
    update: '修改',
    delete: '删除'
  }
  return typeMap[type] || type
}

// 获取标签类型
const getTagType = (type) => {
  const typeMap = {
    login: '',
    create: 'success',
    update: 'warning',
    delete: 'danger'
  }
  return typeMap[type] || ''
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.logs-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 