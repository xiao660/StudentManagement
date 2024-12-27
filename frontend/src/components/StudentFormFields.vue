<template>
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
    <el-select v-model="form.classId" placeholder="请选择班级">
      <el-option
        v-for="item in classList"
        :key="item._id"
        :label="item.name"
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
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  form: {
    type: Object,
    required: true
  }
})

const classList = ref([])
</script> 