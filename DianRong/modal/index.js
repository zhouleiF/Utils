/** 基础弹窗功能 包含黑色背景及背景上的全屏窗口，将内容append进窗口内
@params JSON {
    id string 弹窗id 可选
    className string 弹窗className 可选
    content Object 弹窗内容 可选
    beforeShow function 弹窗显示前钩子
    afterShow function 弹窗显示后钩子
    beforeHidden function 弹窗隐藏前钩子
    beforeHidden function 弹窗隐藏后钩子
    closeCallback 关闭后回调
    isFullScreenClose boolean 是否全屏点击任意地方都会关闭弹窗 默认false
}
*/
class Modal {
  constructor(params) {
    Object.assign(this, params)
    this.init()
  }
  init() {
    this.maskNode = document.querySelector('.mask')
    this.modalNode = document.querySelector(`#${this.id}`) || document.querySelector(`.${this.className}`)
    if (!this.modalNode && !this.content) {
      return
    }
    if (!this.maskNode) {
          // 创建并显示mask
      this.maskNode = document.createElement('div')
      this.maskNode.className = 'mask'
      this.maskNode.style.position = 'fixed'
      this.maskNode.style.backgroundColor = 'rgba(0,0,0,.6)'
      this.maskNode.style.top = 0
      this.maskNode.style.right = 0
      this.maskNode.style.left = 0
      this.maskNode.style.bottom = 0
      this.maskNode.style.visibility = 'hidden'
      this.maskNode.style.zIndex = '99'
      document.body.appendChild(this.maskNode)
    }
    if (!this.modalNode) {
      this.modalNode = document.createElement('div')
      this.modalNode.className = 'modal'
      this.modalNode.style.position = 'fixed'
      this.modalNode.style.backgroundColor = 'transparent'
      this.modalNode.style.top = 0
      this.modalNode.style.right = 0
      this.modalNode.style.left = 0
      this.modalNode.style.bottom = 0
      this.modalNode.style.visibility = 'hidden'
      this.modalNode.style.zIndex = '100'
      if (this.id) {
        this.modalNode.id = this.id
      }
      if (this.className) {
        this.modalNode.className = this.className
      }
      this.modalNode.innerHTML = this.content
      const that = this
      this.modalNode.addEventListener('touchend', e => {
        if (e.target !== that.modalNode && !that.isFullScreenClose) {
          return
        }
        that.hidden()
      }, true)
      document.body.appendChild(this.modalNode)
    }
  }
  show() {
    this.beforeShow && typeof this.beforeShow === 'function' && this.beforeShow()
    this.maskNode.style.visibility = 'visible'
    this.modalNode.style.visibility = 'visible'
    this.afterShow && typeof this.afterShow === 'function' && this.afterShow()
  }
  hidden() {
    this.beforeHidden && typeof this.beforeHidden === 'function' && this.beforeHidden()
    this.maskNode.style.visibility = 'hidden'
    this.modalNode.style.visibility = 'hidden'
    this.afterHidden && typeof this.afterHidden === 'function' && this.afterHidden()
  }
  appendChild(node) {
    node && node.nodeType && this.modalNode.appendChild(node)
  }
  innerHTML(content) {
    this.modalNode.innerHTML = content
  }
}

function newModal(params) {
  return new Modal(params)
}

export default {
  newModal
}
