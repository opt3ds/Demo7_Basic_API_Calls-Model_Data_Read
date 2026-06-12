import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { createHtmlPlugin } from "vite-plugin-html";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import fs from "fs";
import path from "path";
const getViteEnv = (mode, target) => {
  return loadEnv(mode, process.cwd())[target];
};

// Read config.json to get backend URL
const configPath = resolve(__dirname, "public/static/config.json");
let backendUrl = ""; // 默认值
console.log("configPath:", configPath);
try {
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent);
    console.log("Backend URL from config.json:", config.baseUrl);
    backendUrl = config.baseUrl;
  }
} catch (error) {
  console.warn("Failed to read config.json, using default backend URL:", backendUrl);
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    build: {
      outDir: "./dist",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            'three': ['three'],
            'ant-design-vue': ['ant-design-vue'],
            'vendor': ['vue', 'vue-router', 'pinia']
          }
        }
      }
    },
    plugins: [
      vue(),
      // 暂时注释掉 HTML 插件，看看是否影响静态文件服务
      // createHtmlPlugin({
      //   inject: {
      //     data: {
      //       //将环境变量 VITE_APP_TITLE 赋值给 title 方便 html页面使用 title 获取系统标题
      //       title: getViteEnv(mode, "VITE_APP_TITLE"),
      //     },
      //   },
      // }),
      AutoImport({
        dts: "src/auto-imports.d.ts",
        imports: ["vue", "vue-router"],
      }),
      Components({
        dts: "src/components.d.ts",
        deep: true,
        dirs: ["src/components"],
        extensions: ["vue", "tsx"],
        resolvers: [AntDesignVueResolver({ importStyle: false })],
      }),
    ],
    // 解析配置
    resolve: {
      // 路径别名
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 18083,
      fs: {
        strict: false,
        allow: ['..']
      },
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
    },
    envDir: resolve(__dirname, "./env"),
  };
});
