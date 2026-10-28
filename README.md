# 人生指南

一款完全离线的 Android 聊天式原文检索应用。它把《高性价比人生指南》34 章、767 条建议放在手机本地，回答问题时给出相关原文要点、成本、收益、证据等级和出处；可从回答直达原文，也能按目录浏览全部条目。聊天记录只保存在本机。

## 获取与使用

- 在 [Releases](https://github.com/bietou123/life-guide-offline/releases) 下载 APK，安装后不需要注册或联网。
- 问题尽量描述具体处境，例如“租房押金不退怎么办”。“检索”突出原文要点；“分析”补充原文中的投入、收益依据和适用边界。
- 输入栏左侧的书本图标可打开全文与目录，回答下方的“读这条原文”可定位到相关条目，右上角按钮可开启新对话。

这是基于本地 BM25 检索和规则整理的参考工具，**不调用语言模型，也不联网验证信息的新旧**；当原文没有匹配内容时会拒绝编造。医疗、法律和紧急情况请以当时当地的专业意见及官方规定为准。

## 本地运行

要求 Node.js 20+，安装依赖后启动 Vite：

```sh
npm ci
npm run dev
```

终端输出本机地址。运行测试：

```sh
npm test
npm run test:search
npm run test:ui -- http://127.0.0.1:5201/
```

UI 测试使用 `puppeteer-core`，需要安装 Chrome；`CHROME_PATH` 可以指定可执行文件路径。UI 测试时需先在 5201 端口运行 `npm run dev -- --host 127.0.0.1 --port 5201`。

## Android APK

需要 JDK 17 和 Android SDK Platform 34、Build Tools 34、Platform Tools；设置 `JAVA_HOME` 和 `ANDROID_HOME` 后执行：

```sh
npm run sync
npm run apk
```

Windows 上构建出的调试 APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`。如需生成可持续更新的正式包，在本机设置 `LIFE_GUIDE_KEYSTORE`（私有密钥的绝对路径）、`LIFE_GUIDE_KEYPASS` 和 `LIFE_GUIDE_KEYALIAS`，再在 `android/` 运行 `./gradlew.bat assembleRelease`。正式包位于 `android/app/build/outputs/apk/release/`。仓库不包含 Android SDK、JDK、签名材料或构建缓存；更新同一应用时必须保管好同一密钥。

## 原作、署名与许可

原文作者：[eternity4719 / HowToLiveBetter](https://github.com/eternity4719/HowToLiveBetter)，在线原文：[高性价比人生指南](https://eternity4719.github.io/HowToLiveBetter/)。书中 Markdown 原文见 `data-book/`；`public/data/` 是从该原文生成的条目、目录和检索索引。本项目对原文做了结构化、检索和聊天形式的展示改编，不代表原作者认可本应用。原文和由它生成的数据采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可，原作 [LICENSE](https://github.com/eternity4719/HowToLiveBetter/blob/main/LICENSE)；应用代码采用本仓库 [MIT 许可](LICENSE)。

已核对原作第一章和最后一章的文件哈希与上游一致。更新数据时，先将上游 `book/*.md` 同步到 `data-book/`，再执行 `npm run data`（需要 Python 3），并重新运行测试。当前内置原文取自上游 `main` 分支提交 `e2605d3e2242bd6216c9255192b8a8957a08c55a`。
