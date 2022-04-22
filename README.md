<br>
<br>

<p align="center">
	<img height="200" src="./public/icon.png" alt="LiveMoe">
</p>

<p align="center">
	一款基于 Electron 的免费开源桌面壁纸播放器
</p>
<br>
<br>

## 功能

- 控制壁纸的播放暂停
- 改变任务栏透明度或者自定义颜色(PS: 该功能在建设中, 指还没有 UI 入口)
- 改变鼠标样式(PS: 该功能在建设中, 指还没有 UI 入口)
- 可视化壁纸选择界面
- 可视化的设置界面
- 快速创建壁纸(PS: 该功能在建设中)

## 快速开始

### 安装

- Windows 目前该软件仅适配了 Windows 平台, 并且大部分功能为 Windows 独有, 从 [GitHub](https://github.com/SEVEN-1-bit/LiveMoe/releases) 下载 LiveMoe 的安装包。

## ⌨️ 本地开发

### 克隆代码

```bash
git clone git@github.com:SEVEN-1-bit/LiveMoe.git
```

### 安装依赖

```bash
cd LiveMoe
yarn
```

天朝大陆用户建议使用淘宝的 npm 源

```bash
yarn config set registry 'https://registry.npm.taobao.org'
npm config set registry 'https://registry.npm.taobao.org'
export ELECTRON_MIRROR='https://npm.taobao.org/mirrors/electron/'
```

> Error: Electron failed to install correctly, please delete node_modules/electron and try installing again

`Electron` 下载安装失败的问题，解决方式请参考 https://github.com/electron/electron/issues/8466#issuecomment-571425574

原生模块编译失败的问题，请确保你安装了 `windows-build-tools`
### 开发模式

```bash
// 先打开一个命令行运行
yarn run sr
// 再打开一个命令行运行
yarn run sm
```

### 编译打包

```bash
yarn run package
```

完成之后可以在项目的 `release/build` 目录看到编译打包好的应用文件

## 🛠 技术栈

- [Electron](https://electronjs.org/)
- [React](https://react.docschina.org/) + [Redux](https://redux.js.org/) + [Mui](https://mui.com/zh/)
- [Node Addon](https://github.com/nodejs/node-addon-api)

## 🤝 参与共建 [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)

如果你有兴趣参与共同开发，欢迎 FORK 和 PR。

## 📜 开源许可

[MIT](./LICENSE) License © 2022 [Seven](https://github.com/SEVEN-1-bit)
