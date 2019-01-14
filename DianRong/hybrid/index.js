import {Bridge} from './bridge';

/* 判断当前环境是否为app
@return Boolean
*/
function isApp() {
    return Bridge.isApp();
}

/* 跳转至native页面
@params JSON {
                type String 跳转页面类型编码
                data JSON   跳转页面需要传输的值
                callback FUNC 跳转后的回调函数
            }
@type 类型列表 http://wiki.imcoming.com.cn/doku.php?id=jump
*/
function jumpToNative(params) {
    let {type, data, callback} = params,
        json1 = {
            type,
            data
        },
        json2 = {
            protocol: 'jump',
            jsonStr: JSON.stringify(json1)
        };
    Bridge.notify('onWebCallNative', json2, callback);
}

/* 调起native动作
@params JSON {
                type String 动作类型编码
                data JSON   该动作需要传输的值
                callback FUNC 调起后的回调函数
            }
*/
function callAppAction(params) {
    let {type, data, callback} = params,
        json1 = {
            type,
            data
        },
        json2 = {
            protocol: 'execute',
            jsonStr: JSON.stringify(json1)
        };
    Bridge.notify('onWebCallNative', json2, callback);
}

/* 监听native call web 事件，添加事件触发时处理程序
@callback FUNC 监听事件处理程序
*/
function listenNative(callback) {
    Bridge.listen('onNativeCallWeb', function(response) {
        response = (typeof response) === 'object' ? response : JSON.parse(response);
        let {type, data} = response;
        callback({type, data});
    });
}

export default {isApp, jumpToNative, callAppAction, listenNative};
