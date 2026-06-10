/**
 * @fileoverview 文件下载处理
 *
 * 监听 Electron 会话的 will-download 事件，
 * 将下载任务委托给 Chromium 内置下载管理器。
 *
 * 流程：
 * 1. 渲染进程发送 download-file IPC → handlers 调用 setDownloadTask 设置文件名和目录
 * 2. handlers 调用 mainWin.webContents.downloadURL(url) 触发下载
 * 3. will-download 事件中设置保存路径，监听下载进度和完成状态
 * 4. 下载完成/失败后通知渲染进程
 */

import { BrowserWindow, session } from "electron"
import { join } from "node:path"

/** 当前下载任务的文件名 */
let downloadFileName = ""
/** 当前下载任务的保存目录 */
let downloadDir = ""

/**
 * 注册下载事件处理器
 *
 * 监听会话的 will-download 事件，设置保存路径并上报状态。
 *
 * @param mainWin - 主窗口 BrowserWindow 实例（用于向渲染进程发送状态通知）
 */
export function registerDownloadHandler(mainWin: BrowserWindow): void {
  session.defaultSession.on("will-download", (_event, item) => {
    item.setSavePath(join(downloadDir, downloadFileName))

    item.on("updated", (_event, state) => {
      if (state === "interrupted") {
        console.log("Download is interrupted but can be resumed")
      } else if (state === "progressing") {
        if (item.isPaused()) {
          console.log("Download is paused")
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })

    item.once("done", (_event, state) => {
      if (state === "completed") {
        console.log("Download completed")
        mainWin.webContents.send("download-completed", downloadFileName)
      } else {
        console.log(`Download failed: ${state}`)
        mainWin.webContents.send("download-fail", downloadFileName)
      }
    })
  })
}

/**
 * 设置当前下载任务的文件名和保存目录
 *
 * 在调用 downloadURL 之前调用，确保 will-download 事件中能获取到正确的路径。
 *
 * @param fileName - 下载后保存的文件名
 * @param dir - 下载保存目录的绝对路径
 */
export function setDownloadTask(fileName: string, dir: string): void {
  downloadFileName = fileName
  downloadDir = dir
}
