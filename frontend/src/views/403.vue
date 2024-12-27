<template>
  <div class="forbidden">
    <h1>403</h1>
    <h2>抱歉，您没有访问权限</h2>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </div>
</template>

<style scoped>
.forbidden {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 72px;
  color: #409EFF;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 30px;
  color: #606266;
}
</style>