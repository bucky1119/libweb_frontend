<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">
        <el-input v-model="searchKeyword" placeholder="输入关键词搜索" @change="filterLogs" />
        <el-button type="primary" @click="fetchAuditLogs">刷新日志</el-button>
      </el-col>
    </el-row>
    <el-table :data="filteredLogs" style="width: 100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="username" label="操作用户" width="180" />
      <el-table-column prop="operation" label="操作" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="timestamp" label="时间" width="180" />
    </el-table>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "AuditLogManage",
  data() {
    return {
      searchKeyword: "",
      loading: false,
    };
  },
  computed: {
    ...mapState("auditLogs", ["auditLogs"]),
    filteredLogs() {
      if (this.searchKeyword) {
        return this.auditLogs.filter(log => 
          log.username.includes(this.searchKeyword) || 
          log.operation.includes(this.searchKeyword) ||
          log.status.includes(this.searchKeyword)
        );
      }
      return this.auditLogs;
    },
  },
  methods: {
    ...mapActions("auditLogs", ["fetchAuditLogs"]),
    filterLogs() {
      this.$nextTick(() => {
        // 触发日志过滤，自动更新表格展示的内容
      });
    },
  },
  created() {
    this.loading = true;
    this.fetchAuditLogs()
      .then(() => {
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
        this.$message.error("获取审计日志失败");
      });
  },
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>
