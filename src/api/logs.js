// src/api/logs.js
import request from "@/utils/request";

// 获取所有审计日志
export function getAuditLogs() {
  return request({
    url: "/api/audit/logs",
    method: "get",
  });
}
