# TIMP音乐聚合平台

TIMP音乐聚合平台是一个聚合多个平台的桌面音乐播放软件,目前支持网易、QQ、酷狗、咪咕，项目基于vue3 + vite + electron + unocss进行开发，数据来源于github开源项目及网络获取.

<!-- - 网易云音乐: [网易云音乐API](https://github.com/Binaryify/NeteaseCloudMusicApi)
- QQ音乐API: [QQ音乐API](https://github.com/Rain120/qq-music-api)
- 酷狗音乐API: [酷狗音乐API](https://github.com/H-Haynes/kuwoMusicApi)
- 酷我音乐API: [酷我与酷狗同项目](https://github.com/H-Haynes/kuwoMusicApi) -->

本次重构服务端对API进行了统一，减少请求数量，并采用redis缓存，提升响应速度

## 项目开发运行环境

[![Required Node.JS >= v16.13](https://img.shields.io/static/v1?label=node&message=%3E=16.13&logo=node.js&color)](https://nodejs.org/about/releases/)
[![Required npm >= v8.1](https://img.shields.io/static/v1?label=npm&message=%3E=8.1&logo=npm&color)](https://github.com/npm/cli/releases)

## 开发命令

- `npm run app:dev` : 本地开发并开启热更新
- `npm run compile`: 编译为桌面应用程序
- `npm run build` : 项目打包
- `npm run test` : 本地测试
- `npm run dist --平台 --架构`: 打包为对应系统安装包程序

<!-- ## mac logo生成

```shell
mkdir fan.iconset
sips -z 16 16     ~/logo.png --out fan.iconset/icon_16x16.png
sips -z 32 32     ~/logo.png --out fan.iconset/icon_16x16@2x.png
sips -z 32 32     ~/logo.png --out fan.iconset/icon_32x32.png
sips -z 64 64     ~/logo.png --out fan.iconset/icon_32x32@2x.png
sips -z 64 64     ~/logo.png --out fan.iconset/icon_64x64.png
sips -z 128 128     ~/logo.png --out fan.iconset/icon_64x64@2x.png
sips -z 128 128   ~/logo.png --out fan.iconset/icon_128x128.png
sips -z 256 256   ~/logo.png --out fan.iconset/icon_128x128@2x.png
sips -z 256 256   ~/logo.png --out fan.iconset/icon_256x256.png
sips -z 512 512   ~/logo.png --out fan.iconset/icon_256x256@2x.png
sips -z 512 512   ~/logo.png --out fan.iconset/icon_512x512.png
sips -z 1024 1024   ~/logo.png --out fan.iconset/icon_512x512@2x.png
sips -z 1024 1024   ~/logo.png --out fan.iconset/icon_1024x1024.png
iconutil -c icns fan.iconset -o logo.icns
``` -->

## 应用程序功能展示

+ 首页/排行榜
  + ![首页](./desc/rank.png)
+ 歌单
  + ![歌单](./desc/songList.png)
+ MV
  + ![MV](./desc/videoList.png)
+ 歌单详情
  + ![歌单详情](./desc/detail.png)
+ 下载
  + ![下载](./desc/download.png)
+ 播放界面
  + ![播放界面](./desc/lyric.png)
+ 桌面歌词
  + ![桌面歌词](./desc/desk-lyric.png)
+ 迷你歌词面板
  + ![迷你歌词面板](./desc/miniLyric.png)
+ 搜索
  + ![搜索](./desc/search.png)
+ 视频播放
  + ![视频播放](./desc/videoPlayer.png)
  + ![视频播放](./desc/videoDetail.png)
+ 主题
  + ![主题](./desc/theme.png)
+ 设置
  + ![设置](./desc/setting.png)
