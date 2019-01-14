/**
*编码对象属性，
*如果它们来自html表单的名/值对，使用application/x-www-form-urlencoded格式
*/
function encodeFormData(data) {
    if (!data) {
        return '';
    }
    let pairs = [];
    for (let name in data) {
        if (!data.hasOwnProperty(name)) {
            continue;
        }
        if (typeof data[name] === 'function') {
            continue;
        }
        let value = data[name].toString();
        name = encodeURIComponent(name.replace('%20', '+'));
        value = encodeURIComponent(value.replace('%20', '+'));
        pairs.push(`${name}=${value}`);
    }
    // 返回使用&连接的键/值对
    return pairs.join('&');
}

/**
*ajax请求原生实现
*@params JSON {
    type String 请求方式 'GET' 'POST'...
    url String 请求地址
    dataType String 数据类型 'json' 'jsonp'
    data JSON 请求数据
    jsonp String 如果dataType值为'jsonp'，赋值为jsonp callabck函数名
    success Function 成功回调
    fail Function 失败回调
    done Function 请求完成回调
}
*/
function request(params) {
    params = {
        type: 'GET',
        dataType: 'json',
        done() {
            // 这里填写默认done操作，可预留为debug口
        },
        success() {
            // 默认成功处理函数
        },
        fail() {
            // 默认失败处理函数
        },
        ...params
    };
    let {url, type, dataType, data, jsonp, success, fail, done} = params;
    if (type === 'GET' || dataType === 'jsonp') {
        let dataString = encodeFormData(data);
        data = null;
        if (url.indexOf('?') > -1) {
            url += `&${dataString}`;
        }
        else {
            url += `?${dataString}`;
        }
    }
    if (dataType === 'jsonp') {
        // jsonp
        if (!window.alyJSONP) {
            window.alyJSONP = {};
        }
        getJSONP({
            jsonp, success, fail, done, url
        });
    }
    else {
        let request = new XMLHttpRequest();
        request.open(type, url);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(data));
        request.onreadystatechange = () => {
            done(request);
            if (request.readyState === 4 && request.status === 200) {
                success(request.body);
            }
            else {
                fail();
            }
        };
    }
}

/**
jsonp
@params JSON {
    url String 请求路径
    jsonp String jsonp回调函数名
    success Function 成功回调
    fail Function 失败回调
    done Function 结束回调
}
*/
function getJSONP(params) {
    params = {
        jsonp: 'callback',
        ...params
    };
    let {url, jsonp, success, fail, done} = params,
        cbnum = `aly_${getJSONP.counter++}`,
        cbname = `alyJSONP.${cbnum}`,
        script = window.document.createElement('script');
    if (url.indexOf('?') === -1) {
        url += `?${jsonp}=${cbname}`;
    }
    else {
        url += `&${jsonp}=${cbname}`;
    }
    window.alyJSONP[cbnum] = response => {
        try {
            done(response);
            success(response);
        }
        catch (err) {
            fail(err);
        }
        finally {
            delete getJSONP[cbnum];
            script.parentNode.removeChild(script);
        }
    };
    script.src = url;
    document.body.appendChild(script);
    script.onerror = (err) => {
        fail(err);
        delete getJSONP[cbnum];
        script.parentNode.removeChild(script);
    };
}
getJSONP.counter = 0;

export default {request};
