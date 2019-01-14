import ajax from '../ajax';

/**
构造函数传值
@props JSON {
    url Stirng 获取wx config信息的接口
    dev boolean 是否是开发环境
    debug boolean 是否开始wx debug模式
    jsApiList Array 允许的wx api列表
    getWxConfig 重写getWxConfig方法 传入参数callback 获取数据后回调执行wx.config(params) 给回调传入params JSON                            {appId,timestamp,nonceStr,signature}
}
*/
export default class AlyWechat {
    constructor(props) {
        this.url = props.url || 'http://special.anlaiye.com.cn/api/share/share'; // 获取wx config信息的接口
        this.dev = props.dev || false;
        this.debug = props.debug || false;
        this.jsApiList = props.jsApiList || [
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
        this.readyCallbacks = []; // wx.ready的回调栈，当wx未ready时执行的任务将会被推入此栈 二维数组，【event, params】的集合
        let self = this;
        function binding(arr = []) {
            arr.forEach(e => {
                self[e] = self[e].bind(self);
            });
        }
        binding([
            'getWxConfig',
            'config',
            'init',
            'ready',
            'handle',
            'shareToWechatCircle',
            'shareToWechatFriends',
            'shareToQQ',
            'shareToTencentWeibo',
            'shareToQZone',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'playVoice',
            'pauseVoice',
            'stopVoice',
            'onVoicePlayEnd',
            'uploadVoice',
            'downloadVoice',
            'translateVoice',
            'getNetworkType'
        ]);
        if (props.getWxConfig && typeof props.getWxConfig === 'function') {
            this.getWxConfig = props.getWxConfig.bind(this); // 开放获取微信config接口，可重写此方法
        }
        this.isReady = false; // 微信jssdk是否已经ready
    }

    /** 获取wx config信息 传入获取信息接口地 并执行回调，
    callback 传入json {
        appId,
        timestamp,
        nonceStr,
        signature
    }
    */
    getWxConfig(callback) {
        let dataUrl = encodeURIComponent(window.location.href); // 当前页面地址
        ajax.request({
            dataType: 'jsonp',
            jsonp: 'jsoncallback',
            url: this.url,
            data: {
                url: dataUrl
            },
            done(redata) {
                if (redata.result) {
                    callback({appId: redata.appId, timestamp: redata.timestamp, nonceStr: redata.nonceStr, signature: redata.signature});
                }
            }
        });
        return this;
    }

    /** wx.config
    @params JSON {
        appId,
        timestamp,
        nonceStr,
        signature
    }
    */
    config(params) {
        window.wx.config({
            debug: this.debug,
            jsApiList: this.jsApiList,
            ...params
        });
        return this;
    }

    // wx config设置
    init() {
        let self = this;
        this.getWxConfig(this.config);
        window.wx.ready(() => {
            self.ready();
        });
        return this;
    }

    // wx ready
    ready() {
        this.isReady = true;
        // 顺序执行ready回调栈
        this.readyCallbacks.map(f => {
            if (typeof f === 'object') {
                if (typeof f[0] === 'function') {
                    f[0](f[1]);
                }
            }
        });
        this.readyCallbacks = [];
        return this;
    }

    /**
     handle
     @event 需要处理的事件名
     @params 事件处理时的参数
     事件函数的参数统一：
     @params JSON {
        title  String  分享头
        link   String  分享链接
        desc   String  分享详情
        imgUrl  String  分享icon链接
        success  Function 分享成功回调
        cancel   Function 取消分享回调
        type Stirng 分享类型 music video link  默认link
    }
    */
    handle(event, params) {
        if (!this.isReady) {
            this.readyCallbacks.push([event, params]);
            return this;
        }
        event(params);
        return this;
    }
    // 分享到朋友圈
    shareToWechatCircle(params) {
        return this.handle(window.wx.onMenuShareTimeline, params);
    }
    // 分享到微信朋友
    shareToWechatFriends(params) {
        return this.handle(window.wx.onMenuShareAppMessage, params);
    }
    // 分享到QQ
    shareToQQ(params) {
        return this.handle(window.wx.onMenuShareQQ, params);
    }
    // 分享到腾讯微博
    shareToTencentWeibo(params) {
        return this.handle(window.wx.onMenuShareWeibo, params);
    }
    // 分享到QQ空间
    shareToQZone(params) {
        return this.handle(window.wx.onMenuShareQZone, params);
    }
    /** 拍照或从手机相册中选图接口 对比input type=file 前者在android上的兼容性更好
    @params JSON {
            count int 图片数量 默认9
            sizeType array 指定是原图还是压缩图  默认['original' 'compressed']
            sourceType array 指定来源是相册还是相机， 默认['album', 'camera']
            success Function 回调 传入res对象 res.localIds 获取选定照片的本地id列表，可赋值给img src
    }
    */
    chooseImage(params) {
        return this.handle(window.wx.chooseImage, params);
    }
    /** 预览图片接口
    @params JSON {
        current String 当前显示图片的url
        urls Array 需要显示的图片的url集合
    }
    */
    previewImage(params) {
        return this.handle(window.wx.previewImage, params);
    }
    /** 上传图片接口
    @params JSON {
        localId String 图片的本地id 由chooseImage接口获取
        isShowProgressTips int 显示进度提示 默认 1
        success Function 成功回调 参数 res res.serverId 返回图片的服务器端id
    }
    */
    uploadImage(params) {
        return this.handle(window.wx.uploadImage, params);
    }
    /** 下载图片接口
    @params JSON {
        serverId String 需要下载的图片的服务器端ID，由uploadImage接口获得
        isShowProgressTips int 显示进度提示 默认 1
        success Function 成功回调 参数 res res.localId 返回图片下载后的本地ID
    }
    */
    downloadImage(params) {
        return this.handle(window.wx.downloadImage, params);
    }
    /** 开始录音接口
    */
    startRecord() {
        return this.handle(window.wx.startRecord);
    }
    /** 停止录音接口
    @params JSON {
        success Function 回调 传入 res res.localId 返回音频本地id
    }
    */
    stopRecord(params) {
        return this.handle(window.wx.stopRecord, params);
    }
    /** 监听录音自动停止接口
    @params JSON {
        complete Function 录音时间超过一分钟没有停止的时候会执行 complete 回调 传入 res res.localId 返回音频本地id
    }
    */
    onVoiceRecordEnd(params) {
        return this.handle(window.wx.onVoiceRecordEnd, params);
    }
    /** 播放语音接口
    @params JSON {
        localId String 音频本地id 由stopRecord 或者 onVoiceRecordEnd 接口获得
    }
    */
    playVoice(params) {
        return this.handle(window.wx.playVoice, params);
    }
    /** 暂停播放接口
    @params JSON {
        localId String 音频本地id 由stopRecord 或者 onVoiceRecordEnd 接口获得
    }
    */
    pauseVoice(params) {
        return this.handle(window.wx.pauseVoice, params);
    }
    /** 停止播放接口
    @params JSON {
        localId String 音频本地id 由stopRecord 或者 onVoiceRecordEnd 接口获得
    }
    */
    stopVoice(params) {
        return this.handle(window.wx.stopVoice, params);
    }
    /** 监听语音播放完毕接口
    @params JSON {
        success Function 音频播放完毕回调 传入res res.localId 返回音频本地Id
    }
    */
    onVoicePlayEnd(params) {
        return this.handle(window.wx.onVoicePlayEnd, params);
    }
    /** 上传语音接口
    @params JSON {
        localId String 音频本地id 由stopRecord 或者 onVoiceRecordEnd 接口获得
        isShowProgressTips int 显示进度 默认 1
        success Function 回调 传入res res.serverId 返回音频服务器端Id
    }
    */
    uploadVoice(params) {
        return this.handle(window.wx.uploadVoice, params);
    }
    /** 下载语音接口
    @params JSON {
        serverId String 音频服务器端id 由uploadVoice接口获得
        isShowProgressTips int 显示进度 默认 1
        success Function 回调 传入res res.localId 返回音频本地Id
    }
    */
    downloadVoice(params) {
        return this.handle(window.wx.downloadVoice, params);
    }
    /** 识别音频并返回识别结果接口
    @params JSON {
        localId String 音频本地id 由stopRecord 或者 onVoiceRecordEnd 接口获得
        isShowProgressTips int 显示进度 默认 1
        success Function 回调 传入res res.translateResult 返回识别结果
    }
    */
    translateVoice(params) {
        return this.handle(window.wx.translateVoice, params);
    }
    /** 获取网络状态接口
    @params JSON {
        success Function 回调 传入res res.networkType 返回网络类型2g，3g，4g，wifi
    }
    */
    getNetworkType(params) {
        return this.handle(window.wx.getNetworkType, params);
    }
}
