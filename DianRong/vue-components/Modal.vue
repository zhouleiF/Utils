<template lang="html">
  <div class="modal" v-show="isShow" @touchmove='move'>
    <div class="modal-mask"></div>
    <div class="modal-content" @click.self="clickFullScreen">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'modal',
  props: {
    isFullScreenClose: {
      type: Boolean,
      default: true
    },
    show: {
      type: Boolean,
      default: false
    },
    afterClose: {
      type: Function
    },
    // 是否禁止弹窗后屏幕滑动， 0 不禁止  1 通过设置body为fixed禁止  2 通知touchmove默认行为禁止
    forbidden: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isShow: this.show,
      scrollTop: 0
    }
  },
  watch: {
    show(v, o) {
      if (v !== o) this.isShow = v
    },
    isShow(v, o) {
      if (this.forbidden !== 1) return
      if (v !== o) {
        if (v) {
          this.scrollTop = document.scrollingElement.scrollTop
          document.body.classList.add('fixed')
          document.body.style.top = -this.scrollTop + 'px'
        }
        else {
          document.body.classList.remove('fixed')
          document.scrollingElement.scrollTop = this.scrollTop
        }
      }
    }
  },
  methods: {
    clickFullScreen() {
      this.isFullScreenClose && this.close()
    },
    close() {
      this.isShow = false
      this.afterClose && this.afterClose()
    },
    move(e) {
      if (this.forbidden === 2) {
        e.preventDefault()
      }
    }
  }
}
</script>

<style lang="css">
.modal-mask, .modal-content {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.modal-mask {
  background-color: rgba(0,0,0,.6);
  z-index: 99
}
.modal-content {
  z-index: 100;
  background-color: transparent
}
</style>
