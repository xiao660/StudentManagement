const jwt = require('jsonwebtoken')
const { error } = require('../utils/response')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  try {
    // 获取 token
    const authHeader = req.headers.authorization
    console.log('[认证中间件] Authorization header:', authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[认证中间件] 未提供有效的token')
      return error(res, '未提供有效的token', 1, 401)
    }

    const token = authHeader.split(' ')[1]
    console.log('[认证中间件] Token:', token.substring(0, 20) + '...')

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here')
    console.log('[认证中间件] Decoded token:', decoded)

    // 查找用户
    const user = await User.findById(decoded.id).select('-password')
    console.log('[认证中间件] Found user:', user ? {
      _id: user._id,
      username: user.username,
      role: user.role
    } : 'null')

    if (!user) {
      console.log('[认证中间件] 用户不存在')
      return error(res, '用户不存在', 1, 401)
    }

    // 将用户信息添加到请求对象
    req.user = user
    next()
  } catch (err) {
    console.error('[认证中间件] 认证失败:', err)
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'token无效', 1, 401)
    }
    if (err.name === 'TokenExpiredError') {
      return error(res, 'token已过期', 1, 401)
    }
    error(res, '认证失败', 1, 401)
  }
} 