/**
canvas保存为png图片至本地 返回本地location
@selectors 传入canvas的css选择器 || dom节点
@tips 不能保存跨域请求的图片
*/
function saveImgFromCanvas(selectors) {
    if (!selectors) {
        return;
    }
    let canvasArray, returnArr = [];
    if (typeof selectors === 'string') {
        canvasArray = document.querySelectorAll(selectors);
    }
    canvasArray.forEach(selector => {
        selector.style.display = 'none';
        returnArr.push(selector.toDataURL('image/png'));
        document.querySelector('body').removeChild(selector);
    });
    return returnArr;
}

/**
图片合并（canvas）
模式： 1，等分
      2，按比例 （sprite）
！@params JSON {
    key String 合并后图片标示
    urls Array 图片路径数组
    type int 1=>等分 2=>按比例 默认
    callback Function 合并结束后回调
}
*/
function sprite(params) {
    sprite.key++;
    params = {
        key: sprite.key,
        type: 2,
        ...params
    };
    // 创建一个canvas
    let canvas = document.createElement('canvas'),
        cxt, {urls, type, key, callback} = params,
        id = `sprite${key}`;
    canvas.height = '1000';
    canvas.width = '1000';
    canvas.style.display = 'none';
    canvas.id = id;
    document.querySelector('body').appendChild(canvas);
    if (urls.length <= 1) {
        return {
            url: urls
                ? urls[0]
                : ''
        };
    }
    // 等分
    if (type === 1) {
        return uniform({
            urls,
            canvas,
            callback(c) {
                if (!sprite.url) {
                    sprite.urls = {};
                }
                let u = saveImgFromCanvas(`#${id}`);
                sprite.urls[key] = u;
                if (callback && typeof callback === 'function') {
                    callback(u);
                }
            }
        });
    } else if (type === 2) {
        // 按比例
        return proportionally(urls, cxt);
    }
}
sprite.key = 0;

/**
等分合并图片
@params JSON{
    urls 图片路径数组
    canvas canvas
    style 每张图片的样式
    callback 拼完回调
}
*/
function uniform(params) {
    params = {
        urls: [],
        style: {},
        ...params
    };
    let {urls, canvas, style, callback} = params, loadedNum = 0,
        data = [], // 存放每张图片的起始位置及宽高 起始x,起始y,宽,高
        cxt = canvas.getContext('2d'),
        number = urls.length;
    if (number <= 1) {
        return {url: urls[0]};
    }
    data = getUniformImageDataList(number, 20);
    urls.map((url, i) => {
        let img = document.createElement('img');
        img.src = url;
        img.crossOrigin = 'Anonymous';
        img.style = style;
        img.onload = () => {
            loadedNum++;
            cxt.drawImage(img, data[i][0], data[i][1], data[i][2], data[i][3]);
            if (loadedNum === number) {
                if (callback && typeof callback === 'function') {
                    callback(canvas);
                }
            }
        };
    });
}

// 获取等分合并图片的每张图片数据 [x,y,width,height]的集合
function getUniformImageDataList(number, padding) {
    let data = [], x, y, w, h;
    switch (number) {
        case 2: {
            x = padding;
            w = h = 1000 / 2 - 3 / 2 * padding;
            y = (1000 - h) / 2;
            data.push(
                [
                    x, y, w, h
                ],
                [
                    x + 500, y, w, h
                ]
            );
            break;
        }
        case 3: {
            w = h = 1000 / 2 - padding;
            data.push(
                [
                    (1000 - w) / 2, padding, w, h
                ],
                [
                    (1000 - 2 * w - padding) / 2, h, w, h
                ],
                [
                    1000 / 2 + padding / 2, h, w, h
                ]
            );
            break;
        }
        case 4: {
            w = h = 1000 / 2 - 3 / 2 * padding;
            x = padding;
            y = padding;
            data.push(
                [
                    x, y, w, h
                ],
                [
                    1000 / 2 + padding / 2, y, w, h
                ],
                [
                    x, 1000 / 2 + padding / 2, w, h
                ],
                [
                    1000 / 2 + padding / 2, 1000 / 2 + padding / 2, w, h
                ]
            );
            break;
        }
    }
    return data;
}

/**
按比例合并图片
urls 图片路径数组
cxt cavas 绘制上下文
*/
function proportionally(urls, cxt) {
    //
}

export default {
    sprite
};
