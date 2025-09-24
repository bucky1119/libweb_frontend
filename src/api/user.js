import request from "@/utils/request";

export function login(data) {
  return request({
    url: "/api/auth/login",
    method: "post",
    data: data,
  });
}

export function signin(params, data) {
  return request({
    url: "/api/auth/register",
    method: "post",
    params,
    data,
  });
}

// 获取所有用户
export function getAllUsers() {
  return request({
    url: "/api/admin/users/all",
    method: "get",
  });
}

// 获取指定 ID 的用户
export function getUserById(id) {
  return request({
    url: `/api/admin/users/${id}`,
    method: "get",
  });
}

// 添加新用户
export function addUser(data) {
  return request({
    url: "/api/admin/users/add",
    method: "post",
    data,
  });
}

// 更新用户信息
export function updateUser(id, data) {
  return request({
    url: `/api/admin/users/update/${id}`,
    method: "put",
    data,
  });
}

// 删除用户
export function deleteUser(id) {
  return request({
    url: `/api/admin/users/delete/${id}`,
    method: "delete",
  });
}

export function getInfo() {
  return request({
    url: "/api/auth/info",
    method: "get",
  });
}

// 重置用户密码
export function resetPassword(id, data) {
  return request({
    url: `/api/admin/users/${id}/reset-password`,
    method: 'post',
    data,
  });
}

// export function logout() {
//   return request({
//     url: "/vue-admin-template/user/logout",
//     method: "post",
//   });
// }
