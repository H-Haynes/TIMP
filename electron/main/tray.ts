/**
 * @fileoverview 系统托盘
 *
 * 创建系统托盘图标，显示应用名称和当前歌词。
 * 托盘标题由 handlers 模块中的 lyric IPC 处理器动态更新。
 */

import { Tray, nativeImage } from "electron"
import { resolve } from "node:path"

/**
 * 创建系统托盘
 *
 * 使用 public 目录下的 timp_32x32@2x.png 作为托盘图标，
 * 初始标题设置为应用名称。
 *
 * @returns 创建的 Tray 实例
 */
export function createTray(): Tray {
  const iconPath = resolve(__dirname, "../../public/timp_32x32@2x.png")
  const icon = nativeImage.createFromPath(iconPath)
  const tray = new Tray(icon)
  tray.setTitle("TIMP音乐，随心而行")
  return tray
}
