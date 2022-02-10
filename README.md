# TIMP音乐聚合平台

TIMP音乐聚合平台是一个聚合多个平台的桌面音乐播放软件，fork了vite-electron-builder仓库作为项目框架，项目采用vue3 + vite + electron + windicss进行开发，数据来源于github开源项目.

网易云音乐: [网易云音乐API](https://github.com/Binaryify/NeteaseCloudMusicApi)
QQ音乐API: [QQ音乐API](https://github.com/Rain120/qq-music-api)
酷狗音乐API: [酷狗音乐API](http://127.0.0.1)
咪咕音乐API: [咪咕音乐API](http://127.0.0.1)

## 项目开发运行环境

[![Required Node.JS >= v16.13](https://img.shields.io/static/v1?label=node&message=%3E=16.13&logo=node.js&color)](https://nodejs.org/about/releases/)
[![Required npm >= v8.1](https://img.shields.io/static/v1?label=npm&message=%3E=8.1&logo=npm&color)](https://github.com/npm/cli/releases)

## 设置环境变量

所有环境变量均在`import.meta`,你可以使用`import.meta.env`进行访问

如果使用`Typescript`，你需要在`types/env.d.ts`文件中添加所有环境变量到`importMetaEnv`

`mode`设置应在`import.meta.env.MODE`设置一个特殊值，环境变量文件加载时，该变量会被解析

默认情况下，有两种模式：

- `production`, 默认使用该值
- `development`，当使用`npm run watch`时，使用该值

当使用build命令时，从根目录的对一个的env环境加载环境变量:

```yml
.env                # 所有环境都会加载
.env.local          # 所有环境都会加载，但git提交时会被忽略
.env.[mode]         # 仅在对应mode时才会加载
.env.[mode].local   # 仅在对应mode时才会加载，git提交时会被忽略
```

## 开发命令

`npm run watch` : 本地开发并开启热更新
`npm run compile`: 编译为桌面应用程序
`npm run build` : 项目打包
`npm run test` : 本地测试
