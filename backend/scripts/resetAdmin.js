const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const resetAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/school_system')
    console.log('数据库连接成功')

    // 重置管理员密码
    const adminPassword = '123456'
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(adminPassword, salt)

    await User.findOneAndUpdate(
      { username: 'admin' },
      {
        $set: {
          password: hashedPassword,
          role: 'admin',
          name: '系统管理员'
        }
      },
      { upsert: true }
    )

    console.log('管理员密码重置成功')
    process.exit(0)
  } catch (err) {
    console.error('重置失败:', err)
    process.exit(1)
  }
}

resetAdmin() 