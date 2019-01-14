<template lang="html">
  <div>
    <transition name="fade">
      <div class="toast" v-show="isShow" @click="closeToast">
        <div class="">
          <slot></slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'modal',
  props: {
    signal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShow: this.signal,
      scrollTop: 0
    }
  },
  watch: {
    signal(v, o) {
      if (v !== o) this.isShow = true
      this.timeout = window.setTimeout(() => {
        this.isShow = false
      }, 3000)
    }
  },
  methods: {
    closeToast() {
      this.isShow = false
      window.clearTimeout(this.timeout)
    }
  }
}
</script>

<style lang="css">
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-to {
  opacity: 0
}
.toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  z-index: 10;
}
.toast div {
  margin: auto;
  background-color: rgba(0,0,0,.6);
  color: #fff;
  font-size: .36rem;
  line-height: 2;
  padding: .1rem .4rem;
  max-width: 6rem;
  border-radius: .4rem;
  text-align: center;
}
</style>
