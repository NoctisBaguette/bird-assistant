# 中英文手机竖屏交互原型 v0.6

下载并打开[v0.6单文件原型](dist/bird-assistant-prototype-offline-v0.6.html)，或预览dist/index.html。历史v0.5 HTML保留为提交快照。

导航：首页｜手帐｜识别｜讨论｜我的；收藏在我的页面。中央56×56圆形识别按钮沿用原样。

## 手帐体验

手帐 → 打开示例素材 → 下一步 → 选择风格/比例 → 生成初稿。点选画布元素，或通过“选中元素”列表选择。照片可裁剪、移动、缩放、旋转和替换；文字可改内容、字体、字号、颜色和对齐。背景、图层及装饰可调整，支持撤销/重做。整体重排先预览再应用。

保存草稿写入当前浏览器localStorage，刷新后仍可从手帐首页打开；不是云端保存。更换浏览器或移动HTML可能看不到原草稿。保存失败保留编辑，仍可导出。重置会话保留已保存手帐，清除本机草稿须单独确认。

预览与导出 → 生成PNG → 下载PNG，生成真实图片。用成品图写帖子只打开演示草稿，不自动发布或公开观察。系统分享依浏览器支持；微信好友、朋友圈与相册权限未接入。

## 边界

初稿由本地模板排版，无真实AI；样例是代码插画。未知日期保持未知，周期类型仅标记草稿，不启动任务。正式设计见[手帐设计](../08-scrapbook-design.md)。

相册导入仅本地读取JPG/PNG/WebP，单文件6 MB内，生成最长边1400像素的预览副本。设备原件不改动，不读取EXIF；1–6张每页为演示限制。

地图、相机、声音、识别、账号和论坛仍是示例或模拟。观察和互动按会话保留；微信真机、真实模型和完整后端须另行验收。

## 源码与检查

原有dist/app.js、dist/style.css与dist/index.html保留。手帐源码在dist/scrapbook.js和dist/scrapbook.css。

- node scripts/build-offline.mjs：重建v0.6离线HTML。
- node --check dist/app.js 与 node --check dist/scrapbook.js：语法。
- node --test tests/scrapbook.test.cjs：关键状态与异常保留。
- 上级目录python validate.py与python validate-scrapbook.py：中英文结构和链接。

具体浏览器结果及限制见[QA.md](QA.md)。

## English

The v0.6 standalone prototype replaces Collection with Journal; Collection stays under Profile. Journals support editable objects, crop, template reflow previews, explicit browser-local saving and PNG export. This is not native WeChat integration or AI. Period labels and the fixed suggestion card do not run tasks; forum actions remain a session demo.

Imports become previews up to 1400 pixels, leaving device files unchanged, without EXIF extraction. Demo limits: six images/page and 6 MB/image. Saved journals are browser/origin-local without account sync; other observation/social state remains session-only. See the [English design](../en/09-scrapbook-design.md).
