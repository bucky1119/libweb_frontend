import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import { getToken } from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const whiteList = ["/login", "/signin", "/dashboard"]; // no redirect whitelist
let retryCount = 0;

// 优化后的路由守卫
router.beforeEach(async (to, from, next) => {
  // Start progress bar
  NProgress.start();

  // Set page title
  document.title = getPageTitle(to.meta.title);

  // Determine whether the user has logged in
  const hasToken = getToken();

  if (hasToken) {
    if (to.path === "/login") {
      // If is logged in, redirect to the home page
      next({ path: "/" });
      NProgress.done();
    } else {
      const rolesGetter = store.getters.roles;
      const hasRoles = Array.isArray(rolesGetter)
        ? rolesGetter.length > 0
        : Boolean(rolesGetter);

      if (hasRoles) {
        // Check if route has role restrictions and whether user has permission
        const userRoles = Array.isArray(rolesGetter) ? rolesGetter : [rolesGetter];
        if (to.meta.roles && !to.meta.roles.some(r => userRoles.includes(r))) {
          Message.error("无访问权限"); // 显示无权限提示
          next({ path: "/" }); // 重定向至默认页面
          NProgress.done();
        } else {
          next();
        }
      } else {
        try {
          // Get user info
          const { roles } = await store.dispatch("user/getInfo");

          // Generate accessible routes map based on roles
          const rolesArr = Array.isArray(roles) ? roles : [roles];
          const accessRoutes = await store.dispatch("permission/generateRoutes", rolesArr);

          // Dynamically add routes
          router.addRoutes(accessRoutes);

          // Check if current route matches any added route to prevent infinite recursion
          if (to.matched.length > 0) {
            next({ ...to, replace: true });
          } else {
            next("/"); // Redirect to home if route not found
          }
        } catch (error) {
          // Handling error when getting user information
          if (retryCount < 3) {
            retryCount += 1;
            await store.dispatch("user/resetToken");
            Message.error(error || "出错了，请重新登录");
            next(`/login?redirect=${to.path}`);
          } else {
            Message.error("登录信息获取失败，请重试");
            retryCount = 0;
            next("/login");
          }
          NProgress.done();
        }
      }
    }
  } else {
    // No token
    if (whiteList.includes(to.path)) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  // Finish progress bar
  NProgress.done();
});
