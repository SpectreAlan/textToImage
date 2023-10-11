<template>
  <el-dialog
      v-model="dialogVisible"
      title="关于"
      width="400"
      :show-close="false"
      :close-on-click-modal="false"
      :before-close="showOrClose"
  >
    <div class="about-dialog">
      <div class="base">
        <img src="../../assets/logo.png" alt="">
        <div>欢迎使用 <span>文字转图</span> 小工具</div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="showOrClose">
          关闭
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
const {ipcRenderer} = require('electron');

const dialogVisible = ref<boolean>(false)

const showOrClose = ()=>{
  dialogVisible.value = !dialogVisible.value
}

onMounted(()=>{
  ipcRenderer.on('trigger-vue-about', () => {
    showOrClose()
  });
})
</script>

<style lang="less" scoped>
.about-dialog{
  background: white;
  .base{
    display: flex;
    align-items: center;
    img{
      width: 60px;
    }
    div{
      font-weight: bold;
      font-size: 16px;
      color: #72767b;
      margin-left: 20px;
      span{
        font-style: italic ;
      }
    }
  }
}
</style>