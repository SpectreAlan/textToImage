<template>
  <div class="home"
  :style="{
    paddingLeft: `calc(100%-${form.width})`
  }"
  >
    <div
        class="box-out"
        :style="{
          width: form.width + 'px',
          height: form.height + 'px',
      }"
    >
      <div
          class="box"
          ref="captureContainer"
          :style="{
          width: form.width + 'px',
          height: form.height + 'px',
          backgroundColor: form.backgroundColor,
          textAlign: form.textAlign,
          color: form.color,
          fontSize: form.fontSize + 'px',
          paddingTop: form.paddingTop + 'px',
          backgroundImage: `url(${form.backgroundImage})`
      }"
      >
        <span ref="content">{{ form.content }}</span>
      </div>
    </div>

    <div class="config">
      <div class="left">
        <div class="item">
          <div class="title">文字大小</div>
          <div class="control">
            <el-input-number size="small" v-model="form.fontSize" :min="12"/>
          </div>
        </div>
        <div class="item border-right">
          <div class="title">文字颜色</div>
          <div class="control">
            <el-color-picker size="small" v-model="form.color"></el-color-picker>
            <el-button
                type="primary"
                class="btn"
                @click="getRandomColor('color')"
                size="small"
            >随机获取颜色
            </el-button>
          </div>
        </div>
        <div class="item">
          <div class="title">文本对齐</div>
          <div class="control">
            <el-radio-group size="small" v-model="form.textAlign">
              <el-radio label="left">靠左</el-radio>
              <el-radio label="center">居中</el-radio>
              <el-radio label="right">靠右</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="item border-right">
          <div class="title">文本位置</div>
          <div class="control">
            <el-radio-group size="small" v-model="positionTop">
              <el-radio label="top">顶部</el-radio>
              <el-radio label="center">居中</el-radio>
              <el-radio label="bottom">底部</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="item">
          <div class="title">背景模式</div>
          <div class="control">
            <el-radio-group size="small" v-model="backgroundMode">
              <el-radio label="color">纯色</el-radio>
              <el-radio label="image">图片</el-radio>
            </el-radio-group>
          </div>
        </div>
        <div class="item border-right">
          <div class="title">{{ backgroundMode === 'color' ? '背景颜色' : '背景图片' }}</div>
          <div class="control">
            <template v-if="backgroundMode === 'color'">
              <el-color-picker size="small" v-model="form.backgroundColor"></el-color-picker>
              <el-button
                  type="primary"
                  class="btn"
                  @click="getRandomColor('backgroundColor')"
                  size="small"
              >随机获取颜色
              </el-button>
            </template>
            <template v-else>
              <el-radio-group size="small" v-model="backgroundImage">
                <el-radio label="none">无</el-radio>
                <el-radio label="random">随机</el-radio>
                <el-radio label="custom">自定义</el-radio>
              </el-radio-group>
              <el-button
                  v-if="backgroundImage === 'random'"
                  type="primary"
                  class="btn"
                  size="small"
                  @click="getRandomBackgroundImage"
              >切换图片
              </el-button>
              <template v-if="backgroundImage === 'custom'">
                <input
                    size="small"
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    style="display: none"
                />
                <el-button class="btn" size="small" type="primary" @click="openFileInput">选择图片</el-button>
              </template>
            </template>
          </div>
        </div>
        <div class="item border-bottom">
          <div class="title">图片宽度</div>
          <div class="control">
            <el-input-number class="mr" size="small" v-model="form.width" :min="40" :step="10"/>
          </div>
        </div>
        <div class="item border-bottom border-right">
          <div class="title">图片高度</div>
          <div class="control">
            <el-input-number size="small" v-model="form.height" :min="40" :step="10"/>
          </div>
        </div>
      </div>
      <el-input class="right" type="textarea" v-model="form.content" rows="7" placeholder="输入文本内容..."
                resize="none"/>
    </div>
    <float-button @captureAndCopyToClipboard="captureAndCopyToClipboard"/>
    <about-page/>
  </div>
</template>

<script setup lang="ts">
import transparent from '@/assets/transparent.png'
import FloatButton from "@/views/home/floatButton.vue";
import AboutPage from "@/views/home/aboutPage.vue";
import {ElMessage} from 'element-plus'
import html2canvas from "html2canvas";

const {ipcRenderer} = require('electron');
const fs = require('fs');
import {ref, onMounted, reactive, watch} from "vue";

