const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')
const logger = require('../middleware/logger')

// 添加调试中间件
router.use((req, res, next) => {
  console.log('用户路由请求:', {
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      authorization: req.headers.authorization
    }
  })
  next()
})

// 需要管理员权限
const adminAuth = (req, res, next) => {
  console.log('检查管理员权限:', {
    user: req.user,
    role: req.user?.role,
    isAdmin: req.user?.role === 'admin'
  })
  
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    console.log('权限不足')
    res.status(403).json({
      code: 1,
      message: '需要管理员权限'
    })
  }
}

// 添加日志
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.query || req.body)
  next()
})

router.get('/', auth, adminAuth, userController.getUsers)
router.post('/', auth, adminAuth, logger('create'), userController.createUser)
router.put('/:id', auth, adminAuth, logger('update'), userController.updateUser)
router.delete('/:id', auth, adminAuth, logger('delete'), userController.deleteUser)

module.exports = router 