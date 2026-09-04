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

// Read config.json to get the backend address
const configPath = resolve(__dirname, "public/static/config.json");
let backendUrl = ""; // Default value
console.log("configPath:", configPath);
try {
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configContent);
    console.log("Backend address read from config.json:", config.baseUrl);
    backendUrl = config.baseUrl;
  }
} catch (error) {
  console.warn("Failed to read config.json, using the default backend address:", backendUrl);
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
      // Temporarily comment out the HTML plugin to see whether it affects the static file service
      // createHtmlPlugin({
      //   inject: {
      //     data: {
      //       // Assign the environment variable VITE_APP_TITLE to title so the html page can use title to get the system title
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
    // Resolve configuration
    resolve: {
      // Path alias
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
