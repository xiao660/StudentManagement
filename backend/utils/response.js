exports.success = (res, data = null, message = '操作成功') => {
    res.json({
      code: 0,
      message,
      data
    })
}

exports.error = (res, message = '操作失败', code = 1, status = 400) => {
    res.status(status).json({
      code,
      message
    })
}