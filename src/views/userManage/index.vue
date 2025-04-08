<template>
  <div class="app-container">
    <el-tabs v-model="activeName" @tab-click="changeTab">
      <el-tab-pane label="用户管理" name="userManage">
        <el-table :data="userList" stripe>
          <el-table-column prop="username" label="用户名"></el-table-column>
          <el-table-column prop="role" label="用户角色"></el-table-column>
          <el-table-column prop="message" label="角色说明"></el-table-column>
          <el-table-column prop="code" label="授权码"></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="mini" @click="handleEditDialog(scope.row)">编辑</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 编辑弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
      <div>
        <el-form ref="userForm" :model="userForm" label-width="80px">
          <el-form-item label="用户名">
            <el-input v-model="userForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="用户角色">
            <el-input v-model="userForm.role"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateUser">提交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "UserManage",
  data() {
    return {
      activeName: "userManage",
      dialogTitle: "编辑用户角色",
      dialogVisible: false,
      userForm: {
        id: null,
        username: "",
        role: "",
      },
    };
  },
  computed: {
    ...mapState("user", ["users"]),
    userList() {
      return this.users;
    },
  },
  methods: {
    ...mapActions("user", [
      "fetchAllUsers",
      "fetchUserById",
      "createUser",
      "editUser",
      "removeUser",
    ]),

    // 初始化用户列表
    init() {
      this.fetchAllUsers();
    },

    // 打开编辑用户角色弹窗
    handleEditDialog(user) {
      this.userForm = { ...user }; // 复制用户数据
      this.dialogVisible = true;
    },

    // 提交修改表单
    updateUser() {
      this.editUser({ id: this.userForm.id, userData: this.userForm })
        .then(() => {
          this.$message.success("用户信息已更新");
          this.dialogVisible = false;
          this.init(); // 刷新用户列表
        })
        .catch(() => {
          this.$message.error("更新失败，请重试");
        });
    },

    // 删除用户
    handleDelete(userId) {
      this.$confirm("确定删除该用户？")
        .then(() => {
          this.removeUser(userId)
            .then(() => {
              this.$message.success("用户已删除");
              this.init(); // 刷新用户列表
            })
            .catch(() => {
              this.$message.error("删除失败，请重试");
            });
        })
        .catch(() => {
          this.$message.info("取消删除");
        });
    },
  },

  created() {
    this.init(); // 在创建时初始化用户列表
  },
};
</script>
