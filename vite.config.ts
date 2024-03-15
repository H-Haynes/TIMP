import path from 'path';
import { rmSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import pkg from './package.json';
import UnoCSS from "unocss/vite"
import ElementPlus from "unplugin-element-plus/vite"


import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import PiniaAutoRefs from 'pinia-auto-refs';


rmSync('dist-electron', { recursive: true, force: true });

const isDevelopment =
  process.env.NODE_ENV === 'development' || !!process.env.VSCODE_DEBUG;
const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },

  resolve: {
    alias: {
      "~": path.resolve(process.cwd()),
      "@": path.resolve(__dirname, "./src")
    }
  },

  plugins: [
    vue(),
    ElementPlus({}),
    AutoImport({
      dirs: ['./src'],
      imports: [
        'vue',
        'vue-router',
        'pinia',
        'vue-i18n',
        'vue/macros',
        '@vueuse/core',
        {
          '@/helper/pinia-auto-refs': ['useStore'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      eslintrc: {
        enabled: false, // 默认 false,true启用。生成一次就可以，避免每次工程启动都生成
        filepath: 'src/.eslintrc-auto-import.json', // 默认 "./.eslintrc-auto-import.json"
        globalsPropValue: true, // 默认 true (true | false | "readonly" | "readable" | "writable" | "writeable")
      },
    }),
    Components({
      extensions: ['vue'],
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })], //自动按需导入 Element-Plus 组件
      dirs: ['src/components/'],
      dts: true,
    }),
    PiniaAutoRefs({
      // storeDir: path.resolve(__dirname, './src/store'),
      // outputFile: path.resolve(__dirname, './src/helper/pinia-auto-refs.ts'),
    }),

    UnoCSS(),
    electron([
      {
        // Main-Process entry file of the Electron App.
        entry: 'electron/main/index.ts',
        onstart(options) {
          if (process.env.VSCODE_DEBUG) {
            console.log(
              /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App'
            );
          } else {
            options.startup();
          }
        },
        vite: {
          build: {
            sourcemap: isDevelopment,
            minify: isProduction,
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: Object.keys(
                'dependencies' in pkg ? pkg.dependencies : {}
              ),
            },
          },
        },
      },
      {
        entry: 'electron/preload/index.ts',
        onstart(options) {
          // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
          // instead of restarting the entire Electron App.
          options.reload();
        },
        vite: {
          build: {
            sourcemap: isDevelopment,
            minify: isProduction,
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: Object.keys(
                'dependencies' in pkg ? pkg.dependencies : {}
              ),
            },
          },
        },
      },
    ]),

    // Use Node.js API in the Renderer-process
    renderer({
      nodeIntegration: true,
    }),
  ],

  server: process.env.VSCODE_DEBUG
    ? (() => {
      const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
      return {
        host: url.hostname,
        port: +url.port,
      };
    })()
    : undefined,
  clearScreen: false,
});
