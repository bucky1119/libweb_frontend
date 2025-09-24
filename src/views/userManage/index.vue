<template>
  <div class="app-container">
    <div class="toolbar">
      <el-input v-model="searchText" placeholder="按用户名搜索" clearable class="mr8" @clear="init" @keyup.enter.native="init" style="width:240px" />
      <el-button type="primary" @click="openCreateDialog">新建用户</el-button>
    </div>

    <el-table :data="filteredUsers" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="role" label="角色" width="140" />
      <el-table-column label="操作" width="320">
        <template #default="{ row }">
          <el-button size="mini" @click="handleEditDialog(row)">编辑</el-button>
          <el-button size="mini" @click="openResetDialog(row)">重置密码</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑 弹窗 -->
    <el-dialog :title="isCreate ? '新建用户' : '编辑用户'" :visible.sync="dialogVisible" width="480px" :before-close="handleClose">
      <el-form ref="userFormRef" :model="userForm" :rules="rules" label-width="96px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="!isCreate" />
        </el-form-item>
        <el-form-item v-if="isCreate" label="初始密码" prop="password">
          <el-input v-model="userForm.password" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色" style="width:100%">
            <el-option label="ADMIN" value="ADMIN" />
            <el-option label="LIBRARIAN" value="LIBRARIAN" />
            <el-option label="EXPERT" value="EXPERT" />
            <el-option label="USER" value="USER" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitUser">{{ isCreate ? '创建' : '保存' }}</el-button>
      </span>
    </el-dialog>

    <!-- 重置密码 弹窗 -->
    <el-dialog title="重置密码" :visible.sync="resetVisible" width="420px">
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="96px">
        <el-form-item label="用户名">
          <el-input v-model="resetForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetForm.newPassword" show-password />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetVisible=false">取消</el-button>
        <el-button type="primary" @click="submitReset">确定</el-button>
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
      searchText: '',
      dialogTitle: "",
      dialogVisible: false,
      isCreate: false,
      userForm: {
        id: null,
        username: "",
        role: "",
        password: "",
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
      },
      resetVisible: false,
      resetForm: { id: null, username: '', newPassword: ''},
      resetRules: { newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }]},
    };
  },
  computed: {
    ...mapState("user", ["users"]),
    userList() {
      return this.users;
    },
    filteredUsers() {
      const kw = (this.searchText || '').trim().toLowerCase();
      if (!kw) return this.userList;
      return this.userList.filter(u =>
        String(u.username || '').toLowerCase().includes(kw)
      );
    }
  },
  methods: {
    ...mapActions("user", [
      "fetchAllUsers",
      "fetchUserById",
      "createUser",
      "editUser",
      "removeUser",
      "resetPassword",
    ]),

    // 初始化用户列表
    init() {
      this.fetchAllUsers();
    },

    // 打开编辑用户角色弹窗
    handleEditDialog(user) {
      this.isCreate = false;
      this.userForm = { id: user.id, username: user.username, role: user.role, password: '' };
      this.dialogVisible = true;
    },

    openCreateDialog() {
      this.isCreate = true;
      this.userForm = { id: null, username: '', role: '', password: '' };
      this.dialogVisible = true;
    },

    // 提交修改表单
    submitUser() {
      this.$refs.userFormRef.validate(valid => {
        if (!valid) return;
        if (this.isCreate) {
          const payload = { username: this.userForm.username, password: this.userForm.password, role: this.userForm.role };
          this.createUser(payload)
            .then(() => {
              this.$message.success('创建成功');
              this.dialogVisible = false;
              this.init();
            })
            .catch(err => this.$message.error(err?.message || '创建失败'))
        } else {
          const update = { id: this.userForm.id, userData: { username: this.userForm.username, role: this.userForm.role, password: this.userForm.password || undefined } };
          this.editUser(update)
            .then(() => {
              this.$message.success('保存成功');
              this.dialogVisible = false;
              this.init();
            })
            .catch(err => this.$message.error(err?.message || '保存失败'))
        }
      })
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

    openResetDialog(user) {
      this.resetForm = { id: user.id, username: user.username, newPassword: '' };
      this.resetVisible = true;
    },
    submitReset() {
      this.$refs.resetFormRef.validate(valid => {
        if (!valid) return;
        this.resetPassword({ id: this.resetForm.id, newPassword: this.resetForm.newPassword })
          .then(() => {
            this.$message.success('密码已重置');
            this.resetVisible = false;
          })
          .catch(err => this.$message.error(err?.message || '重置失败'))
      })
    },
  },

  created() {
    this.init(); // 在创建时初始化用户列表
  },
};
</script>

<style scoped>
.toolbar { margin-bottom: 12px; display:flex; align-items:center; }
.mr8 { margin-right: 8px; }
</style>
