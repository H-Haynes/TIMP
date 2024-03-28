
import { globalShortcut, session, BrowserWindow } from 'electron'
import { join, resolve } from 'node:path';
import os from "node:os"

// import { devtools } from '@vue/devtools'

// 注册全局快捷键【FIXME:mac播放控制需要受信任证书，】
export const registerKeyboardEvent = (window: BrowserWindow) => {
  globalShortcut.register('MediaPreviousTrack', () => {
    // 处理上一首事件
    window.webContents.send('media-previous-track');
  });

  globalShortcut.register('MediaNextTrack', () => {
    // 处理下一首事件
    window.webContents.send('media-next-track');
  });

  globalShortcut.register('MediaPlayPause', () => {
    // 处理播放/暂停事件
    window.webContents.send('media-play-pause');
  });

  globalShortcut.register('MediaStop', () => {
    // 处理停止事件
    window.webContents.send('media-stop');
  });
}


// 加载调试工具
export const loadDevtools = (window: BrowserWindow) => {
  const vueDevToolsPath = join(
    os.homedir(),
    '/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.6.1_0'
  )
  // devtools.connect(/* host (the default is "http://localhost"), port (the default is 8090) */)
  // devtools.connect("http://127.0.0.1", 8098)

  import('electron-devtools-installer').then(({ default: installExtension, VUEJS3_DEVTOOLS }) => {
    installExtension(VUEJS3_DEVTOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    })
  })
    .then(() => console.log('---------Vue调试工具已加载------------'))
    .catch(e => console.error('Failed install extension:', e));

  window.webContents.session.loadExtension(vueDevToolsPath)
}
