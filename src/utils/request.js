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
    if (store.getters.token) {
      config.headers["Authorization"] = `Bearer ${getToken()}`;
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

    // 根据后端自定义业务 code 进行判断
    if (res.code !== 200) {
      Message({
        message: res.msg || "Error",
        type: "error",
        duration: 5 * 1000,
      });

      // 特定错误处理，如 token 过期等
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        MessageBox.confirm(
          "You have been logged out, you can cancel to stay on this page, or log in again",
          "Confirm logout",
          {
            confirmButtonText: "Re-Login",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        ).then(() => {
          store.dispatch("user/resetToken").then(() => {
            location.reload();
          });
        });
      }
      return Promise.reject(new Error(res.msg || "Error"));
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

    Message({
      message: errorMsg,
      type: "error",
      duration: 5 * 1000,
    });

    return Promise.reject(error);
  }
);

export default service;
