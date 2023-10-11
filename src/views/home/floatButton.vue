<template>
  <div class="move" @mousedown="startDrag" :style="{ left: left + 'px', top: top + 'px' }"/>
</template>

<script>
export default {
  data() {
    return {
      isDragging: false,
      clickFlag: new Date().getTime(),
      offsetX: 0,
      offsetY: 0,
      left: 800,
      top: 220,
    };
  },
  methods: {
    copy () {
      this.$emit('captureAndCopyToClipboard')
    },
    startDrag(e) {
      this.isDragging = true;
      this.offsetX = e.clientX - this.left;
      this.offsetY = e.clientY - this.top;
      this.clickFlag = new Date().getTime()

      document.addEventListener("mousemove", this.drag);
      document.addEventListener("mouseup", this.stopDrag);
    },
    drag(e) {
      if (this.isDragging) {
        const t = window.innerWidth - 100;
        const a = window.innerHeight - 80;

        let r = e.clientX - this.offsetX;
        let o = e.clientY - this.offsetY;

        // 限制拖动范围
        r = Math.min(Math.max(0, r), t);
        o = Math.min(Math.max(200, o), a);

        this.left = r;
        this.top = o;
      }
    },
    stopDrag() {
      this.isDragging = false;

      // 移除全局事件监听器
      document.removeEventListener("mousemove", this.drag);
      document.removeEventListener("mouseup", this.stopDrag);
      if (new Date().getTime() - this.clickFlag < 200) {
        this.copy();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.move {
  cursor: pointer;
  position: fixed;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-image: url("../../assets/copy.png");
  background-size: contain;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}
</style>
