<template>
  <div class="main-layout">
    <el-container>
      <el-aside width="auto">
        <Sidebar />
      </el-aside>
      <el-container>
        <el-header>
          <Header />
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.el-header {
  padding: 0;
  background: #fff;
}

.el-aside {
  background: #304156;
}

.el-main {
  background: #f0f2f5;
  padding: 0;
}
</style> 