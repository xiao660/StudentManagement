`
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="studentFormRules"
    label-width="120px"
    class="student-form"
  >
    <StudentFormFields :form="form" />
    <el-form-item>
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref } from "vue";
import StudentFormFields from "./StudentFormFields.vue";
import { studentFormRules } from "@/utils/validators";

const emit = defineEmits(["submit"]);
const formRef = ref();
const form = ref({
  studentId: "",
  name: "",
  age: 18,
  grade: "",
  major: "",
  email: "",
});

const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      emit("submit", { ...form.value });
    }
  });
};

const resetForm = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};
</script>

<style scoped>
.student-form {
  max-width: 500px;
  margin: 20px auto;
}
</style>
`