const fileInput = ref<HTMLDivElement | null>(null);
const captureContainer = ref<HTMLDivElement | null>(null);
const content = ref<HTMLDivElement | null>(null);

const backgroundMode = ref<string>('color');
const backgroundImage = ref<string>('none');
const positionTop = ref<string>('top');
const imagePaths = ref([])
const form = reactive({
  paddingTop: 0,
  backgroundImage: transparent,
  content: "",
  color: "#000",
  width: 400,
  marginTop: 0,
  height: 400,
  fontSize: 12,
  textAlign: "left",
  backgroundColor: "#fff",
})

const loadImages = () => {
  const directoryPath = 'E:\\projects\\electron-txt2image\\src\\views\\images';
  ipcRenderer.send('read-directory', directoryPath);

  // 监听主进程的响应
  ipcRenderer.on('read-directory-response', (event, response) => {
    if (response.error) {
      console.log(response.error);
    } else {
      imagePaths.value = response;
    }
  });
}

const openFileInput = () => {
  fileInput.value?.click();
}
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.backgroundImage = e.target.result as string;
    };
    reader.readAsDataURL(file);
  }
}
const getRandomBackgroundImage = async () => {
  const filePath =
      imagePaths.value[parseInt(String(Math.random() * imagePaths.value.length))];
  const data = await fs.readFileSync(filePath, 'base64')
  const img = `data:image/jpeg;base64,${data}`
  form.backgroundImage = img;
  return img;
}

const getRandomColor = (key: string) => {
  const r = Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  const g = Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  const b = Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  form[key] = "#" + r + g + b;
}
const captureAndCopyToClipboard = async () => {
  const container = captureContainer.value! as HTMLDivElement;
  const canvas = await html2canvas(container);
  canvas.toBlob((blob) => {
    const item = new ClipboardItem({"image/png": blob});
    navigator.clipboard
        .write([item])
        .then(() => {
          ElMessage.success("截图已复制到剪切板");
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error(err);
        });
  }, "image/png");
}
watch(
    () => positionTop.value,
    (val) => {
      const key = {
        top: 10,
        center: (form.height - content.value!.offsetHeight) / 2,
        bottom: form.height - content.value!.offsetHeight - 10,
        custom: 10,
      };
      form.paddingTop = key[val];
    },
);
watch(
    () => backgroundMode.value,
    (val) => {
      if (val === 'color') {
        form.backgroundImage = transparent
        form.backgroundColor = '#ffffff'
        backgroundImage.value = 'none'
      } else {
        form.backgroundColor = 'transparent'
      }
    },
);
watch(
    () => backgroundImage.value,
    async (val) => {
      const key = {
        none: "",
        random: await getRandomBackgroundImage(),
      };
      form.backgroundImage = key[val];
    },
);
onMounted(() => {
  loadImages()
  ipcRenderer.on('ctrl-c-pressed', () => {
    // captureAndCopyToClipboard()
  });
})
</script>

<style lang="less" scoped>
.home {
  user-select: none;
  background-image: url("../../assets/bg.png");
  background-repeat: repeat;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  padding: 220px 20px 20px;
  .box-out{
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    margin: 0 auto;
    overflow: hidden;
    .box {
      height: 100%;
      width: 100%;
      overflow: hidden;
      position: relative;
    }
  }

  .config {
    width: 100%;
    position: absolute;
    padding: 20px;
    box-sizing: border-box;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    left: 0;
    top: 0;
    background: #fff;
    display: flex;

    .left {
      width: calc(100% - 220px);
      display: flex;
      flex-wrap: wrap;
      margin-right: 20px;

      .control {
        padding-left: 10px;
        padding-top: 4px;

        .txt {
          font-size: 12px;
          color: #606266;
        }

        .mr {
          margin-right: 10px;
        }
      }
    }

    .el-textarea {
      width: 200px;
      height: 100%;
    }

    .el-radio {
      margin-right: 10px;
    }

    .border-bottom {
      border-bottom: 1px solid #ebeefa;
    }

    .border-right {
      border-right: 1px solid #ebeefa;
    }

    .item {
      width: 50%;
      display: flex;
      border-top: 1px solid #ebeefa;
      border-left: 1px solid #ebeefa;
      box-sizing: border-box;

      .title {
        padding: 2px 10px;
        background: #f5f7fa;
        color: #606266;
        width: 90px;
        text-align: left;
        font-size: 14px;
        line-height: 33px;
      }
    }

    .btn {
      margin-left: 10px;
    }
  }
}
</style>
