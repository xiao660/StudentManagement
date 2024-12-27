const logController = require('../controllers/logController')

const getClientIP = (req) => {
  return req.ip || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress || 
    req.connection.socket.remoteAddress
}

const logger = (type) => async (req, res, next) => {
  try {
    console.log('[日志中间件] 开始处理请求:', {
      type,
      method: req.method,
      path: req.path,
      user: req.user,
      body: req.body
    })

    // 保存原始的 json 方法
    const originalJson = res.json
    
    // 重写 json 方法
    res.json = function(data) {
      console.log('[日志中间件] 响应数据:', data)
      
      // 只记录成功的操作
      if (data.code === 0) {
        const logData = {
          username: req.user?.username || 'anonymous',
          type,
          content: getLogContent(req, type, data.data),
          ip: getClientIP(req)
        }
        console.log('[日志中间件] 准备创建日志:', logData)
        
        // 使用 Promise 处理异步创建
        logController.createLog(logData)
          .then(log => console.log('[日志中间件] 日志创建成功:', log))
          .catch(err => console.error('[日志中间件] 日志创建失败:', err))
      } else {
        console.log('[日志中间件] 操作未成功，不记录日志')
      }

      return originalJson.call(this, data)
    }
    next()
  } catch (err) {
    console.error('[日志中间件] 错误:', err)
    next()
  }
}

const getLogContent = (req, type, responseData) => {
  const user = req.user?.username || 'anonymous'
  let content = ''
  
  switch (type) {
    case 'login':
      content = `用户 ${req.body.username} 登录系统`
      break
    case 'create':
      if (req.path.includes('classes')) {
        const { grade, name, teacherId } = req.body
        content = `用户 ${user} 创建班级：${grade}级${name}`
      } else if (req.path.includes('users')) {
        const { username, name, role } = req.body
        content = `用户 ${user} 创建用户：${name}(${username})，角色：${role}`
      } else if (req.path.includes('students')) {
        const { name, studentId, className } = req.body
        content = `用户 ${user} 创建学生：${name}，学号：${studentId}，班级：${className}`
      } else {
        content = `用户 ${user} 创建${getResourceName(req.path)}：${JSON.stringify(req.body)}`
      }
      break
    case 'update':
      if (req.path.includes('classes')) {
        const { grade, name, teacherId } = req.body
        content = `用户 ${user} 更新班级：${grade}级${name}`
      } else if (req.path.includes('users')) {
        const { name, role } = req.body
        content = `用户 ${user} 更新用户：${name}，角色：${role}`
      } else if (req.path.includes('students')) {
        const { name, className } = req.body
        content = `用户 ${user} 更新学生：${name}，班级：${className}`
      } else {
        content = `用户 ${user} 更新${getResourceName(req.path)}：${req.params.id}`
      }
      break
    case 'delete':
      if (req.path.includes('classes')) {
        // 尝试从响应数据中获取班级信息
        const classInfo = responseData || {}
        content = `用户 ${user} 删除班级：${classInfo.grade}级${classInfo.name || req.params.id}`
      } else if (req.path.includes('users')) {
        content = `用户 ${user} 删除用户：${req.params.id}`
      } else if (req.path.includes('students')) {
        content = `用户 ${user} 删除学生：${req.params.id}`
      } else {
        content = `用户 ${user} 删除${getResourceName(req.path)}：${req.params.id}`
      }
      break
    default:
      content = '未知操作'
  }
  
  console.log('[日志中间件] 生成日志内容:', content)
  return content
}

const getResourceName = (path) => {
  if (path.includes('students')) return '学生'
  if (path.includes('classes')) return '班级'
  if (path.includes('users')) return '用户'
  if (path.includes('teachers')) return '教师'
  return '记录'
}

module.exports = logger 