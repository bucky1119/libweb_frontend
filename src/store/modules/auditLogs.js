import { getAuditLogs } from "@/api/logs";

const state = {
  auditLogs: [], // 存储审计日志记录
};

const mutations = {
  SET_AUDIT_LOGS: (state, auditLogs) => {
    state.auditLogs = auditLogs;
  },
};

const actions = {
  fetchAuditLogs({ commit }) {
    return new Promise((resolve, reject) => {
      getAuditLogs()
        .then(response => {
          commit("SET_AUDIT_LOGS", response.data); // 假设后端返回的数据是 response.data
          resolve(response.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
