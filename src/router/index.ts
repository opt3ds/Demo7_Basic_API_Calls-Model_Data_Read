import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import index from "../views/index.vue";

// 定义路由
const routes = [
  {
    path: "/",
    name: "index",
    meta: { title: "Opt Loader for Three.js Web Service" },
    component: index,
  },
  
];

// 创建路由
const router = createRouter({
  // Using History mode createWebHistory(). For hash mode, use createWebHashHistory()
  history: createWebHashHistory(),
  routes,
});

// 获取系统标题
const title = import.meta.env.VITE_APP_TITLE;

// 进度条配置
NProgress.configure({ showSpinner: false });

// 前置路由守卫
router.beforeEach((to, from, next) => {
  // 动态修改title
  document.title = title;
  // 开启进度条
  NProgress.start();
  next();
});

// 后置路由守卫
router.afterEach(() => {
  // 关闭进度条
  NProgress.done();
});

// 导出路由
export default router;
