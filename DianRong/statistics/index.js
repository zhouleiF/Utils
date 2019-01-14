// 百度统计
function baidu() {
    let hm = document.createElement('script'),
        s = document.getElementsByTagName('script')[0];
    hm.src = 'https://hm.baidu.com/hm.js?fab3156d0e2b8f3876162872a782b3fe';
    s.parentNode.insertBefore(hm, s);
}
function all() {
    baidu();
}
export default {
    baidu,
    all
};
