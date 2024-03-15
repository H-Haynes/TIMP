import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';



// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null;
let lyricWindow: null | BrowserWindow = null

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true,
    },
    minWidth: 900,
    // frame:false,//无边框窗口
    // titleBarStyle: 'hidden' // 隐藏标题栏
  });


  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }


  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (import.meta.env.DEV) {
    import('electron-devtools-installer').then(({ default: installExtension, VUEJS3_DEVTOOLS }) => {
      installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
      })
    })
      .then(() => console.log('---------Vue调试工具已加载------------'))
      .catch(e => console.error('Failed install extension:', e));
  }

  // 主窗口销毁时，同时销毁子窗口
  win.on('closed', () => {
    // 销毁歌词窗口
    console.log('销毁 2')

    lyricWindow && lyricWindow.destroy();
    lyricWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  win = null;
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});



const openLyric = () => {
  if (lyricWindow) {
    // 存在歌词窗口，显示即可
    lyricWindow.show()
    return
  }

  // 不存在，创建窗口
  lyricWindow = new BrowserWindow({
    width: 800,
    height: 100,
    // parent:win,
    transparent: true, // 透明窗口
    // transparent: false, // 透明窗口

    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true,
    },
    x: (screen.getPrimaryDisplay().workArea.width - 800) / 2,
    y: screen.getPrimaryDisplay().workArea.height - 100,
    frame: false,
    backgroundColor: '#00000000',
  })
  global.lyricWindow = lyricWindow

  win.show(); // 不让焦点自动聚焦到子窗口
  // lyricWindow.loadURL(indexHtml + '#/lyric') // 加载子窗口页面内容


  if (process.env.VITE_DEV_SERVER_URL) {
    lyricWindow.loadURL(`${url}#/lyric`);
    console.log('here', `${url}#/lyric`)
  } else {
    lyricWindow.loadFile(indexHtml, { hash: '#/lyric' });
  }

  // 销毁歌词窗口
  lyricWindow.on('close', () => {
    console.log('销毁 1')
    lyricWindow && lyricWindow.destroy()
    lyricWindow = null
  })

}

// New window example arg: new windows url
// ipcMain.handle('open-win', (_, arg) => {
//   const childWindow = new BrowserWindow({
//     webPreferences: {
//       preload,
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });

//   if (process.env.VITE_DEV_SERVER_URL) {
//     childWindow.loadURL(`${url}#${arg}`);
//   } else {
//     childWindow.loadFile(indexHtml, { hash: arg });
//   }
// });

// 打开歌词窗口
ipcMain.on('openLyric', openLyric)
// 关闭歌词窗口
ipcMain.on('closeLyric', () => {
  lyricWindow && lyricWindow.hide()
})

// 歌词更新
ipcMain.on('lyric', (_, lyric: string) => {
  // 监听到歌词信息变更，通过事件传入子窗口
  console.log(lyric)
  lyricWindow && lyricWindow.webContents.send('lyric', lyric)
})

ipcMain.on('fixed', () => {
  lyricWindow && lyricWindow.setAlwaysOnTop(true);
  lyricWindow && lyricWindow.setMovable(false);
})

ipcMain.on('unfixed', () => {
  lyricWindow && lyricWindow.setAlwaysOnTop(false);
  lyricWindow && lyricWindow.setMovable(true);
});


