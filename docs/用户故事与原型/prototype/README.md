# 中英文手机竖屏交互原型 v0.9

下载并打开[v0.9单文件原型](dist/bird-assistant-prototype-offline-v0.9.html)，或预览dist/index.html。历史v0.5/v0.6/v0.7 HTML保留为提交快照。

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

- node scripts/build-offline.mjs：重建v0.9离线HTML。
- node --check dist/app.js 与 node --check dist/scrapbook.js：语法。
- node --test tests/*.test.cjs：关键状态与异常保留。
- 上级目录python validate.py与python validate-scrapbook.py：中英文结构和链接。

具体浏览器结果及限制见[QA.md](QA.md)。

## English

The v0.7 standalone prototype replaces Collection with Journal; Collection stays under Profile. Journals support editable objects, crop, template reflow previews, explicit browser-local saving and PNG export. This is not native WeChat integration or AI. Period labels and the fixed suggestion card do not run tasks; forum actions remain a session demo.

Imports become previews up to 1400 pixels, leaving device files unchanged, without EXIF extraction. Demo limits: six images/page and 6 MB/image. Saved journals are browser/origin-local without account sync; other observation/social state remains session-only. See the [English design](../en/09-scrapbook-design.md).

## v0.7 评阅修订（2026-10-29）

用户确认上一轮需求理解后授权实施，并再次明确：本项目不使用 OpenAI；AI 服务以后选择更便宜、适合小程序的其他供应商。本轮没有创建密钥或连接真实生成服务。

| 项目 | 当前行为与边界 |
| --- | --- |
| 动态聚合 | 滚轮、双指更新和按钮都刷新标记层，无须再拖地图。保留临时示例阈值，最终合并半径由地图 SDK 决定。 |
| 文本对象 | 一个对象包含可选标题和正文；右侧圆点或宽度滑杆控制换行，高度通过字体测量计算，宽度变化不缩放字体。 |
| 溢出 | 超过画布剩余高度时在最后可见行加入“…”；完整标题和正文保留，可继续编辑和撤销。元素列表的长名称也加省略号。 |
| 持续画布 | 视口随滚动缩小并固定在工具栏下。选择元素后尽量居中，画布边界约束平移；整页/聚焦可切换。文档坐标不随查看变化。 |
| 点击稳定性 | 画布缩小时保留原布局占位，避免属性按钮因缩放视口在点击期间移动。 |
| 历史 | 一次输入会话、拖动、滑杆提交、裁剪确认或重排应用记录一次完整文档。选择、取消预览和无变化不清空重做。增加/删除、文字、裁剪、图层与背景一起恢复。最多保留50步，尚非生产内存策略。 |
| 元素管理 | 每个选中元素上方提供删除；照片显示稳定编号与九宫格位置；装饰提供叶子、小花、羽毛、星星、胶带与邮戳，可扩充。 |
| 起始风格 | 三种风格不代表最终三套固定模板；本地构图可反复预览变体。保留照片身份、裁剪和所有文字内容，装饰、位置和背景仍可能重建。未来智能排版/裁剪服务尚未接入。 |
| AI 写作 | 提供整页独立文字、照片说明和单文本框入口，支持感想、鸟类介绍、分享文案。可填写要求、选择照片、检查字数建议；整页新文字可选择照片上方/下方的留白。 |
| 语音 | 支持浏览器提供的口述转文字入口，转写可编辑；不支持或失败时回到文字/系统输入法。真实麦克风和微信语音未验证。 |
| AI 状态 | 当前生成按钮明确未接入，不把模板句子当作 AI 输出。供应商适配函数须由团队后端连接；测试仅注入假适配器，不调用外部模型。 |

AI 请求契约（供应商无关）：instruction、intent、language、existingText(title/body)、target(元素ID、关联照片ID、位置、宽度、可用高度、字体、行高和建议字数)、images(稳定ID/编号、所选图片、标签、待鉴定状态、备注与裁剪)及约束。语义关联的照片必须附上，其余只附用户勾选的照片。不得从图像编造耗时、天气和感想。字体测量与下一元素位置形成近似留白预算；旋转、复杂布局仍需原生引擎进一步处理。返回标题和正文后先预览，确认后一次加入；超过留白会提示，原文保留。失败保留输入，过期响应不能落到另一份手帐。

旧schemaVersion 1草稿在读取时迁移到2，保留所有元素、来源与完整文字，修正文本高度；当前浏览器存储键不变。迁移不补写日期，不自动上传。

验证：18项Node行为回归；真实浏览器轮缩合并/分离、标题正文编辑、右边缘宽度拖动、撤销/重做、选择后保留重做、装饰删除恢复、照片关联写作要求、3280字符溢出仍完整保留、紧凑中英文无横向溢出；实际900×1200 PNG已下载并打开。真实服务、麦克风、手机双指与微信仍未验收。详见QA.md与development-log.txt。

## v0.7 review revision (29 October 2026)

The user authorized implementation and reaffirmed that this project must not use OpenAI. A cheaper provider suited to the mini-program will be selected later. This revision creates no API key and calls no real generation service.

- Wheel, pinch updates and zoom buttons refresh the marker layer without a follow-up drag. The existing demo threshold is temporary; the selected map SDK will determine the final radius.
- One text object contains an optional title and body. Its right-edge handle and width slider rewrap at the same font size; measured typography determines height. Canvas overflow and long selector labels end with an ellipsis while complete text remains editable.
- The canvas stays pinned beneath the toolbar and shrinks as properties scroll. Focus follows the selected element with boundary clamping; whole-page viewing remains available. A fixed flow placeholder prevents controls moving during clicks.
- Complete document transactions cover typing sessions, gestures, crop confirmations and reflow. Selection, cancelled previews and no-op changes preserve redo. Up to 50 steps are retained; production memory handling remains future work.
- Selection headers expose Delete. Stable photo numbers gain approximate 3×3 location labels. Six extensible decorations are available. Preview/apply/export controls have spacing.
- The three styles are starting points, with alternative local compositions. Reflow retains photo identity, crops and all text; custom decorations, positions and background may be rebuilt. Richer layout/cropping services remain future integration.
- Writing controls cover standalone journal text, a photo caption and individual text boxes. Reflections, bird information and social posts accept typed instructions, checked photos and a layout budget. New overall text can use a gap above or below photos. Dictation uses browser capability with editable text and a keyboard fallback; real microphone and WeChat speech remain unverified.
- No canned output is presented as AI. The provider-neutral writing adapter is unconfigured. Tests inject a fake adapter only.

The request contract carries instruction, intent, language, existing title/body, target geometry and typography, suggested length, selected images with stable identity/context and uncertainty-preserving constraints. Semantically linked images are required; other images are opt-in. Personal experience must come from the user. The client approximates available space through measured text and nearby elements, previews returned title/body, warns about excess length, retains full text and applies only after confirmation. Failed requests preserve work; stale responses cannot attach to another journal.

Legacy schemaVersion 1 drafts migrate to 2 without removing elements, sources or complete text. The local storage key is unchanged; no date invention or automatic upload occurs.

Verification: 18 Node behaviour regressions; actual browser wheel clustering/splitting, combined title/body, right-edge width drag, complete undo/redo, selection preserving redo, decoration delete recovery, photo-linked writing briefs, preservation of 3,280 overflowing characters, compact Chinese/English layouts without horizontal overflow and an actual downloaded/opened 900×1200 PNG. Real AI, microphone, native pinch and WeChat remain unverified. See QA.md and development-log.txt.


## v0.8 输入体验

在手帐AI写作的输入框右侧，点击麦克风切换语音，点击键盘返回文字。按住说话，左滑后松开取消，直接松开确认；已有文字保留。正常模式ASR未连接，仅预览交互且不录音。外侧评阅情景可选择“手帐语音转写示例（不录音）”或失败示例，查看明确标注的固定样本文字及异常保留。

语音交互/捕获/供应商无关ASR契约位于dist/journal-voice.js。真实服务尚未接入，不使用OpenAI。自动中英混说、上下文同音词和微信录音仍需实际验收。30项行为检查通过，具体浏览器范围见QA.md。

Text and voice share one composer in v0.8. Toggle, hold/release and swipe-to-cancel are implemented; explicit review presets demonstrate success/failure without audio capture. Real ASR remains unconnected. All 30 behaviour checks pass; native/accuracy limits remain as documented.


## v0.9 识别前端设计（2026-10-30）

识别默认打开统一取景：轻触照片、长按录像、缩放、快速/等候与暂停、独立声音线索和留鸟鸣。相册/文件入口始终可见，支持本地图片、视频和音频预览；示例分析、复核、所选素材整体交接至私人观察。未知时间/地点不自动填补，收藏另选。无主动照片/视频时可展示最多两张未选中的补救示例。

通过外侧情景查看离线、结果过时、鸟名更正、声画分歧、权限拒绝与保存失败。相机、录音、模型和相册均未接入；浏览器中的真实导入只在当前会话保留。原型是微信 DevTools 实现前的设计依据。完整[中文设计交接](../09-live-identification-design.md)与[English handoff](../en/10-live-identification-design.md)对齐。

Identify now opens one live view with tap-photo, hold-video, zoom, Quick/Wait/Pause, independent audio clues and Keep call. Gallery/files support local image/video/audio previews and an analysis segment. Review retains all selected evidence and hands it to private saving without confirming a species automatically. Recovery samples are bounded and opt-in. Camera/microphone/model/album behaviour is simulated; imported files are real but session-only. Native capability testing remains future work.
