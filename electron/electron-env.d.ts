/**
 * @fileoverview Electron 环境类型声明
 *
 * 扩展 Node.js 全局类型，声明 Electron 主进程中由 vite-plugin-electron
 * 注入的环境变量和构建产物路径。
 */

/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /** 是否为 VS Code 调试模式 */
    VSCODE_DEBUG?: "true"
    /** dist-electron 目录的绝对路径 */
    DIST_ELECTRON: string
    /** dist 目录的绝对路径（前端构建产物） */
    DIST: string
    /** 静态资源目录：开发模式为 /public/，生产模式为 /dist/ */
    PUBLIC: string
  }
}
