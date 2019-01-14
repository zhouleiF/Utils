/*
 @desc bridge
 @author zhoulei@imcoming.cn
 @date 16/5/3
 */
const Bridge = (function() {
    const Types = {
        IOS: 'iOS',
        ANDROID: 'android',
        WeChat: 'wechat',
        Web: 'web'
    };

    let ua = navigator.userAgent.toLowerCase();

    function platformFn(os) {
        let ver = ('' + (new RegExp(os + '(\\d+((\\.|_)\\d+)*)').exec(ua) || [0])[1]).replace(/_/g, '.');
        return parseFloat(ver) || undefined;
    }

    function _isAndroid() {
        return platformFn('android[/ ]');
    }

    function _isIos() {
        return platformFn('os ');
    }

    function isApp() {
        if (_isIos() && window.WebViewJavascriptBridge) {
            return true;
        } else if (typeof android !== 'undefined') {
            return true;
        } else {
            return false;
        }
    }

    function detect() {
        if (_isIos()) {
            return Types.IOS;
        } else if (_isAndroid()) {
            return Types.ANDROID;
        } else {
            return Types.Web;
        }
    }

    let Platform = {
            Type: Types,
            detect: detect
        },
        platform = Platform.detect(),
        debugLogId = 0,
        DEBUG = false;

    /**
     * tools
     ******************************************************************************/
    function _log(message, data) {
        var elLog = document.getElementById('log');
        var logString = debugLogId++ + '. ' + message + ':<br/>' + JSON.stringify(data);

        if (DEBUG) {
            console.log(logString);
        }

        if (elLog) {
            let el = document.createElement('div');
            el.className = 'logLine';
            el.innerHTML = logString;
            if (elLog.children.length) {
                elLog.insertBefore(el, elLog.children[0]);
            } else {
                elLog.appendChild(el);
            }
        }
    }

    function _buildBridgeForAll(configs) {
        if (configs && configs.debug) {
            window.onerror = function(err) {
                _log('window.onerror: ' + err);
            };
            DEBUG = true;
        }
    }

    /*
     * ios bridge implementation
     ******************************************************************************/

    function _iOSBridgeRegister(callback) {
        if (window.WebViewJavascriptBridge) {
            return callback(window.WebViewJavascriptBridge);
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function() {
                callback(window.WebViewJavascriptBridge);
            }, false);
        }

        if (window.WVJBCallbacks) {
            return window.WVJBCallbacks.push(callback);
        }

        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function() {
            document.documentElement.removeChild(WVJBIframe);
        }, 0);
    }

    function _buildBridgeForIOS(data) {
        _iOSBridgeRegister(function(bridge) {
            bridge.init(function(message, responseCallback) {
                _log('JS got a message', message);
                let data = {
                    'Javascript Responds': 'Wee!'
                };
                _log('JS responding with', data);
                responseCallback(data);
            });

            if (data !== undefined) {
                _log('init with data :', data);
                bridge.send(data);
            }
        });
    }

    function _notifyIOS(event, params, callback) {
        if (Object.prototype.toString.call(event) === '[object String]' && event.length > 0) {
            if (typeof params !== 'object' || params == null) {
                params = {};
            }
            _iOSBridgeRegister(function(bridge) {
                bridge.callHandler(event, params, function(response) {
                    _log('[iOS]call [' + event + '] response', response);
                    if (typeof callback === 'function') {
                        callback(response);
                    }
                });
            });
        }
    }

    function _registerIOSListener(event, callback) {
        if (Object.prototype.toString.call(event) === '[object String]' && event.length > 0) {
            _iOSBridgeRegister(function(bridge) {
                bridge.registerHandler(event, function(data, responseCallback) {
                    var responseData;
                    if (typeof callback === 'function') {
                        responseData = callback(data);
                    } else {
                        responseData = 'ok';
                    }
                    _log('[iOS]receive [' + event + '] with message :', data);
                    _log('[iOS]respond with', responseData);
                    responseCallback(responseData);
                });
            });
        }
    }

    /**
     * android bridge implementation
     ******************************************************************************/
    function _buildBridgeForAndroid(data) {
        window.AndroidCallbacks = {};
        // todo
    }

    function _notifyAndroid(event, params, callback) {
        if (typeof android !== 'undefined') {
            var paramValueList = [];
            if (typeof params === 'object' && params !== null) {
                for (var name in params) {
                    if (params.hasOwnProperty(name)) {
                        var value = params[name] + '';
                        paramValueList.push(value);
                    }
                }
            }
            if (event in window.android) {
                window.android[event].apply(window.android, paramValueList);
            }
        }
    }

    function _registerAndroidListener(event, callback) {
        if (Object.prototype.toString.call(event) === '[object String]' && event.length > 0) {
            window[event] = function(data, responseCallback) {
                var responseData;
                if (typeof callback === 'function') {
                    responseData = callback(data);
                } else {
                    responseData = {};
                }
                _log('[Android]receive [' + event + '] with message :', data);
                _log('[Android]respond with', responseData);
                responseCallback(responseData);
            };
        }
    }

    /**
     * exported interface
     ******************************************************************************/

    function init(data, configs) {
        _buildBridgeForAll(configs);
        switch (platform) {
            case Platform.Type.IOS:
                _buildBridgeForIOS(data);
                break;
            case Platform.Type.ANDROID:
                _buildBridgeForAndroid(data);
                break;
            case Platform.Type.Web:
            case Platform.Type.WeChat:
                // do nothing
                break;
        }
    }

    function notify(event, params, callback) {
        switch (platform) {
            case Platform.Type.IOS:
                _notifyIOS(event, params, callback);
                break;
            case Platform.Type.ANDROID:
                _notifyAndroid(event, params, callback);
                break;
            case Platform.Type.Web:
            case Platform.Type.WeChat:
                // todo
                break;
        }
    }

    function listen(event, callback) {
        switch (platform) {
            case Platform.Type.IOS:
                _registerIOSListener(event, callback);
                break;
            case Platform.Type.ANDROID:
                _registerAndroidListener(event, callback);
                break;
            case Platform.Type.Web:
            case Platform.Type.WeChat:
                // todo
                break;
        }
    }

    return {init, notify, listen, platform, isApp};
})();

export {Bridge};
