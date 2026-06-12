import { createApp } from "vue";
import router from "./router";
import store from "./store";
import "./style.less";
import App from "./App.vue";
import "ant-design-vue/dist/reset.css";
import { DatePicker } from "ant-design-vue";
import { useModelStore } from "./store/modules/model";

// 检查当前页面是否需要初始化 Vue 应用
const currentPath = window.location.pathname;
const currentPage = window.location.pathname.split('/').pop();
const fullPath = window.location.href;

console.log('当前路径信息:');
console.log('- pathname:', currentPath);
console.log('- currentPage:', currentPage);
console.log('- fullPath:', fullPath);

// 如果是访问静态文件页面，不初始化 Vue 应用
if (currentPath.startsWith('/static/') || currentPage === 'server.html' || fullPath.includes('/static/server.html')) {
  console.log('访问静态文件页面，跳过 Vue 应用初始化');
  
  // 如果 URL 中有 hash，清除它
  if (window.location.hash) {
    // 使用 replaceState 修改 URL，不产生历史记录
    window.history.replaceState({}, '', window.location.pathname + window.location.search);
  }
  
  // 确保页面不会跳转
  window.stop();
} else {
  console.log('初始化 Vue 应用');
  const app = createApp(App);
  app.use(DatePicker);
  app.use(router);
  app.use(store);
  
  fetch("./static/config.json")
    .then((response) => response.json())
    .then((data) => {
      const modelStore = useModelStore();
      modelStore.setModelMessage(data);
      app.mount("#app");
    })
    .catch((error) => {
      // 处理错误
      console.error(error);
    });
}
