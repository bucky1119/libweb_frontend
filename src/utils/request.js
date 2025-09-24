import axios from "axios";
import { MessageBox, Message } from "element-ui";
import store from "@/store";
import { getToken } from "@/utils/auth";

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 5000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => {
    // 添加 Authorization token
    const token = store.getters.token || getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error: ", error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    // 如果是 Blob 类型的响应，直接返回 response 对象
    if (response.request.responseType === "blob") {
      return response;
    }

    const res = response.data;

    // 兼容无 code 包装的成功响应（HTTP 200）
    if (res && typeof res === 'object' && !('code' in res)) {
      return res;
    }

    // 根据后端自定义业务 code 进行判断
    if (res.code !== 200) {
      Message({
        message: res.msg || res.message || "请求失败",
        type: "error",
        duration: 5 * 1000,
      });

      // 特定错误处理，如 token 过期等
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          "登录已失效，是否重新登录？",
          "确认退出",
          {
            confirmButtonText: "重新登录",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          store.dispatch("user/resetToken").then(() => {
            location.reload();
          });
        });
      }
      return Promise.reject(new Error(res.msg || res.message || "Error"));
    } else {
      return res;
    }
  },
  (error) => {
    console.error("Response error: ", error); // for debug

    // 获取错误消息
    let errorMsg = error.response && error.response.data && error.response.data.msg 
      ? error.response.data.msg 
      : error.message;

    // 处理未授权或权限不足，自动登出并跳转到登录
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      store.dispatch('user/resetToken').finally(() => {
        // 带上当前路由作为重定向
        const currentPath = window.location.hash ? window.location.hash.slice(1) : '/';
        window.location.href = `#/login?redirect=${encodeURIComponent(currentPath)}`;
      });
    }

    Message({
      message: errorMsg,
      type: "error",
      duration: 5 * 1000,
    });

    return Promise.reject(error);
  }
);

export default service;
