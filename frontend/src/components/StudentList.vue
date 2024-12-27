`
<template>
  <div class="student-list">
    <StudentListTable :students="store.students" @delete="handleDelete" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useStudentStore } from "@/stores/student";
import { ElMessage } from "element-plus";
import StudentListTable from "./StudentListTable.vue";

const store = useStudentStore();

onMounted(() => {
  store.fetchStudents();
});

const handleDelete = async (id) => {
  try {
    await store.deleteStudent(id);
    ElMessage.success("删除成功");
  } catch (error) {
    ElMessage.error("删除失败");
  }
};
</script>

<style scoped>
.student-list {
  padding: 20px;
}
</style>
`
