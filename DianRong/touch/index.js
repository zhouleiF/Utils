// touch 对象
export default class MyTouch {
    constructor(params) {
        // 变量
        let {container, isPrevent} = params;
        this.startPosition = 0; // 开始坐标
        this.endPosition = 0; // 移动后坐标
        this.startTime = 0; // 开始时间
        this.endTime = 0; // 结束时间
        this.lastMoveStart = 0; // 前一个坐标
        this.scrollTop = 0; // 开始scrollTop的大小
        this.startCallbacks = []; // touchStart的回调集
        this.moveCallbacks = []; // touchmove的回调集
        this.endCallbacks = []; // touchend的回调集
        this.touchstart = this.touchstart.bind(this);
        this.touchmove = this.touchmove.bind(this);
        this.touchend = this.touchend.bind(this);
        this.prevent = this.prevent.bind(this);
        this.continue = this.continue.bind(this);
        this.init = this.init.bind(this);
        this.isPrevent = isPrevent;
        this.preventListener = e => {
            e.preventDefault();
        };
        if (container && typeof container === 'string') {
            this.container = document.querySelector(container);
        }
        else {
            this.container = container || window;
        }
    }
    touchstart(e) {
        let t = e.changedTouches[0];
        this.startPosition = {
            x: t.pageX,
            y: t.clientY
        };
        this.lastMoveStart = t.clientY;
        this.startTime = new Date().getTime();
        this.scrollTop = document.body.scrollTop;
        this.startCallbacks.map(callback => {
            if (typeof callback === 'function') {
                callback(t);
            }
        });
    }
    touchmove(e) {
        if (this.isPrevent) {
            e.preventDefault();
        }
        let t = e.changedTouches[0];
        this.endPosition = {
            x: t.pageX,
            y: t.clientY
        };
        this.moveCallbacks.map(callback => {
            if (typeof callback === 'function') {
                callback(t);
            }
        });
    }
    touchend(e) {
        let t = e.changedTouches[0];
        this.endPosition = {
            x: t.pageX,
            y: t.clientY
        };
        this.endTime = new Date().getTime();
        this.endCallbacks.map(callback => {
            if (typeof callback === 'function') {
                callback(t, e);
            }
        });
    }
    init() {
        this.container.addEventListener('touchstart', this.touchstart, {capture: false, passive: false});
        this.container.addEventListener('touchmove', this.touchmove, {capture: false, passive: false});
        this.container.addEventListener('touchend', this.touchend, {capture: false, passive: false});
    }
    // 禁止touch默认行为
    prevent() {
        this.container.removeEventListener('touchstart', this.touchstart, false);
        this.container.removeEventListener('touchmove', this.touchmove, false);
        this.container.removeEventListener('touchend', this.touchend, false);
        this.container.addEventListener('touchmove', this.preventListener, {capture: false, passive: false});
    }

    // 解除截止
    continue() {
        this.container.removeEventListener('touchmove', this.preventListener, false);
        this.init();
    }
}
