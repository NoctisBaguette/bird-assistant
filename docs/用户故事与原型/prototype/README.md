# 中英文手机竖屏交互原型

直接打开 dist/bird-assistant-prototype-offline-v0.5.html 可体验完整单文件演示；也可在同目录启动静态服务器后访问 dist/index.html。

dist/app.js、dist/style.css 和 dist/index.html 为源码。修改后在本目录执行 `node scripts/build-offline.mjs` 更新离线 HTML；执行 `node --check dist/app.js` 做语法检查。

示例地图、插画、合成示例音频、模型结果及演示身份均不是实际服务。相册文件只在本次浏览会话内读取，不上传。刷新或重置会恢复初始演示数据。

照片与声音结果可选择鸟种、比较参考、手动更正或保持待鉴定；私人保存、收藏、地图发布和论坛发布分别控制。评阅情景需选择后再执行对应操作，具体检查记录见 QA.md 及上级文档。
