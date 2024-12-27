const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Class', classSchema) 