# 版本更新系统

## 概述

TIMP 支持三种更新模式，通过后端 API 检查并获取更新信息。

| 模式     | 更新类型        | 用户感知 | 行为                                     |
| -------- | --------------- | -------- | ---------------------------------------- |
| 热更新   | `wgt` / `patch` | 无感     | 静默下载 → 解压覆盖 → 自动重载页面       |
| 自动安装 | `apk`           | 有感     | 下载安装包 → 自动启动安装程序 → 退出应用 |
| 整包下载 | 其他            | 有感     | 下载完整包 → 提示用户手动安装            |

## 架构

```
src/views/setting/index.vue          # 设置页：检查更新按钮 + 自动检查开关
src/components/UpdateDialog.vue      # 更新弹窗：版本信息、进度条、操作按钮
src/api/update.ts                    # API 层：调用后端接口
electron/main/updater.ts             # 主进程：下载、安装、IPC 处理
```

### 数据流

```
[设置页] ──checkUpdate()──→ [后端 API]
    │                          │
    │ ←── { hasUpdate, ... } ──┤
    │
    ├── send("show-update-dialog") ──→ [主进程] ── forward ──→ [UpdateDialog]
    │
    │  用户点击"立即更新"
    │
    ├── send("start-download") ──→ [主进程] ── http.get ──→ [CDN/文件服务器]
    │                                   │
    │   ←── update-download-progress ───┤  (进度实时推送)
    │   ←── update-download-completed ──┤  (下载完成)
    │
    ├── send("install-update") ──→ [主进程]
    │                                   │
    │   wgt/patch → reload()            │
    │   apk       → shell.openPath() + quit()
    │   其他      → shell.showItemInFolder()
```

## IPC 通道

### 渲染进程 → 主进程

| 通道                 | 数据                       | 说明                                   |
| -------------------- | -------------------------- | -------------------------------------- |
| `show-update-dialog` | `UpdateInfo`               | 触发显示更新弹窗，主进程转发回渲染进程 |
| `start-download`     | `UpdateInfo`               | 开始下载更新包                         |
| `cancel-download`    | 无                         | 取消进行中的下载                       |
| `install-update`     | `{ updateType, filePath }` | 执行安装操作                           |

### 主进程 → 渲染进程

| 通道                        | 数据                                   | 说明                                |
| --------------------------- | -------------------------------------- | ----------------------------------- |
| `show-update-dialog`        | `UpdateInfo`                           | 主进程转发，UpdateDialog 接收后显示 |
| `update-download-progress`  | `{ percent, transferred, total }`      | 下载进度                            |
| `update-download-completed` | `{ filePath, updateType, updateInfo }` | 下载完成                            |
| `update-download-error`     | `string`                               | 下载失败的错误信息                  |
| `wgt-installed`             | `string`                               | WGT 解压路径（安装完成后触发重载）  |

## 后端接口

### 检查更新

```
GET /timp/update/check
```

**响应格式：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "hasUpdate": true,
    "forceUpdate": false,
    "updateType": "wgt",
    "versionName": "3.0.1",
    "versionCode": 4,
    "updateDesc": "修复了一些已知问题",
    "wgtUrl": "https://cdn.example.com/update/TIMP_3.0.1.wgt",
    "apkUrl": "https://cdn.example.com/update/TIMP_3.0.1.exe",
    "patchUrl": "https://cdn.example.com/update/TIMP_3.0.1.patch"
  }
}
```

**字段说明：**

| 字段          | 类型      | 必填 | 说明                              |
| ------------- | --------- | ---- | --------------------------------- |
| `hasUpdate`   | `boolean` | 是   | 是否有可用更新                    |
| `forceUpdate` | `boolean` | 是   | 是否强制更新（弹窗不可关闭）      |
| `updateType`  | `string`  | 是   | 更新类型：`wgt` / `apk` / `patch` |
| `versionName` | `string`  | 是   | 新版本号（展示用）                |
| `versionCode` | `number`  | 是   | 新版本号（比较用）                |
| `updateDesc`  | `string`  | 否   | 更新说明                          |
| `wgtUrl`      | `string`  | 否   | WGT 热更新包下载地址              |
| `apkUrl`      | `string`  | 否   | 整包/安装包下载地址               |
| `patchUrl`    | `string`  | 否   | 补丁包下载地址                    |

### updateType 与更新行为对照

| `updateType` | 下载的 URL | 完成后行为                                            |
| ------------ | ---------- | ----------------------------------------------------- |
| `wgt`        | `wgtUrl`   | 解压至 `userData/wgt-patch/` → `webContents.reload()` |
| `patch`      | `patchUrl` | 同 `wgt`                                              |
| `apk`        | `apkUrl`   | `shell.openPath()` → `app.quit()`                     |
| 其他         | `apkUrl`   | `shell.showItemInFolder()` 打开文件所在目录           |

## 组件说明

### UpdateDialog

位置：`src/components/UpdateDialog.vue`

挂载于 `App.vue`，全局监听 `show-update-dialog` 事件。

**状态机：**

```
idle ──"立即更新"──→ downloading ──完成──→ completed ──"安装/重启"──→ 执行安装
  ↑                      │                       │
  └──── "稍后提醒" ←──────┘       失败            │
                                 ↓               │
                               error ──"重新下载"──┘
```

**强制更新：** 当 `forceUpdate: true` 时，弹窗无法通过 ESC、点击遮罩或关闭按钮关闭，用户必须执行更新。

### 设置页集成

在 `src/views/setting/index.vue` 的"版本更新"区域：

- **检查更新按钮** — 调用后端 API，有更新则弹出 UpdateDialog，无更新则提示"已是最新版本"
- **自动检查更新开关** — 保存至 `playSetting` store（`autoCheckUpdate` 字段）
- **当前版本显示** — 读取 `package.json` 中的 `version`

## 文件清单

```
src/api/update.ts                        # API 端点
src/components/UpdateDialog.vue          # 更新弹窗组件
src/views/setting/index.vue              # 设置页（新增版本更新区域）
src/App.vue                              # 根组件（挂载 UpdateDialog）
electron/main/updater.ts                 # 更新管理器 + IPC 注册
electron/main/index.ts                   # 主进程入口（注册更新处理器）
electron/preload/index.ts                # 预加载脚本（新增 invoke 方法）
src/typings/global.d.ts                  # 类型声明（新增 invoke 类型）
```

## 下载路径

| 平台    | 路径                                         |
| ------- | -------------------------------------------- |
| Windows | `%USERPROFILE%\Downloads\TIMP_{version}.exe` |
| macOS   | `~/Downloads/TIMP_{version}.dmg`             |
| Linux   | `~/Downloads/TIMP_{version}.AppImage`        |

WGT/补丁包解压路径：`app.getPath('userData')/wgt-patch/`
