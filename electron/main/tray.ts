import { Tray, nativeImage } from "electron"
import { resolve } from "node:path"

export function createTray(): Tray {
  const iconPath = resolve(__dirname, "../../public/timp_32x32@2x.png")
  const icon = nativeImage.createFromPath(iconPath)
  const tray = new Tray(icon)
  tray.setTitle("TIMP音乐，随心而行")
  return tray
}
