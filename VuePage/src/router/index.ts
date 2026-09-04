import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from "vue-router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import index from "../views/index.vue";

// Define routes
const routes = [
  {
    path: "/",
    name: "index",
    meta: { title: "Opt Loader for Three.js Web Service" },
    component: index,
  },
  
];

// Create the router
const router = createRouter({
  // History mode createWebHistory() is used here; to use hash mode, change it to createWebHashHistory()
  history: createWebHashHistory(),
  routes,
});

// Get the system title
const title = import.meta.env.VITE_APP_TITLE;

// Progress bar configuration
NProgress.configure({ showSpinner: false });

// Global before guard
router.beforeEach((to, from, next) => {
  // Dynamically change the title
  document.title = title;
  // Start the progress bar
  NProgress.start();
  next();
});

// Global after hook
router.afterEach(() => {
  // Finish the progress bar
  NProgress.done();
});

// Export the router
export default router;
