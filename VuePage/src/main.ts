import { createApp } from "vue";
import router from "./router";
import store from "./store";
import "./style.less";
import App from "./App.vue";
import "ant-design-vue/dist/reset.css";
import { DatePicker } from "ant-design-vue";
import { useModelStore } from "./store/modules/model";

// Check whether the current page needs to initialize the Vue application
const currentPath = window.location.pathname;
const currentPage = window.location.pathname.split('/').pop();
const fullPath = window.location.href;

console.log('Current path info:');
console.log('- pathname:', currentPath);
console.log('- currentPage:', currentPage);
console.log('- fullPath:', fullPath);

// If a static file page is being accessed, do not initialize the Vue application
if (currentPath.startsWith('/static/') || currentPage === 'server.html' || fullPath.includes('/static/server.html')) {
  console.log('A static file page is being accessed, skipping Vue application initialization');
  
  // If there is a hash in the URL, clear it
  if (window.location.hash) {
    // Use replaceState to modify the URL without creating a history entry
    window.history.replaceState({}, '', window.location.pathname + window.location.search);
  }
  
  // Ensure the page does not redirect
  window.stop();
} else {
  console.log('Initializing the Vue application');
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
      // Handle the error
      console.error(error);
    });
}
