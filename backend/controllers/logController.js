const Log = require('../models/Log')
const { success, error } = require('../utils/response')

// 获取日志列表
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type } = req.query
    
    const query = {}
    if (type) query.type = type

    const list = await Log.find(query)
      .populate('operatorInfo', 'name')
      .skip((parseInt(page) - 1) * parseInt(pageSize))
      .limit(parseInt(pageSize))
      .sort('-createdAt')
      .lean()

    const total = await Log.countDocuments(query)

    success(res, { list, total })
  } catch (err) {
    console.error('获取日志列表失败:', err)
    error(res, '获取日志列表失败', 1, 500)
  }
}

// 创建日志
exports.createLog = async (logData) => {
  try {
    if (!logData || !logData.username || !logData.type || !logData.content) {
      throw new Error('日志数据不完整')
    }

    console.log('[日志控制器] 创建日志, 数据:', logData)
    const log = new Log(logData)
    
    // 验证数据
    await log.validate()
    
    // 保存日志
    const savedLog = await log.save()
    console.log('[日志控制器] 日志创建成功:', savedLog.toObject())
    
    return savedLog
  } catch (err) {
    console.error('[日志控制器] 创建日志失败:', err)
    throw err
  }
}

// 清空日志
exports.clearLogs = async (req, res) => {
  try {
    console.log('[日志控制器] 准备清空日志')
    const result = await Log.deleteMany({})
    console.log('[日志控制器] 清空日志结果:', result)
    success(res, null, '清空成功')
  } catch (err) {
    console.error('[日志控制器] 清空日志失败:', err)
    error(res, '清空日志失败', 1, 500)
  }
} 