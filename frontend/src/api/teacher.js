import request from './request'

// 获取教师列表
export function getTeacherList(params) {
  return request({
    url: '/teachers',
    method: 'get',
    params
  })
}

// 获取单个教师信息
export function getTeacher(id) {
  return request({
    url: `/teachers/${id}`,
    method: 'get'
  })
}

// 创建教师
export function createTeacher(data) {
  return request({
    url: '/teachers',
    method: 'post',
    data
  })
}

// 更新教师信息
export function updateTeacher(id, data) {
  return request({
    url: `/teachers/${id}`,
    method: 'put',
    data
  })
}

// 删除教师
export function deleteTeacher(id) {
  return request({
    url: `/teachers/${id}`,
    method: 'delete'
  })
} 