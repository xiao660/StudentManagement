<template>
  <div class="settings-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>系统设置</h2>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="settings"
        label-width="120px"
        @submit.prevent
      >
        <el-form-item label="系统名称">
          <el-input v-model="settings.systemName" />
        </el-form-item>

        <el-form-item label="系统Logo">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
          >
            <img v-if="settings.logo" :src="settings.logo" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="页面大小选项">
          <el-select v-model="settings.pageSizes" multiple>
            <el-option label="10条/页" :value="10" />
            <el-option label="20条/页" :value="20" />
            <el-option label="50条/页" :value="50" />
            <el-option label="100条/页" :value="100" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

const settings = ref({
  systemName: '学生信息管理系统',
  logo: '',
  pageSizes: [10, 20, 50, 100]
})

const fetchSettings = async () => {
  try {
    const res = await request.get('/settings')
    settings.value = res.data
  } catch (error) {
    ElMessage.error('获取系统设置失败')
  }
}

const saveSettings = async () => {
  try {
    await request.post('/settings', settings.value)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const handleLogoSuccess = (res) => {
  settings.value.logo = res.data.url
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.avatar-uploader {
  width: 178px;
  height: 178px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style> 