const express = require('express')
const router = express.Router()
const teacherController = require('../controllers/teacherController')
const auth = require('../middleware/auth')

// 添加调试中间件
router.use((req, res, next) => {
  console.log('[教师路由] 收到请求:', {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? '已提供' : '未提供'
    }
  })
  next()
})

// 教师路由
router.get('/', auth, teacherController.getTeachers)
router.get('/:id', teacherController.getTeacher)
router.post('/', teacherController.createTeacher)
router.put('/:id', teacherController.updateTeacher)
router.delete('/:id', teacherController.deleteTeacher)

module.exports = router 