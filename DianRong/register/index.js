import $ from 'Jquery'
$.ajaxSettings.crossDomain = !0
$.ajaxSettings.xhrFields = {
  withCredentials: !0
}
/**
*  params
*    debug  boolean 是否开启调试模式（跳过接口调用）
*    hasPassword boolean 是否注册需要密码 默认为true
*    phoneReg RegExp
*/
export default class Register {
  constructor(params) {
    this.debug = params.debug || false  // debug模式可跳过接口
    this.hasPassword = params.hasPassword && true // 是否需要输入密码
    this.isGraphTest = params.isGraphTest || false // 是否是图形验证 默认不是
    this.phoneReg = params.phoneReg || /^(13|15|17|18)\d{9}$/ // 手机号码正则匹配规则
    this.passwordReg = params.passwordReg || /^.*([0-9].*[a-zA-Z]|[a-zA-Z].*[0-9]).*$/ // 密码正则匹配规则
    // 调用注册接口create api时可变传参
    this.callCreateAPIData = params.callCreateAPIData || {}
    // 调用发送验证码 fetchverifycode api时可选传参
    this.callVerifyAPIData = params.callVerifyAPIData || {}
    this.productionAjaxUrl = params.productionAjaxUrl || 'https://borrower.dianrong.com' // 生产环境接口域名
    this.developmentAjaxUrl = params.developmentAjaxUrl || 'https://cashloan-demo.dianrong.com' // 开发环境接口域名
    this.userPhoneInputQuery = params.userPhoneInputQuery || '#userPhoneInput' // 手机号输入框选择器
    this.passwordInputQuery = params.passwordInputQuery || '#passwordInput' // 密码输入框选择器
    this.graphCodeInputQuery = params.graphCodeInputQuery || '#graphCodeInput' // 图形验证码选择器
    // 图形验证图片container
    this.graphContainerQuery = params.graphContainerQuery || '#graphContainer'
    this.geetestCaptchaQuery = params.geetestCaptchaQuery || '#geetestCaptcha' // 极限验证容器选择器
    this.sendPhoneCodeBtnQuery = params.sendPhoneCodeBtnQuery || '#sendPhoneCodeBtn' // 发送验证码按钮选择器
    this.registerAccountBtnQuery = params.registerAccountBtnQuery || '#registerAccountBtn' // 注册按钮选择器
    this.errorMsgQuery = params.errorMsgQuery || '.errorMsg' // 错误提示容器选择器
    this.phoneVerifyCodeInputQuery = params.phoneVerifyCodeInputQuery || '#phoneVerifyCodeInput' // 验证码输入框选择器
    this.protocolCheckboxQuery = params.protocolCheckboxQuery || '#agreinp' // 验证码输入框选择器
    // 发送验证码成功回调
    this.sendCodeSuccess = params.sendCodeSuccess ? params.sendCodeSuccess.bind(this) : this.sendCodeSuccess.bind(this)
    // 发送验证码失败回调
    this.sendCodeFail = params.sendCodeFail ? params.sendCodeFail.bind(this) : this.sendCodeFail.bind(this)
    // 重置方法
    this.reset = params.reset ? params.reset.bind(this) : this.reset.bind(this)
    this.registerSuccess = params.registerSuccess ? params.registerSuccess.bind(this) : function() {} // 成功回调
    // 文案
    this.msgs = {
      sendPhoneCodeBtnText: '注册拿券',
      ...params.msgs
    }
    // 报错信息
    this.errorMsgs = {
      phoneNull: '手机号不能为空',
      phoneUnvalid: '手机号格式不正确，请重新输入',
      passwordNull: '密码不能为空',
      passwordUnvalid: '密码须为8个以上字符和数字组合',
      hasRegistered: '您已经注册过点融账户，请直接下载“钱急送”完成申请',
      verifyFailed: '验证失败，请稍后再试',
      incomplete: '请将信息填写完整',
      notAgreeProtocal: '请阅读并同意以上条款',
      repeatSubmit: '请不要重复提交',
      captchaNull: '验证码不能为空',
      registerFailed: '注册失败，请稍后再试',
      graphCodeNull: '图形验证码不能为空',
      ...params.errorMsgs
    }
    this.getPhoneCodeBtnVaild = true // 短信验证码按钮是否可用
    this.regBtnValid = true // 提交按钮是否有效
    this.isValidate = false // 是否极验
    this.captchaData = {} // 验证码
    this.captchaObj = {} // 极验obj
    this.servicesEndpoint = process.env.NODE_ENV === 'production'
            ? this.productionAjaxUrl
            : this.developmentAjaxUrl
    this.init = this.init.bind(this)
    this.bindEvents = this.bindEvents.bind(this)
    this.geetest = this.geetest.bind(this)
    this.showErrorMsg = this.showErrorMsg.bind(this)
    this.checkForm = this.checkForm.bind(this)
    this.geetest = this.geetest.bind(this)
    this.sendPhoneCode = this.sendPhoneCode.bind(this)
    this.registerAccount = this.registerAccount.bind(this)
  }
  init() {
    // input和btn们
    function getDom(arr) {
      arr.forEach(e => {
        this[e] = $(this[`${e}Query`])
      })
    }
    getDom.bind(this)([
      'userPhoneInput',
      'passwordInput',
      'geetestCaptcha',
      'sendPhoneCodeBtn',
      'registerAccountBtn',
      'errorMsg',
      'phoneVerifyCodeInput',
      'protocolCheckbox',
      'graphCodeInput',
      'graphContainer'
    ])
    this.objPara = this.getUrlObj() // 获取url后面的参数
    this.bindEvents() // 绑定事件
    if (this.isGraphTest) {
      this.graphTest()
    }
    else {
      this.geetest()
    }
  }

