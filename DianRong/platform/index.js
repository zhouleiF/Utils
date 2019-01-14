// 获取终端相关信息

/**
获取终端类型
@return JSON {
    IE      boolean 是否是ie内核
    opera   boolean 是否是opera内核
    webKit  boolean 是否是webkit内核
    firefox boolean 是否是火狐内核
    mobile  boolean 是否为移动终端
    ios     boolean 是否是ios端
    android boolean 是否是android端
    iPhone  boolean 是否为iphone或者QQHD浏览器
    iPad    boolean 是否是iPad
    safari  boolean 是否是safari
    weixin  boolean 是否是微信
    qq      boolean 是否是qq
}
*/
function getBrowserType() {
  let u = navigator.userAgent.toLowerCase()
  return {
    IE: u.indexOf('trident') > -1, // IE内核
    opera: u.indexOf('presto') > -1, // opera内核
    webKit: u.indexOf('applewebkit') > -1, // 苹果、谷歌内核
    firefox: u.indexOf('gecko') > -1 && u.indexOf('khtml') === -1, // 火狐内核
    mobile: !!u.indexOf(/applewebkit.*mobile.*/) > -1, // 是否为移动终端
    ios: !!u.match(/\(i[^;]+; cpu.+mac os x/) > -1, // ios终端
    os: !!u.match(/\(i[^;]+; intel mac os x/) > -1, // mac os终端
    android: u.indexOf('android') > -1, // android终端或者uc浏览器
    iPhone: u.indexOf('iphone') > -1, // 是否为iPhone
    iPad: u.indexOf('ipad') > -1, // 是否iPad
    mac: u.indexOf('macintosh') > -1, // 是否是mac
    weixin: u.indexOf('micromessenger') > -1 // 是否微信 （2015-01-22新增）
        // qq: u.match(/\sqq/i) === ' qq' // 是否QQ
  }
}

// 是否是ios
function isIos() {
  return getBrowserType().ios
}

// 是否是android
function isAndroid() {
  return getBrowserType().android
}

// 是否是微信
function isWechat() {
  return getBrowserType().weixin
}

export default {
  getBrowserType,
  isIos,
  isAndroid,
  isWechat
}
