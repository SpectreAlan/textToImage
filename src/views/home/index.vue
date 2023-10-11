

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
      backgroundImage: "backgroundImage",
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
