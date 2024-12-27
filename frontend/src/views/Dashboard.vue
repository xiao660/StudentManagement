<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>学生总数</span>
            <el-icon><User /></el-icon>
          </div>
        </template>
        <div class="stats-value">{{ stats.studentCount }}</div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>班级总数</span>
            <el-icon><School /></el-icon>
          </div>
        </template>
        <div class="stats-value">{{ stats.classCount }}</div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>男生人数</span>
            <el-icon><Male /></el-icon>
          </div>
        </template>
        <div class="stats-value">{{ stats.maleCount }}</div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>女生人数</span>
            <el-icon><Female /></el-icon>
          </div>
        </template>
        <div class="stats-value">{{ stats.femaleCount }}</div>
      </el-card>
    </div>

    <!-- 最近添加的学生 -->
    <el-card class="recent-students">
      <template #header>
        <div class="card-header">
          <span>最近添加的学生</span>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="recentStudents"
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
        <el-table-column prop="createdAt" label="添加时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, School, Male, Female } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const stats = ref({
  studentCount: 0,
  classCount: 0,
  maleCount: 0,
  femaleCount: 0
})
const recentStudents = ref([])

// 获取统计数据
const fetchStats = async () => {
  try {
    loading.value = true
    console.log('[仪表盘] 获取统计数据')
    
    const res = await request.get('/stats')
    if (res.code === 0) {
      stats.value = res.data
      console.log('[仪表盘] 统计数据:', stats.value)
    }
  } catch (error) {
    console.error('[仪表盘] 获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 获取最近添加的学生
const fetchRecentStudents = async () => {
  try {
    loading.value = true
    console.log('[仪表盘] 获取最近添加的学生')
    
    const res = await request.get('/students/recent')
    if (res.code === 0) {
      recentStudents.value = res.data.map(student => ({
        ...student,
        className: `${student.classId?.grade}级${student.classId?.name}`,
        createdAt: formatDate(student.createdAt)
      }))
      console.log('[仪表盘] 最近添加的学生:', recentStudents.value)
    }
  } catch (error) {
    console.error('[仪表盘] 获取最近添加的学生失败:', error)
    ElMessage.error('获取最近添加的学生失败')
  } finally {
    loading.value = false
  }
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
  console.log('[仪表盘] 组件挂载')
  fetchStats()
  fetchRecentStudents()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.recent-students {
  margin-top: 20px;
}
</style> 