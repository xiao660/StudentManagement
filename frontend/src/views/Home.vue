<template>
  <div class="home">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>学生信息管理系统</span>
          <el-button
            type="primary"
            @click="dialogVisible = true"
            aria-label="添加学生"
          >
            添加学生
          </el-button>
        </div>
      </template>
      <!-- 学生列表组件 -->
      <StudentList />
    </el-card>

    <!-- 添加学生对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加新学生"
      width="50%"
      :before-close="handleBeforeClose"
    >
      <StudentForm @submit="handleSubmit" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import StudentList from "../components/StudentList.vue";
import StudentForm from "../components/StudentForm.vue";
import { useStudentStore } from "../stores/student";
import { ElMessage } from "element-plus";

const store = useStudentStore();
const dialogVisible = ref(false);

// 处理表单提交
const handleSubmit = async (formData) => {
  try {
    await store.createStudent(formData);
    ElMessage.success("添加成功");
    dialogVisible.value = false;
  } catch (error) {
    console.error(error); // For debugging
    ElMessage.error("添加失败: " + (error.message || "未知错误"));
  }
};

// Handle dialog close behavior (optional, for cleanup)
const handleBeforeClose = (done) => {
  dialogVisible.value = false;
  done();
};
</script>

<style scoped>
.home {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-card {
  margin-bottom: 20px;
}
</style>
