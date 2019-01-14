// 页面自适应
function adaptive(rules = function() {}) {
  // let resizeEvt = 'orientationchange' in window
  //       ? 'orientationchange'
  //       : 'resize'
  function recalc() {
    document.documentElement.style.fontSize = `${document.documentElement.clientWidth / 7.5}px`
    rules()
  }
  document.addEventListener('DOMContentLoaded', recalc, false)
}

// 根据host判断当前环境 imcoming--测试环境 anlaiye--正式环境
function getEnv() {
  let host = window.location.host
  if (host.indexOf('anlaiye') > -1) {
    return 'production'
  }
  return 'debug'
}

// 注册事件处理程序兼容处理 兼容IE9以下
function addEvent(target, type, handler) {
  if (target.addEventListener) {
    target.addEventListener(type, handler, false)
  } else {
    target.attachEvent(`on${type}`, event => {
      return handler.call(target, event)
    })
  }
}

/* 动态加载文件，返回promise
@params  json{
            type String 文件类型
            url  String 文件url
            callback Fuc 加载完成后回调函数
        }
@return Promise resolve 加载完成回调
                reject 加载失败回调
*/
function ayscLoadFile(params = {}) {
  params = {
    type: 'script',
    ...params
  }
  let {url, type, callback} = params
  if (!url) {
    return
  }
  switch (type) {
    case 'script':
      {
        let script = document.createElement('script')
        script.src = url
        document.getElementsByTagName('head')[0].appendChild(script)
        if (callback) {
          addEvent(script, 'load', callback)
          return
        }
        return new Promise((resolve, reject) => {
          addEvent(script, 'load', resolve)
          addEvent(script, 'error', reject)
        })
      }
  }
}

// 动态加载魔窗js
function ayscLoadMlink(callback) {
  ayscLoadFile({type: 'script', url: 'https://s.mlinks.cc/scripts/dist/mlink.min.js', callback})
}

// 动态加载微信分享js
function ayscLoadWXShare(callback) {
  ayscLoadFile({type: 'script', url: 'https://res.wx.qq.com/open/js/jweixin-1.0.0.js', callback})
}

/** 预加载图片
@params JSON {
    imgs Array 图片路径数组
    domain String 图片路径补全
    callback Function 全部加载完成的回调函数
}
*/
function preLoadImgs(params = {}) {
  let loadedNum = 0,
    {imgs, domain, callback} = params
  imgs.map(img => {
    let imgNode = document.createElement('img')
    imgNode.src = domain ? domain + img : img
    imgNode.onload = () => {
      loadedNum++
      if (loadedNum >= imgs.length) {
        if (callback && typeof callback === 'function') {
          callback()
        }
      }
      imgNode = null
    }
  })
}

// 获取url传参
function getQueryString(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'),
    r = window.location.search.substr(1).match(reg)
  if (r != null) {
    return decodeURIComponent(r[2])
  }
  return null
}

// 获取当前项目path 列： demo/react_project
function getProjectUrl() {
  let pathname = window.location.pathname,
    projectTpl = require('../../../config').ProjectTpl
  pathname = pathname.substring(0, pathname.indexOf(projectTpl)) + projectTpl
  if (pathname.indexOf('build') === 1) {
    pathname = pathname.replace('/build/', '')
  }
  return pathname
}

// 识别是否是竖屏
function isVerticalScreen() {
  return window.orientation === 0
}

// test
function test() {
  alert('this is a test info')
}

export default {
  adaptive,
  getEnv,
  ayscLoadFile,
  ayscLoadMlink,
  ayscLoadWXShare,
  addEvent,
  getQueryString,
  getProjectUrl,
  preLoadImgs,
  isVerticalScreen,
  test
}
