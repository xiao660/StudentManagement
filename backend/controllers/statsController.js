const Student = require('../models/Student')
const Class = require('../models/Class')
const { success, error } = require('../utils/response')

// 获取统计数据
exports.getStats = async (req, res) => {
  try {
    console.log('[统计控制器] 获取统计数据')

    const [
      studentCount,
      classCount,
      maleCount,
      femaleCount
    ] = await Promise.all([
      Student.countDocuments(),
      Class.countDocuments(),
      Student.countDocuments({ gender: 1 }),
      Student.countDocuments({ gender: 2 })
    ])

    const stats = {
      studentCount,
      classCount,
      maleCount,
      femaleCount
    }

    console.log('[统计控制器] 统计数据:', stats)
    success(res, stats)
  } catch (err) {
    console.error('[统计控制器] 获取统计数据失败:', err)
    error(res, '获取统计数据失败', 1, 500)
  }
}

// 获取最近添加的学生
exports.getRecentStudents = async (req, res) => {
  try {
    console.log('[统计控制器] 获取最近添加的学生')

    const students = await Student.find()
      .populate('classId', 'grade name')
      .sort('-createdAt')
      .limit(10)
      .lean()

    console.log('[统计控制器] 最近添加的学生:', students.length)
    success(res, students)
  } catch (err) {
    console.error('[统计控制器] 获取最近添加的学生失败:', err)
    error(res, '获取最近添加的学生失败', 1, 500)
  }
} 