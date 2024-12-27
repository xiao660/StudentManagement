import { defineStore } from "pinia";
import { mockStudents } from "../data/mockStudents";

// 学生管理的状态存储
export const useStudentStore = defineStore("student", {
  state: () => ({
    students: mockStudents
  }),
  actions: {
    // 定义你的 actions
  }
});
