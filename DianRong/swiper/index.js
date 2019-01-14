import Touch from '../touch';

/** 匀速滑动
@params JSON {
    speed int 滑动速度
    scrollTop int 滑动终点 以scrolltop定位
    callback function 滑动结束回调
}
*/
function uniform(params = {}) {
    params = {
        speed: 5,
        container: document.body,
        ...params
    };
    if (!params.scrollTop) {
        params.scrollTop = params.pageHeight * (params.pageNum - 1);
    }
    let {speed, scrollTop, myTouch, callback, container} = params,
        timer = setInterval(() => {
            let srollTopNow = Math.abs(parseInt(container.style.top === '' ? 0 : container.style.top)),
                direction = scrollTop - srollTopNow;
            if (Math.abs(srollTopNow - scrollTop) <= speed) {
                container.style.top = `-${scrollTop}px`;
                if (callback && typeof callback === 'function') {
                    callback(params.pageNum, direction);
                }
                // 延时恢复touch 防止破坏性行为导致页面失常
                setTimeout(function() {
                    myTouch.continue();
                }, 500);
                window.clearInterval(timer);
                return;
            }
            srollTopNow = direction > 0 ? (srollTopNow + speed) : (srollTopNow - speed);
            container.style.top = `-${srollTopNow}px`;
        }, 1);
}
/** 全屏上下翻页 滑动期间禁止其他行为
@params JSON {
    container String 容器选择器 不填则为window
    page String 滚动页面选择器
    speed int 滑动速度
    delta int 滑动多少距离翻页
    willSlide function 滑动前钩子函数
    didSlide function 滑动后钩子函数
}
*/
function fullScreen(params = {}) {
    params = {
        speed: 5,
        delta: 5,
        ...params
    };
    if (!params.page) {
        return;
    }
    let container = document.querySelector(params.container),
        pageArray = document.querySelectorAll(params.page),
        pageNum = 1,
        {willSlide, didSlide, speed, delta} = params,
        myTouch = new Touch({
            isPrevent: true
        }),
        scrollPage = function(deltaY) {
            let pageHeight = pageArray[0].offsetHeight,
                isSlide = true;
            if (deltaY < 0) {
                pageNum++;
                if (pageNum > myTouch.pageNum) {
                    pageNum = myTouch.pageNum;
                    isSlide = false;
                }
            } else if (deltaY > 0) {
                pageNum--;
                if (pageNum < 1) {
                    pageNum = 1;
                    isSlide = false;
                }
            }
            if (isSlide) {
                if (willSlide && typeof willSlide === 'function') {
                    willSlide(pageNum, -deltaY);
                }
                uniform({
                    myTouch,
                    callback: didSlide,
                    pageNum,
                    speed,
                    pageHeight,
                    container
                });
                myTouch.prevent();
            }
        };
    myTouch.moveCallbacks.push(t => {
        // let deltaY = myTouch.endPosition.y - myTouch.startPosition.y;
        // document.body.scrollTop = document.body.scrollTop - deltaY;
        myTouch.pageNum = document.querySelectorAll(params.page).length;
    });
    myTouch.endCallbacks.push((t) => {
        let deltaY = myTouch.endPosition.y - myTouch.startPosition.y,
            pageHeight = pageArray[0].offsetHeight;
        if (Math.abs(deltaY) > delta) {
            scrollPage(deltaY);
        }
        else {
            uniform({
                pageHeight,
                pageNum,
                myTouch,
                container
            });
        }
    });
    myTouch.init();
    return myTouch;
}
export default {
    fullScreen
};
