// 添加微信分享官方js文件
var wxSrc = document.createElement('script');
wxSrc.src = 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js';
wxSrc.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(wxSrc);
/*  
   type: 1 正式  2测试
   微信分享方法调用
   url: 调用后端接口 测试地址：http://special.imcoming.com.cn/api/share/share/
                   正式地址：http://special.anlaiye.com.cn/api/share/share/
   params: 分享的内容 {
       img: 'http://res.anlaiye.com.cn/fullcoupon/styles/images/icon.jpg',
       link: 'http://res.anlaiye.com.cn/fullcoupon/index.html',
       desc: '红包多如猴毛，智能堪比猴脑，速度赛过猴跑的俺来也2.0新版本驾到！',
       title: '2.0新版强势登陆 新用户立享超级礼包，你猴得住吗？',
       // appid: 'wx9ccba086952bfc83'   
       appid: 'wxf588a9a2d80172ca' //测试
     };
    callback: 分享成功的回调函数
 */
function alywx(type,params,callback){
    /*
      自定义分享的内容
      img: 图标
      link: 链接
      desc: 详细描述
      title: 名称
      appid: 公众号id 
    
    // var weixinDict = {
    //   img: 'http://res.anlaiye.com.cn/fullcoupon/styles/images/icon.jpg',
    //   link: 'http://res.anlaiye.com.cn/fullcoupon/index.html',
    //   desc: '红包多如猴毛，智能堪比猴脑，速度赛过猴跑的俺来也2.0新版本驾到！',
    //   title: '2.0新版强势登陆 新用户立享超级礼包，你猴得住吗？',
    //   // appid: 'wx9ccba086952bfc83'   
    //   appid: 'wxf588a9a2d80172ca' //测试
    // };
    /*
      允许使用的微信js接口
    */
   var url,appid;
    // 正式
    if(type == 1) {
        url = 'http://special.anlaiye.com.cn/api/share/share/';
        appid = 'wx9ccba086952bfc83';
    }
    // 测试
    else {
        url = 'http://special.imcoming.com.cn/api/share/share/';
        appid = 'wxf588a9a2d80172ca'
    }  
    var mergeJSON = function(json1,json2){
        var json = eval('('+(JSON.stringify(json1)+JSON.stringify(json2)).replace(/}{/,',')+')');
        return json;
    }
    var weixinDict = {
        link: window.location.href,
        appid: appid
    }
    var weixinDict = mergeJSON(weixinDict,params);
    callback = callback ? callback : function(){};
    var jsApiList=[
        'checkJsApi', 
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
    ];
    /*
      从服务器获取配置信息
    */ 
    var u  = window.location.href;
    u = encodeURIComponent(u);
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'jsonp',
        jsonp: 'jsoncallback',
        data: {
            url: u
        }
    })
    .done(function(redata){
        if(redata.result){
            // 微信配置
            wx.config({
                debug: false, 
                appId: redata.appId, 
                timestamp: redata.timestamp, 
                nonceStr: redata.nonceStr, 
                signature: redata.signature,
                jsApiList: jsApiList // 功能列表，我们要使用JS-SDK的什么功能
            });
            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在 页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready 函数中。
            wx.ready(function(){
                // 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
                wx.onMenuShareTimeline({
                    title: weixinDict.desc, // 分享标题
                    link: weixinDict.link,
                    desc: weixinDict.desc,
                    imgUrl: weixinDict.img, // 分享图标
                    success: function(){
                        callback;
                    },
                    cancle: function(){

                    }
                });
                // 获取“分享给朋友”按钮点击状态及自定义分享内容接口
                wx.onMenuShareAppMessage({
                    title: weixinDict.title, // 分享标题
                    link: weixinDict.link,
                    desc: weixinDict.desc,
                    imgUrl: weixinDict.img, // 分享图标
                    success: function(){
                        callback;
                    },
                    cancle: function(){

                    }
                });
            });
        }
    });
};