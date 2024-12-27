require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const mongoose = require('mongoose')
const connectDB = require('./config/db')

// 导入模型 - 按依赖顺序导入
const User = require('./models/User')  // 先导入 User 模型
const Class = require('./models/Class')  // 再导入依赖 User 的 Class 模型
const Student = require('./models/Student')  // 最后导入依赖 Class 的 Student 模型

// 连接数据库
connectDB()

const app = express()

// 中间件
app.use(cors({
  origin: 'http://localhost:5173', // Vite 开发服务器的默认端口
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/auth', require('./routes/auth'))
app.use('/api/students', require('./routes/students'))
app.use('/api/classes', require('./routes/classes'))
app.use('/api/teachers', require('./routes/teachers'))
app.use('/api/users', require('./routes/users'))
app.use('/api/logs', require('./routes/logs'))
const statsRouter = require('./routes/stats')
app.use('/api/stats', statsRouter)

// 错误��理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: 1,
    message: err.message || '服务器内部错误'
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})