<template>
  <div class="home">
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
    <el-form ref="form" :model="form" label-width="90px">
      <el-form-item label="文字内容">
        <el-input type="textarea" v-model="form.content" autosize/>
      </el-form-item>
      <el-form-item label="文字大小">
        <el-input-number v-model="form.fontSize" :min="12"/>
      </el-form-item>
      <el-form-item label="文本对齐">
        <el-radio-group v-model="form.textAlign">
          <el-radio label="left">左对齐</el-radio>
          <el-radio label="center">居中对齐</el-radio>
          <el-radio label="right">右对齐</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="文本位置">
        <el-radio-group v-model="positionTop">
          <el-radio label="top">顶部</el-radio>
          <el-radio label="center">居中</el-radio>
          <el-radio label="bottom">底部</el-radio>
          <el-radio label="custom">自定义</el-radio>
        </el-radio-group>
        <el-input-number
            v-if="positionTop === 'custom'"
            class="btn"
            v-model="form.paddingTop"
            :min="10"
        />
      </el-form-item>
      <el-form-item label="文字颜色">
        <el-color-picker v-model="form.color"></el-color-picker>
        <el-button
            type="primary"
            class="btn"
            @click="getRandomColor('color')"
            size="small"
        >随机获取颜色
        </el-button
        >
      </el-form-item>
      <el-form-item label="背景模式">
        <el-radio-group v-model="backgroundMode">
          <el-radio label="color">纯色</el-radio>
          <el-radio label="image">图片</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="backgroundMode === 'color'" label="背景颜色">
        <el-color-picker v-model="form.backgroundColor"></el-color-picker>
        <el-button
            type="primary"
            class="btn"
            @click="getRandomColor('backgroundColor')"
            size="small"
        >随机获取颜色
        </el-button>
      </el-form-item>
      <el-form-item v-else label="背景图片">
        <el-radio-group v-model="backgroundImage">
          <el-radio label="none">无</el-radio>
          <el-radio label="random">内置背景图</el-radio>
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
        <div v-if="backgroundImage === 'custom'">
          <input
              type="file"
              ref="fileInput"
              @change="handleFileChange"
              style="display: none"
          />
          <el-button
              class="btn"
              size="small"
              type="primary"
              @click="openFileInput"
          >选择图片
          </el-button
          >
        </div>
      </el-form-item>
      <el-form-item label="图片宽度">
        <el-input-number v-model="form.width" :min="40" :step="10"/>
      </el-form-item>
      <el-form-item label="图片高度度">
        <el-input-number v-model="form.height" :min="40" :step="10"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="captureAndCopyToClipboard"
        >截图并复制到剪切板
        </el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import html2canvas from "html2canvas";

const {ipcRenderer} = require('electron');

const fs = require('fs');
const path = require('path');

export default {
  data() {
    return {
      backgroundMode: 'color',
      imagePaths: [],
      backgroundImage: "none",
      positionTop: "top",
      form: {
        backgroundImage: '',
        content: "",
        color: "#000",
        width: 400,
        marginTop: 0,
        height: 400,
        fontSize: 12,
        textAlign: "left",
        backgroundColor: "#fff",
      },
    };
  },
  mounted() {
    this.loadImages();
  },
  methods: {
    loadImages() {
      const directoryPath = 'E:\\projects\\electron-txt2image\\src\\views\\images';
      ipcRenderer.send('read-directory', directoryPath);

      // 监听主进程的响应
      ipcRenderer.on('read-directory-response', (event, response) => {
        if (response.error) {
          console.log(response.error);
        } else {
          console.log(response);
          this.imagePaths = response;
        }
      });
    },
    openFileInput() {
      // 打开文件选择对话框
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        // 读取选定的文件并将其作为背景图
        const reader = new FileReader();
        reader.onload = (e) => {
          this.form.backgroundImage = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async getRandomBackgroundImage() {
      const filePath =
          this.imagePaths[parseInt(Math.random() * this.imagePaths.length)];
      const data = fs.readFileSync(filePath, 'base64')
      const img = `data:image/jpeg;base64,${data.toString('base64')}`
      this.form.backgroundImage = img;
      return img;
    },
    getRandomColor(key) {
      const r = Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0");
      const g = Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0");
      const b = Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0");
      this.form[key] = "#" + r + g + b;
    },
    async captureAndCopyToClipboard() {
      const container = this.$refs.captureContainer;

      // 使用HTML2Canvas库截取容器内容
      const canvas = await html2canvas(container);

      // 将Canvas内容转换为Blob对象，指定MIME类型为image/png
      canvas.toBlob((blob) => {
        // 创建一个ClipboardItem对象，指定MIME类型
        const item = new ClipboardItem({"image/png": blob});

        // 复制文件到剪切板
        navigator.clipboard
            .write([item])
            .then(() => {
              this.$message.success("截图已复制到剪切板");
            })
            .catch((err) => {
              console.log(err);
              this.$message.error(err);
            });
      }, "image/png");
    },
  },
  watch: {
    positionTop: {
      handler(val) {
        const key = {
          top: 10,
          center: (this.form.height - this.$refs.content.offsetHeight) / 2,
          bottom: this.form.height - this.$refs.content.offsetHeight - 10,
          custom: 10,
        };
        this.form.paddingTop = key[val];
      },
    },
    backgroundImage: {
      async handler(val) {
        const key = {
          none: "",
          random: await this.getRandomBackgroundImage(),
        };
        this.form.backgroundImage = key[val];
      },
    },
    backgroundMode: {
      handler(val) {
        if (val === 'color') {
          this.form.backgroundImage = ''
          this.form.backgroundColor = '#ffffff'
          this.backgroundImage = 'none'
        } else {
          this.form.backgroundColor = 'transparent'
        }
      },
    },
  },
};
</script>

<style lang="less" scoped>
.home {
  padding: 20px;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100vh;

  .box {
    box-sizing: border-box;
    padding: 10px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    position: relative;

    .content {
      width: 100%;
      height: 100%;
    }
  }

  .el-form {
    position: absolute;
    padding: 20px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    right: 20px;
    top: 20px;
    background: #fff;

    .btn {
      margin-left: 20px;
    }
  }
}
</style>