    // 获取url后面的参数，并封装成json
  getUrlObj(url = window.location.href.replace(/&amp;/g, "&")) {
    let _ind = url.indexOf('?'),
      _arr = url.slice(_ind + 1).split('&'),
      _objPara = {}
    for (let i = 0, k = _arr.length; i < k; i++) {
      let _ar = _arr[i].split('=')
      _objPara[_ar[0].toLocaleLowerCase()] = _ar[1]
    }
    return _objPara
  }

    // 显示错误信息
  showErrorMsg(msg, dom = this.errorMsg) {
    dom.html(msg).show()
    // setTimeout(function() {
    //   dom.hide()
    // }, 4000)
  }

  // 重置 恢复到init状态
  reset() {
    const that = this
    this.errorMsg.hide()
    this.sendPhoneCodeBtn.unbind('click')
    if (typeof this.sendPhoneCodeBtn.text === 'function') {
      this.sendPhoneCodeBtn.text(this.msgs.sendPhoneCodeBtnText)
    }
    else {
      this.sendPhoneCodeBtn.text = this.msgs.sendPhoneCodeBtnText
    }
    this.sendPhoneCodeBtn.on('click', function() {
      that.sendPhoneCode()
      if (that.debug) that.sendCodeSuccess()
    })
  }

    // 表单校验
  checkForm(type, val) {
    switch (type) {
      case 'phone':
        if (!val) {
          this.showErrorMsg(this.errorMsgs.phoneNull)
          return false
        } else if (!val.match(this.phoneReg)) {
          this.showErrorMsg(this.errorMsgs.phoneUnvalid)
          return false
        }
        return true
      case 'password':
        if (!val) {
          this.showErrorMsg(this.errorMsgs.passwordNull)
          return false
        } else if (!val.match(this.passwordReg) || val.length < 8) {
          this.showErrorMsg(this.errorMsgs.passwordUnvalid)
          return false
        }
        return true
      case 'captcha':
        if (!val) {
          this.showErrorMsg(this.errorMsgs.captchaNull)
        }
        return !!val
                // 礼券
      case 'promotion':
        return !!val
      case 'protocal':
        if (!val)
          this.showErrorMsg(this.errorMsgs.notAgreeProtocal)
        return val
    }
  }

