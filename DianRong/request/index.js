import axios from 'axios'
import Qs from 'qs'
const instance = axios.create({
  transformRequest: req => Qs.stringify(req),
  withCredentials: true,
  headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
})
// instance.interceptors.request.use(c => {
//   console.dir(c)
//   return c
// }, err => {
//   return Promise.reject(err)
// })
export default instance
