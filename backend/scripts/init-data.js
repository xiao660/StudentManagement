require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../models/User')
const Class = require('../models/Class')
const Student = require('../models/Student')
const Teacher = require('../models/Teacher')
const connectDB = require('../config/db')
const bcrypt = require('bcryptjs')

const initData = async () => {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    // 清空现有数据
    await Promise.all([
      User.deleteMany({}),
      Class.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({})
    ])

    // 创建管理员用户
    await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: '系统管理员'
    })

    // 创建5个教师
    const teachers = await Teacher.create([
      {
        name: '张老师',
        gender: 1,
        phone: '13900000001',
        email: 'zhang@example.com',
        subject: '语文'
      },
      {
        name: '李老师',
        gender: 2,
        phone: '13900000002',
        email: 'li@example.com',
        subject: '数学'
      },
      {
        name: '王老师',
        gender: 1,
        phone: '13900000003',
        email: 'wang@example.com',
        subject: '英语'
      },
      {
        name: '赵老师',
        gender: 2,
        phone: '13900000004',
        email: 'zhao@example.com',
        subject: '物理'
      },
      {
        name: '刘老师',
        gender: 1,
        phone: '13900000005',
        email: 'liu@example.com',
        subject: '化学'
      }
    ])

    // 为每个教师创建用户账号
    await Promise.all(teachers.map(teacher => 
      User.create({
        username: teacher.email.split('@')[0],
        password: '123456',
        name: teacher.name,
        role: 'teacher'
      })
    ))

    // 创建5个班级
    const classes = await Class.create([
      {
        grade: '2024',
        name: '1班',
        teacherId: teachers[0]._id
      },
      {
        grade: '2024',
        name: '2班',
        teacherId: teachers[1]._id
      },
      {
        grade: '2024',
        name: '3班',
        teacherId: teachers[2]._id
      },
      {
        grade: '2024',
        name: '4班',
        teacherId: teachers[3]._id
      },
      {
        grade: '2024',
        name: '5班',
        teacherId: teachers[4]._id
      }
    ])

    // 为每个班级创建20个学生
    const students = []
    const genders = [1, 2] // 1: 男, 2: 女
    const surnames = ['张', '李', '王', '赵', '刘', '陈', '杨', '黄', '周', '吴']
    const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋']

    for (let classIndex = 0; classIndex < classes.length; classIndex++) {
      const classObj = classes[classIndex]
      
      for (let i = 0; i < 20; i++) {
        const surname = surnames[Math.floor(Math.random() * surnames.length)]
        const name = names[Math.floor(Math.random() * names.length)]
        const gender = genders[Math.floor(Math.random() * genders.length)]
        
        students.push({
          studentId: `2024${(classIndex + 1).toString().padStart(2, '0')}${(i + 1).toString().padStart(2, '0')}`,
          name: surname + name,
          gender,
          classId: classObj._id,
          phone: `139${Math.random().toString().slice(2, 11)}`,
          email: `student_${classIndex + 1}_${i + 1}@example.com`,
          address: `北京市海淀区第${Math.floor(Math.random() * 20 + 1)}号`
        })
      }
    }

    await Student.create(students)

    console.log('初始数据创建成功！')
    console.log('创建了：')
    console.log(`- ${teachers.length} 个教师`)
    console.log(`- ${classes.length} 个班级`)
    console.log(`- ${students.length} 个学生`)
    console.log('\n登录信息：')
    console.log('管理员账号：admin')
    console.log('管理员密码：admin123')
    console.log('教师账号：zhang, li, wang, zhao, liu')
    console.log('教师密码：123456')
    
    process.exit(0)
  } catch (error) {
    console.error('初始化数据失败:', error)
    process.exit(1)
  }
}

initData() 