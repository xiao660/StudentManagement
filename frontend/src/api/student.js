import request from './request'

// 获取学生列表
export function getStudentList(params) {
  return request({
    url: '/students',
    method: 'get',
    params
  })
}

// 获取单个学生信息
export function getStudent(id) {
  return request({
    url: `/students/${id}`,
    method: 'get'
  })
}

// 创建学生
export function createStudent(data) {
  return request({
    url: '/students',
    method: 'post',
    data
  })
}

// 更新学生信息
export function updateStudent(id, data) {
  return request({
    url: `/students/${id}`,
    method: 'put',
    data
  })
}

// 删除学生
export function deleteStudent(id) {
  return request({
    url: `/students/${id}`,
    method: 'delete'
  })
} 