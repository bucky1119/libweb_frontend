<template>
  <div class="navbar">
    <!-- todo 网站logo替换 -->
    <hamburger :is-active="sidebar.opened" class="hamburger-container" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <div class="user-actions">
        <!-- <div class="sign-in-action" @click="handlSignIn">注册</div> -->
        <div v-if="!hasToken" class="log-in-action" @click="handleLogIn">登录</div>
        <div v-else>欢迎：{{username}}</div>
      </div>
  <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="require('@/assets/icons/user2.png')" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
           <!-- 系统管理：仅 ADMIN 可见 -->
          <!-- 仅在已登录且为 ADMIN 时显示系统管理 -->
          <router-link v-if="hasToken && isAdmin" to="/userManage">
            <el-dropdown-item>
              系统管理
            </el-dropdown-item>
          </router-link>
          <!-- <a target="_blank" href="https://github.com/PanJiaChen/vue-admin-template/">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a> -->
          <el-dropdown-item divided @click.native="logout" v-if="hasToken">
            <span style="display:block;">退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

    </div>
  </div>
</template>

<script>
  import { mapGetters,mapState } from 'vuex'
  import Breadcrumb from '@/components/Breadcrumb'
  import Hamburger from '@/components/Hamburger'
  import { getToken, getUsername } from "@/utils/auth"; // get token from cookie

  export default {
    components: {
      Breadcrumb,
      Hamburger
    },
    computed: {
      ...mapGetters([
        'sidebar',
        'avatar',
        'roles',
        'token',
      ]),
      ...mapState({
        rolesState: state => state.user.roles,
        tokenState: state => state.user.token,
      }),
      hasToken ()
      {
        // determine whether the user has logged in
        // 优先使用 Vuex 中的 token，回退到 cookie
        const token = this.token || this.tokenState || getToken();
        return Boolean(token);
      },
      username ()
      {
        const name = getUsername();
        return name;
      },
      avatar ()
      {
        const src = "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif";
        return src;
      },
      isAdmin() {
        const role = this.roles || this.rolesState;
        // 支持字符串或数组两种形式
        return Array.isArray(role) ? role.includes('ADMIN') : role === 'ADMIN';
      }
    },
    methods: {
      // toggleSideBar()
      // {
      //   this.$store.dispatch('app/toggleSideBar')
      // },
      async logout () {
        try {
          await this.$store.dispatch('user/logout');
        } catch (e) {
          // 已在 action 内兜底清理
        }
        // 跳转到主页，并刷新，确保界面与路由完全重置
        this.$router.push('/dashboard');
        location.reload();
      },



      // 点击跳转至登录页面
      handleLogIn ()
      {
        this.$router.push(`/login?redirect=${this.$route.fullPath}`)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
    background-color: #4a4a4a; /* 优化背景颜色为更柔和的深灰色 */
    color: #f5f5f5; /* 优化字体颜色为浅灰色，提升对比度 */

    .hamburger-container {
      line-height: 46px;
      height: 100%;
      float: left;
      transition: background .3s;
      -webkit-tap-highlight-color: transparent;

      &:hover {
        background: rgba(255, 255, 255, .1); /* 增加悬停效果 */
      }
    }

    .breadcrumb-container {
      float: left;
      font-size: 14px; /* 调整字体大小 */
      color: #dcdcdc; /* 优化字体颜色 */
    }

    .right-menu {
      display: flex;
      float: right;
      height: 100%;
      line-height: 50px;

      &:focus {
        outline: none;
      }

      .right-menu-item {
        display: inline-block;
        padding: 0 8px;
        height: 100%;
        font-size: 16px; /* 调整字体大小 */
        color: #e0e0e0; /* 优化字体颜色 */
        vertical-align: text-bottom;

        &.hover-effect {
          cursor: pointer;
          transition: background .3s;

          &:hover {
            background: rgba(255, 255, 255, .1); /* 增加悬停效果 */
          }
        }
      }

      .user-actions {
        margin-right: 30px;
        display: flex;

        .sign-in-action {
          margin-right: 12px;
          cursor: pointer;
          color: #b0b0b0; /* 优化字体颜色 */
          font-weight: bold; /* 增加字体粗细 */
        }

        .log-in-action {
          cursor: pointer;
          color: #b0b0b0; /* 优化字体颜色 */
          font-weight: bold; /* 增加字体粗细 */
        }
      }

      .avatar-container {
        margin-right: 30px;

        .avatar-wrapper {
          margin-top: 5px;
          position: relative;

          .user-avatar {
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%; /* 改为圆形头像 */
            border: 2px solid #f5f5f5; /* 增加边框 */
          }

          .el-icon-caret-bottom {
            cursor: pointer;
            position: absolute;
            right: -20px;
            top: 25px;
            font-size: 12px;
            color: #dcdcdc; /* 优化颜色 */
          }
        }
      }
    }
  }
</style>