    // 极限验证
  geetest() {
    let that = this
    function handler(captchaObj) {
      that.captchaObj = captchaObj
      captchaObj.onSuccess(function() {
        that.isValidate = true
        that.captchaData = captchaObj.getValidate()
        that.geetestCaptcha.parent().fadeOut() // 图片消失
        that.geetestCaptcha.html('')
                // 验证成功后开始发请求
        that.sendPhoneCode()
      })

      captchaObj.onRefresh(function() {
        that.isValidate = false
        that.captchaData = {}
      })

      captchaObj.onReady(function() {})
      captchaObj.appendTo(that.geetestCaptcha)
      captchaObj.onError(function() {
        that.geetestCaptcha.parent().fadeOut() // 图片消失
        that.geetestCaptcha.html('')
        that.updateTest()
      })
    }

    $.ajax({
      url: this.servicesEndpoint + '/api/v2/captcha/init',
      type: 'GET',
      data: {
        'geetype': 'WEB',
        'clientType': 'WEB',
        't': (new Date()).getTime()
      },
      dataType: 'json',
      success: function(res) {
        let data = res.content.geetest
        window.initGeetest({
          gt: data.gt,
          challenge: data.challenge,
          product: 'embed',
          sandbox: true
        }, handler)
        that.isValidate = false
      }
    })
  }
  // 更新极验
  updateGeetest() {
    // this.captchaObj.reset && this.captchaObj.reset()
    this.geetest()
  }

  // 更新图形验证码
  updateGraph() {
    this.graphContainer.html('')
    this.graphContainer.html(`<img src="${this.servicesEndpoint}/images/captcha.jpg?t=${(new Date()).getTime()}" />`)
  }

  // 更新验证
  updateTest() {
    this.isGraphTest ? this.updateGraph() : this.updateGeetest()
  }
  // 图形验证
  graphTest() {
    this.updateGraph()
  }
    // 发送手机验证码
  sendPhoneCode(callback) {
    // 校验手机号
    if (!this.checkForm("phone", this.userPhoneInput.val())) return false
    // 如果在倒计时中，则不响应
    if (!this.getPhoneCodeBtnVaild) return false
    // 极验
    if (!this.isGraphTest) {
      if (!this.isValidate) {
        this.geetestCaptcha.parent().fadeIn()
        return false
      }
    }
    else {
      // 图形验证
      if (!this.graphCodeInput.val()) {
        this.showErrorMsg(this.errorMsgs.graphCodeNull)
      }
    }
    let phoneNum = this.userPhoneInput.val(),
      that = this,
      data = {
        'emailOrPhone': phoneNum,
        'clientType': 'WEB',
        'type': 'create',
        ...this.callVerifyAPIData
      }
    if (!this.isGraphTest) {
      data.geetestChallenge = that.captchaData.geetest_challenge
      data.geetestValidate = that.captchaData.geetest_validate
      data.geetestSeccode = that.captchaData.geetest_seccode
    }
    else {
      data.captcha = that.graphCodeInput.val()
    }
        // 发请求获取验证码
    $.ajax({
      type: "post",
      url: this.servicesEndpoint + "/api/v2/users/fetchverifycode",
      data,
      success(response) {
        response.result === 'success' ? that.sendCodeSuccess(response) : that.sendCodeFail(response)
        callback && callback(response.code)
      },
      error() {
        // (!that.isGraphTest) && that.geetest()
        that.updateTest()
        that.showErrorMsg(that.errorMsgs.verifyFailed)
      }
    })
  }

  sendCodeSuccess(response) {
    const that = this
    // 成功
    this.getPhoneCodeBtnVaild = false // 马上作标记以免重复提交
    // 成功之后开始倒记时
    let _countNum = 60,
      PhoneCodeTime = setInterval(function() {
        if (_countNum > 0) {
          let _tex = --_countNum + '秒后重发'
          if (typeof that.sendPhoneCodeBtn.text === 'function') {
            that.sendPhoneCodeBtn.text(_tex)
          }
          else {
            that.sendPhoneCodeBtn.text = _tex
          }
        } else {
          clearInterval(PhoneCodeTime)
          that.getPhoneCodeBtnVaild = true
          that.updateTest()
          if (typeof that.sendPhoneCodeBtn.text === 'function') {
            that.sendPhoneCodeBtn.text('重新发送')
          }
          else {
            that.sendPhoneCodeBtn.text = '重新发送'
          }
        }
      }, 1000)
  }

