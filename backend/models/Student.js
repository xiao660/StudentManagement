const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: Number,
    enum: [1, 2], // 1: 男, 2: 女
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,  // 添加 createdAt 和 updatedAt
  toJSON: { virtuals: true },  // 在 JSON 中包含虚拟字段
  toObject: { virtuals: true }
})

// 添加班级名称虚拟字段
studentSchema.virtual('className').get(function() {
  if (this.classId && this.classId.grade && this.classId.name) {
    return `${this.classId.grade}级${this.classId.name}`
  }
  return ''
})

module.exports = mongoose.model('Student', studentSchema) 