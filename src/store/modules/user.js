import { login, signin,getInfo, logout} from "@/api/user";
import { getAllUsers, getUserById, addUser, updateUser, deleteUser } from "@/api/user";
import {
  getToken,
  setToken,
  removeToken,
  setUsername,
  setRole,
  setUserId,
} from "@/utils/auth";

// import { resetRouter } from "@/router";

const getDefaultState = () => {
  return {
    token: getToken(),
    name: "",
    roles: "",
  };
};

const state = {
  ...getDefaultState(),
  users: [],          // 用户列表
  selectedUser: null, // 当前选择的用户
};

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles;
  },
  SET_USERS: (state, users) => {
    state.users = users;  // 存储所有用户
  },
  SET_USER: (state, user) => {
    state.selectedUser = user;  // 存储单个用户的信息
  },
};

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo;
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then((response) => {
          const { data, token } = response;
          commit("SET_TOKEN", token);
          setToken(token);
          // resolve();
          // get user info
          const { role, username, id } = data;

          // // roles must be anon-empty array
          // if (!roles || roles.length <= 0) {
          //   reject("getInfo: roles must be a non-null array!");
          // }

          commit("SET_ROLES", role);
          commit("SET_NAME", username);
          setRole(role);
          setUsername(username);
          setUserId(id);
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // user  signing
  signin({ commit }, userInfo) {
    // console.log(userInfo, "userInfo");
    const { username, password, role_token } = userInfo;
    return new Promise((resolve, reject) => {
      signin(
        { token: role_token },
        {
          username: username.trim(),
          password: password,
        }
      )
        .then((response) => {
          const { data } = response;
          // commit("SET_TOKEN", data.token);
          // setToken(data.token);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // 获取用户信息，还未实现
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then((response) => {
          const { data } = response;
  
          if (!data) {
            reject("验证失败，请重新登录");
          }
  
          // 确保 roles 为数组
          const { roles = [], name } = data;
  
          if (roles.length === 0) {
            reject("getInfo: 角色信息必须为非空数组！");
          }
  
          commit("SET_ROLES", roles);
          commit("SET_NAME", name);
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  

// 用户登出,还未实现
logout({ commit, state }) {
  return new Promise((resolve, reject) => {
    logout(state.token)
      .then(() => {
        removeToken(); // 先移除 token
        resetRouter();
        commit("RESET_STATE");
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
},


  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      removeToken(); // must remove  token  first
      commit("RESET_STATE");
      resolve();
    });
  },

   // 获取所有用户
   fetchAllUsers({ commit }) {
    return new Promise((resolve, reject) => {
      getAllUsers()
        .then(response => {
          commit("SET_USERS", response.data);  // 假设后端返回的用户列表是 response.data
          resolve(response.data);
        })
        .catch(error => reject(error));
    });
  },

  // 获取指定 ID 的用户
  fetchUserById({ commit }, id) {
    return new Promise((resolve, reject) => {
      getUserById(id)
        .then(response => {
          commit("SET_USER", response.data);  // 假设返回的是一个用户对象 response.data
          resolve(response.data);
        })
        .catch(error => reject(error));
    });
  },

  // 添加新用户
  createUser({ dispatch }, userData) {
    return new Promise((resolve, reject) => {
      addUser(userData)
        .then(response => {
          dispatch("fetchAllUsers");  // 刷新用户列表
          resolve(response.data);
        })
        .catch(error => reject(error));
    });
  },

  // 更新用户信息
  editUser({ dispatch }, { id, userData }) {
    return new Promise((resolve, reject) => {
      updateUser(id, userData)
        .then(response => {
          dispatch("fetchAllUsers");  // 刷新用户列表
          resolve(response.data);
        })
        .catch(error => reject(error));
    });
  },

  // 删除用户
  removeUser({ dispatch }, id) {
    return new Promise((resolve, reject) => {
      deleteUser(id)
        .then(response => {
          dispatch("fetchAllUsers");  // 刷新用户列表
          resolve(response.data);
        })
        .catch(error => reject(error));
    });
  },

  
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
