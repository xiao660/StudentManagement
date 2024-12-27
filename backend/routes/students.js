const express = require('express')
const router = express.Router()
const studentController = require('../controllers/studentController')
const auth = require('../middleware/auth')

// 添加调试中间件
router.use((req, res, next) => {
  console.log('[学生路由] 收到请求:', {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? '已提供' : '未提供'
    }
  })
  next()
})

// 注意：recent 路由要放在 :id 路由之前，否则会被误认为是 id
router.get('/recent', auth, studentController.getRecentStudents)

// 其他路由
router.get('/', auth, studentController.getStudents)
router.post('/', auth, studentController.createStudent)
router.get('/:id', auth, studentController.getStudent)
router.put('/:id', auth, studentController.updateStudent)
router.delete('/:id', auth, studentController.deleteStudent)

module.exports = router