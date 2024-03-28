# TIMP音乐聚合平台

TIMP音乐聚合平台是一个聚合多个平台的桌面音乐播放软件，项目基于vue3 + vite + electron + unocss进行开发，数据来源于github开源项目.

- 网易云音乐: [网易云音乐API](https://github.com/Binaryify/NeteaseCloudMusicApi)
- QQ音乐API: [QQ音乐API](https://github.com/Rain120/qq-music-api)
- 酷狗音乐API: [酷狗音乐API](https://github.com/H-Haynes/kuwoMusicApi)
- 酷我音乐API: [酷我与酷狗同项目](https://github.com/H-Haynes/kuwoMusicApi)

## 项目开发运行环境

[![Required Node.JS >= v16.13](https://img.shields.io/static/v1?label=node&message=%3E=16.13&logo=node.js&color)](https://nodejs.org/about/releases/)
[![Required npm >= v8.1](https://img.shields.io/static/v1?label=npm&message=%3E=8.1&logo=npm&color)](https://github.com/npm/cli/releases)

## 开发命令

- `npm run app:dev` : 本地开发并开启热更新
- `npm run compile`: 编译为桌面应用程序
- `npm run build` : 项目打包
- `npm run test` : 本地测试
- `npm run dist --平台 --架构`: 打包为对应系统安装包程序

## mac logo生成

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
```

## 应用程序功能展示

![首页](./desc/desc1.png)
![歌单详情](./desc/desc2.png)
![视频](./desc/desc3.png)
![视频播放](./desc/desc4.png)
![歌词](./desc/desc5.png)
