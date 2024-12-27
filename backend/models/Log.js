const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login']
  },
  operator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  detail: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// 添加虚拟字段用于关联查询
logSchema.virtual('operatorInfo', {
  ref: 'User',
  localField: 'operator',
  foreignField: '_id',
  justOne: true
})

// 设置 toJSON 和 toObject 选项
logSchema.set('toJSON', { virtuals: true })
logSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Log', logSchema) 