<template lang="html">
  <div>
    <modal :forbidden='2' :show="isShow && isInit" :isFullScreenClose="false" :afterClose="close">
      <div id="gtBox"></div>
    </modal>
  </div>
</template>

<script>
import { request } from 'DianRong'
import Modal from './Modal.vue'
export default {
  props: {
    showErrorMsg: {
      type: Function
    },
    afterClose: {
      type: Function
    },
    proOrigin: {
      type: String,
      default: window.location.origin
    },
    devOrigin: {
      type: String,
      default: window.location.origin
    },
    requestParams: {
      type: Object,
      default() {
        return {
          'geetype': 'WEB',
          'clientType': 'WEB',
          't': (new Date()).getTime()
        }
      }
    },
    show: {
      type: Boolean,
      default: false
    },
    onSuccess: {
      type: Function
    },
    onError: {
      type: Function
    }
  },
  data() {
    return {
      origin: process.env.NODE_ENV === 'production' ? this.proOrigin : this.devOrigin,
      initAPI: '/api/v2/captcha/init',
      isInit: false,
      isShow: this.show
    }
  },
  watch: {
    show(v, o) {
      if (v !== o) this.isShow = v
    }
  },
  components: {
    Modal
  },
  methods: {
    update() {
      setTimeout(() => {
        document.querySelector('.gt_refresh_button').dispatchEvent(new Event('click'))
      }, 500)
      this.isInit = true
    },
    close() {
      this.isInit = false
      this.isShow = false
      this.afterClose && this.afterClose()
    }
  },
  mounted() {
    const gt = document.createElement('script')
    gt.src = 'https://www.dianrong.com/mkt/sources/js/gt.js'
    document.head.appendChild(gt)
    gt.onload = () => {
      request.get(this.origin + this.initAPI, {
        params: this.requestParams
      }).then((res) => {
        res = res.data || {}
        if (res.result === 'success') {
          if (!res.content || !res.content.geetest) return
          window.initGeetest({
            gt: res.content.geetest.gt,
            challenge: res.content.geetest.challenge,
            product: 'embed',
            sandbox: true
          }, (captcha) => {
            this.captcha = captcha
            captcha.appendTo('#gtBox')
            captcha.onSuccess((data) => {
              this.close()
              this.captchaData = captcha.getValidate()
              // 验证成功执行
              this.onSuccess && this.onSuccess(this.captchaData)
            })
            captcha.onError(() => {
              this.close()
              this.update()
              // 验证失败执行
              this.onError && this.onError(this.captchaData)
            })
          })
          this.isInit = true
        }
        else {
          if (this.showErrorMsg) this.showErrorMsg('接口获取失败，请刷新重试')
          else alert('接口获取失败，请刷新重试')
        }
      }).catch(() => {
        if (this.showErrorMsg) this.showErrorMsg('接口获取失败，请刷新重试')
        else alert('接口获取失败，请刷新重试')
      })
    }
  }
}
</script>

<style lang="css">
#gtBox {
  box-sizing: border-box;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateY(-50%) translateX(-50%);
  -webkit-transform: translateY(-50%) translateX(-50%);
}
</style>
