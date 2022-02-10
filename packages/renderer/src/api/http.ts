import axios from 'axios';
import { ElMessage } from 'element-plus';

axios.defaults.baseURL = 'http://preferyou.cn';

// tip function
const tip = (msg: string) => {
  ElMessage({
    message: msg,
    duration: 1000,
    type: 'error',
  });
};


/**
 * 请求失败后的错误统一处理
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = (status: number, other: string) => {
  // 状态码判断
  switch (status) {
    // 401: not login ,redirect to login
    case 401:
      tip('请登录');
      break;
    // 403 : token was been expire ,clean token and redirect to login
    case 403:
      tip('登录过期，请重新登录');
      break;
    // 404: source not found
    case 404:
      tip('请求的资源不存在');
      break;
    default:
      tip(other);
  }
};

/* create axios entity */
axios.defaults.withCredentials = true;

// set request header
axios.defaults.headers.post['Content-Type'] =
  'application/x-www-form-urlencoded;charset=UTF-8';

const instance = axios.create({
  timeout: 1000 * 30,
});

// request interceptor
instance.interceptors.request.use(
  (config:any) => {
    // 每次发送请求之前判断vuex中是否存在token
    // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
    // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断

    // const token = store.state.customer.token;
    // const bToken = store.state.business.token;
    // token && (config.headers.Authorization = token);
    // bToken && (config.headers.BAuthorization = bToken);
    return config;
  },
  (error:any) => {
    return Promise.reject(error);
  },
);

// response interceptors

instance.interceptors.response.use(
  (res:any) => (res.status === 200 ? Promise.resolve(res) : Promise.reject(res)),
  (error:any) => {
    const { response } = error;
    console.log('request fail ,has response');
    if (response) {
      // request was sended,but status isn't 2xx
      errorHandle(response.status, response.data.message);
      return Promise.reject(response);
    } else {
      console.log('request fail ,haven‘t response');

      // deal network error
      //eg: request timeout or network error,update state's network value
      // network value in the app.vue,control a global network error component's visible or hidden,
      if (!window.navigator.onLine) {
        // store.commit('changeNetWork', false);
        console.log('网络发生变化');
      } else {
        return Promise.reject(error);
      }
    }
  },
);

export default instance;