  sendCodeFail(response) {
    (!this.isGraphTest) && this.geetest()
    if (typeof response === 'string') response = window.JSON.parse(response)
    let txt = response.errors.toString()
    if (txt.indexOf('已绑定') > -1) {
      // 手机号已注册
      this.showErrorMsg(this.errorMsgs.hasRegistered)
      if (typeof this.sendPhoneCodeBtn.text === 'function') {
        this.sendPhoneCodeBtn.text('下载App')
      }
      else {
        this.sendPhoneCodeBtn.text = '下载App'
      }
      this.sendPhoneCodeBtn.unbind('click')
      this.sendPhoneCodeBtn.click(function() {
        window.location.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.dianrong.cashloan'
      })
      return false
    }
    this.showErrorMsg(txt)
  }

    // 完成注册
  registerAccount(callback) {
        // 防止重复提交
    if (!this.regBtnValid) {
      this.showErrorMsg(this.errorMsgs.repeatSubmit)
      return false
    }
    let phone = this.userPhoneInput.val(),
      phoneCode = this.phoneVerifyCodeInput.val(),
      password = this.passwordInput.val(),
      agreinp = this.protocolCheckbox.prop('checked')
        // 校验手机号
    if (!this.checkForm("phone", phone))
      return false
            // 校验密码
    if (this.hasPassword) {
      if (!this.checkForm("password", password)) return false
    }
            // 验证码校验
    if (!this.checkForm("captcha", phoneCode))
      return false
            // 校验协议
    if (!this.checkForm("protocal", agreinp))
      return false
    let urlPara = this.objPara,
      referralKey = urlPara.referralkey,
      that = this,
      data = {
        'regPhone': phone.trim(),
        'regPhoneResponseCode': phoneCode.trim(),
        'referralKey': referralKey,
        ...this.callCreateAPIData
      }
    if (this.hasPassword) data['password'] = password.trim()
    this.regBtnValid = false
    $.ajax({
      type: "post",
      url: that.servicesEndpoint + "/api/v2/borrower/create",
      data,
      success(response) {
        that.regBtnValid = true
        let _cod = response.code
        if (callback) {
          callback(_cod)
          return false
        }
        if (response.result === 'success') {
                    // 注册成功处理程序
          that.registerSuccess()
        } else {
          that.showErrorMsg(response.errors.toString())
                    // 1111000 图形验证码错误, 这里认为已经输错3次了
          if (_cod === 1111000) {
            that.updateTest()
            that.geetestCaptcha.html('').parent().fadeIn()
          }
        }
      },
      error() {
        that.regBtnValid = true
        that.showErrorMsg(that.errorMsgs.registerFailed)
      }
    })
  }

    // 绑定事件和tab有关的交互
  bindEvents() {
    let that = this
    this.phoneVerifyCodeInput.focus(() => {
      that.errorMsg.hide()
    })
    this.graphCodeInput.focus(() => {
      that.errorMsg.hide()
    })
        // 校验手机
    this.userPhoneInput.focus(() => {
      that.reset()
    }).blur(function() {
      that.checkForm("phone", $(this).val())
    })
        // 校验密码
    this.passwordInput.focus(function() {
      that.errorMsg.hide()
    }).blur(function() {
      that.checkForm("password", $(this).val())
    })
        // 发送手机验证码
    this.sendPhoneCodeBtn.on('click', function() {
      that.sendPhoneCode()
      if (that.debug) that.sendCodeSuccess()
    })
        // 完成注册
    this.registerAccountBtn.on('click', function(e) {
      that.registerAccount()
      if (that.debug) that.registerSuccess()
    })
    // 图形验证码点击刷新
    this.graphContainer && this.graphContainer.on('click', function() {
      that.updateTest()
    })
  }
}
