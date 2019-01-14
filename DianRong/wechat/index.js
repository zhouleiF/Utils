import AlyWechat from './alyWechat';
import utility from '../utility';

// 检测是否存在Wechat对象，如有不存在，则加载wx官方js
function checkWechat(callback) {
    if (!window.wx) {
        utility.ayscLoadWXShare(() => {
            if (window.wx) {
                callback();
            }
        });
    } else {
        callback();
    }
}

/** 默认行为 开启所有分享并返回AlyWechat实例
@params JSON {
    debug
    dev
    url
    params 分享参数json
    jsApiList
    getWxConfig
    callback 传入alywechat对象
}
*/
function share(params) {
    params = {
        debug: false,
        dev: false,
        url: 'http://special.anlaiye.com.cn/api/share/share',
        ...params
    };
    let callback = params.callback;
    delete params.callback;
    checkWechat(() => {
        let object = new AlyWechat(params);
        object.init().shareToWechatCircle(params.params).shareToWechatFriends(params.params).shareToQQ(params.params).shareToTencentWeibo(params.params).shareToQZone(params.params);
        if (callback && typeof callback === 'function') {
            callback(object);
        }
    });
}
export default {
    share,
    AlyWechat
};
