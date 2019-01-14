// Media 事件 debug 依次打印media事件流
function mediaDebugger(target) {
    let a = 1;
    function binding(arr) {
        arr.forEach(e => {
            target[e] = function(f) {
                console.log(a + ':' + e);
                if (e === 'onerror') {
                    console.error(f);
                }
                a++;
            };
        });
    }
    binding([
        'oncanplay',
        'onabort',
        'oncanplaythrough',
        'ondurationchange',
        'onemptied', 'onended', 'onerror', 'onloadeddata', 'onloadedmetadata', 'onloadstart',
        'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onreadystatechange',
        'onseeked', 'onseeking', 'onstalled', 'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting'
    ]);
}

export default {
    mediaDebugger
};
