/**
 * @fileoverview Electron Preload 脚本
 *
 * 在主进程和渲染进程之间建立安全的桥接层。
 *
 * 功能：
 * - contextBridge: 暴露 IPC 通信 API（send / receive / invoke）
 * - Loading 画面: 页面加载前显示 CSS 旋转方块动画，加载完成后自动移除
 * - DOM 安全操作: 防止重复添加/移除元素
 *
 * 渲染进程中可通过 `window.electron` 和 `window.versions` 访问暴露的 API。
 */

import { contextBridge, ipcRenderer } from "electron"

// ========================================================================
// Electron API 桥接
// ========================================================================

/**
 * 暴露给渲染进程的 Electron IPC API
 *
 * - `window.electron.send(channel, data)` — 向主进程发送单向消息
 * - `window.electron.receive(channel, callback)` — 监听主进程消息
 * - `window.electron.invoke(channel, ...args)` — 双向调用并获取返回值
 */
contextBridge.exposeInMainWorld("electron", {
  /**
   * 向主进程发送单向 IPC 消息
   * @param channel - IPC 通道名称
   * @param data - 可选的消息数据
   */
  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data)
  },

  /**
   * 监听来自主进程的 IPC 消息
   * @param channel - IPC 通道名称
   * @param func - 收到消息时的回调函数
   */
  receive: (channel: string, func: () => void) => {
    ipcRenderer.on(channel, func)
  },

  /**
   * 调用主进程方法并等待返回结果（双向通信）
   * @param channel - IPC 通道名称
   * @param args - 传递给主进程的参数
   * @returns 主进程返回的结果
   */
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args)
})

/** 暴露 Electron / Node.js / Chrome 版本信息到渲染进程 */
contextBridge.exposeInMainWorld("versions", process.versions)

// ========================================================================
// DOM 就绪检测
// ========================================================================

/**
 * 等待 DOM 进入指定就绪状态
 *
 * @param condition - 期望的 DocumentReadyState 数组，默认 ["complete", "interactive"]
 * @returns 当 DOM 满足条件时 resolve 的 Promise
 */
function domReady(condition: DocumentReadyState[] = ["complete", "interactive"]) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

// ========================================================================
// 安全的 DOM 操作工具
// ========================================================================

/** 安全的 DOM 操作：防止重复添加/移除子元素 */
const safeDOM = {
  /**
   * 安全地添加子元素（如果已存在则不重复添加）
   * @param parent - 父元素
   * @param child - 要添加的子元素
   * @returns 添加后的子元素，或 undefined（如果已存在）
   */
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },

  /**
   * 安全地移除子元素（如果不存在则跳过）
   * @param parent - 父元素
   * @param child - 要移除的子元素
   * @returns 被移除的子元素，或 undefined（如果不存在）
   */
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  }
}

// ========================================================================
// Loading 动画
// ========================================================================

/**
 * 页面加载动画
 *
 * 在 Vue 应用挂载之前显示一个 CSS 旋转方块动画，
 * 应用加载完成后通过 postMessage 触发移除。
 *
 * @see https://tobiasahlin.com/spinkit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement("style")
  const oDiv = document.createElement("div")

  oStyle.id = "app-loading-style"
  oStyle.innerHTML = styleContent
  oDiv.className = "app-loading-wrap"
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    /** 将 loading 样式和 DOM 添加到页面 */
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },

    /** 从页面移除 loading 样式和 DOM */
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    }
  }
}

// ========================================================================
// Loading 生命周期
// ========================================================================

const { appendLoading, removeLoading } = useLoading()

// DOM 就绪后立即显示 loading
domReady().then(appendLoading)

// 监听 Vue 应用发送的移除 loading 信号
window.onmessage = ev => {
  ev.data.payload === "removeLoading" && removeLoading()
}

/** 兜底：5 秒后自动移除 loading（防止加载卡死时 loading 不消失） */
setTimeout(removeLoading, 4999)
