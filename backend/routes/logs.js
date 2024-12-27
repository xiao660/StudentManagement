const express = require('express')
const router = express.Router()
const logController = require('../controllers/logController')
const auth = require('../middleware/auth')

// 获取日志列表
router.get('/', auth, logController.getLogs)

// 清空日志
router.delete('/', auth, logController.clearLogs)

module.exports = router 