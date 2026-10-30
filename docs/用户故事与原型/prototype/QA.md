# 原型交互检查 2026年10月22日

环境：桌面 Chrome 云浏览器，414 px 标准框与 360 px 紧凑框。通过界面操作核对，不直接修改内部应用状态。示例内容和行为均为演示用途。

已检查：

- 地点搜索、缩放后聚合、地点多条观察、日期和区域视图。
- 他人书签不增加本人观察的鸟种；来源撤回后显示不可用。
- 照片候选选择，返回后更换候选会更新保存表单。
- 无可靠候选、分析失败、保存失败和发布失败分支，素材与输入保留。
- 合成声音的开始、停止与回听操作；分析失败后可保存待鉴定，个人已标注鸟种计数不增加。
- 私人保存与加入收藏不改变公开地图及论坛计数。
- 地图发布只改变地图，发帖只改变论坛；分别撤回保留私人原件。
- 更正私人鸟名不静默改写旧地图副本；公开副本有单独更新预览。
- 发布表单只公开选定字段，编辑时预览随输入更新；排除素材时不伪造公开证据。
- 位置未确认时不发布地图；定位和输入权限不可用有手动浏览或替代输入。
- 好友收藏的拒绝访问与接受申请后访问；申请、待回应、取消和移除关系。
- 显示名称空值校验、保存和取消；示例头像。
- 模拟缓存确认，观察与原件计数不变。
- 中英文切换保留输入；保留的帖子草稿可重新打开。
- 360 px 框下，已检查页面的内容宽度等于可用宽度，没有横向溢出。

边界：这是具体演示路径检查，并未穷尽所有故事验收条件。原生手机浏览器、触摸双指手势、微信真机、真实相机/录音/定位、模型及账号后端未验证。真实本地文件选择器没有在本轮自动化操作中走完；示例相册路径已检查。连续相机、视频、消息和徽章只有候选说明。

## English counterpart

Browser checks covered the concrete paths listed above with simulated data and services. Portrait frames were inspected at 414 px and 360 px. No claim is made about native phone or WeChat integration, real recognition accuracy, backend persistence, real messaging, exhaustive acceptance coverage, or untested local file-picker/device paths. Candidate features have explanatory entries only.

## v0.4 视觉修订回归 / Visual revision regression

- 审阅用户提供的 20 张截图；复现私人地图标记 41×35、箭头 16×21，以及声音缩略图继承满幅插画尺寸。
- 修订后私人标记 40×40、聚合标记 44×44，放大后保持尺寸；箭头 18×18、声音缩略图标 26×26。
- 五个主标签 × 中文/英文 × 414/360 外框，共 20 种布局组合未见横向溢出，检查到的 UI 图标均等宽等高。
- 地图画布保持 5:8，选点根据实际画布计算。连续地图边缘仍是已知限制。
- 紧凑英文选点控件不再被底部面板遮挡；搜索、确认后返回保留的发布草稿。
- 地图独立发布/撤回计数为 2→3→2；私人记录 2、帖子 1、已标注鸟种 1 均不变。地图副本新地点不改写私人原件。
- “公开”收藏只列公开收藏；中英文成长候选说明对应，返回操作可用。
- v0.4 单文件 HTML 已在浏览器打开，没有捕获来源为原型页面的控制台错误；未声称完成断网真机测试。
- 仍未验证原生手机/微信、真实双指手势、实际模型、地图服务和持久存储。成长仅为候选概念。

The focused regression checked all 20 main-tab/language/frame combinations, square icon bounds, steady map marker sizes, preserved map aspect ratio, unobscured picker controls, retained publication drafts, independent map publication/withdrawal counts, public-only collection listings and bilingual growth explanations. The v0.4 standalone HTML opened without captured app-origin console errors. Device and service integration limits above still apply.

## 中央识别按钮修正 / Center Identify control fix (2026-10-23)

复现：圆形容器受纵向 flex 收缩影响，实际为 55×44 px。修正为不可收缩的 56×56 px 圆形，并提高按钮顶部、调整导航标签间距。地图说明及相关底部浮层向上留出空间。

浏览器检查：414/360 外框 × 中英文四种组合，圆形均为 56×56；内部 SVG 中心相对圆形中心的水平/垂直偏移均为 0；地图说明与圆形之间为 13 px 间距；没有横向溢出。中央按钮仍可打开识别入口。

The central control previously shrank from 55×55 to 55×44 through flex layout. It now stays 56×56, with the scan icon centered and the map note 13 px clear in both languages at both portrait widths. The Identify action was checked. This supplements the earlier icon checks, which did not catch the control container itself.


# 候选与来源比较回归记录 v0.5

环境：桌面 Chrome；414/360 px 外框。通过界面操作检查，不直接修改应用内部状态。

| 检查 | 实际结果 |
| --- | --- |
| P12 候选与 P32 比较 × 中英文 × 两种外框，共 8 种布局 | 可用内容区均无横向溢出。 |
| 选择第二候选 → 比较 → 切语言 → 返回 | 家麻雀仍为选中状态，保存表单保留该鸟名。 |
| 私人保存后更正鸟名 | 当前标签从家麻雀改为普通翠鸟；原始树麻雀/家麻雀示例分数 0.78/0.61 和 demo-photo-v1 保留。 |
| 来源分歧情景 | 比较页明确模拟检索与模型建议不同；可保存待鉴定并加入私人收藏。 |
| 参考来源不可用情景 | 比较页显示模拟不可用；返回仍有原示例候选。 |
| 无可靠候选 | 保存待鉴定后分析记录明确无可靠候选，没有伪造分数。 |
| 声音分析 → 比较 → 保存待鉴定 | 明确合成声音不是候选鸟种参考录音；保留 demo-audio-v1 与 0.67/0.53 示例分数。紧凑英文页面无横向溢出。 |
| 未分析直接保存 + 保存失败重试 | 失败时私人计数保持 2；切回正常重试后为 3，无虚构分析面板。 |
| 私人待鉴定保存的独立性 | 私人观察 2→3，公开地图 2、帖子 1、已标注鸟种 1 不变。 |
| 控制台 | 未捕获来源为原型页面的错误。 |

以上是具体演示路径，不代表穷尽全部验收条件。未验证真实模型、在线参考检索、社区素材复用、概率校准、微信真机、原生手机浏览器和完整本地文件选择器。

v0.4 视觉修订、中央 56×56 圆形与 13 px 地图说明间距为前次检查结果，本轮保留相关样式，没有把历史检查重新标为新测试。网页源代码与离线 HTML 的检查记录随原型维护。


# Candidate/source regression log v0.5

Environment: desktop Chrome, 414/360 px outer frames. Checks used UI actions without mutating internal application state.

| Check | Observed result |
| --- | --- |
| P12 candidates and P32 comparison × Chinese/English × both widths: 8 layouts | No horizontal content overflow. |
| Select second candidate → compare → change language → return | House sparrow remained selected and populated the save form. |
| Correct the label after private saving | The current label changed to Common kingfisher; original sparrow candidates, 0.78/0.61 sample scores and demo-photo-v1 remained. |
| Source disagreement | Explicit simulated model/retrieval disagreement; unresolved private saving and collection remained possible. |
| Unavailable reference | Simulated unavailability displayed; returning retained the model candidates. |
| No reliable candidates | Saved unresolved; retained assessment explicitly has no candidates or fabricated scores. |
| Audio analysis → comparison → unresolved save | Synthetic input is not presented as a species reference recording; retained demo-audio-v1 and 0.67/0.53 sample scores. Compact English comparison had no overflow. |
| Skip analysis + failed save/retry | Failure kept private count at 2; normal retry changed it to 3, with no fabricated analysis panel. |
| Independent unresolved private save | Private records 2→3; public map 2, posts 1 and selected species 1 stayed unchanged. |
| Console | No captured errors originating from the prototype page. |

These are concrete demo paths, not exhaustive acceptance coverage. Real inference, online reference retrieval, community-media reuse, probability calibration, native WeChat/mobile browsers and the complete local file-picker path remain unverified.

The v0.4 visual and central-circle checks are historical results; related styles remain without relabelling those checks as new tests. Source/offline checks are maintained with the prototype.

## 2026-10-23 提交前文字复核 / Pre-submission text review

统一中文验收用语、鸟种统计说明与成长文案；补齐中文 G01–G10 规则编号，明确好友关系与可见范围的区别，修正英文稿中过时的目录引用。19 个故事、28 个页面或状态及 8 个竞品的 9 维结构均通过静态校验，故事卡正文与中英文 JSON 条件逐项对应。JavaScript 语法、文档相对链接、差异空白检查和离线打包一致性检查通过。CSS 与 HTML 页面结构保持原样；本次记录不新增浏览器、真机或模型测试结论。

This pass polished Chinese wording, exposed the shared rule IDs, clarified friend-only access and corrected the English folder reference. The existing structural validators, paired story-text checks, JavaScript syntax, relative links, whitespace and offline-bundle consistency checks passed. CSS and the HTML shell are unchanged. This entry adds no new browser, phone or model test claims.


## v0.6 手帐原型验收（2026-10-29）

本轮在桌面Chrome云浏览器检查，不作为微信真机或生产集成验收。

| 检查 | 结果 |
|---|---|
| 五个主标签 × 中英文 × 414/360外框，共20种布局 | 未见横向溢出；中央识别圆形均为56×56。 |
| 手帐编辑器 × 中英文 × 两种外框，共4种布局 | 未见横向溢出；语言切换保留手帐内容。 |
| 四张示例插画 → 自定义标题 → 初稿 → 选择照片 → 裁剪 → 保存 | 已走通，支持调整独立照片对象，私人观察和地图未变化。 |
| 全页刷新 → 手帐首页 → 重新打开 | 已保存草稿恢复，包含手帐标题、元素和裁剪。 |
| 生成PNG → 点击下载链接 | 已下载并打开实际PNG，900×1200；照片、标题和待鉴定说明可见。导出改用Blob链接后下载完成。 |
| 成品图 → 帖子草稿 → 填文 → 演示发布 | 帖子计数1→2；私人观察2、地图贡献2、已标注鸟种1均不变。发帖为会话内模拟。 |
| 我的 → 我的收藏 | 原收藏可访问，并保持私人说明。 |
| 中央识别 → 相机示例 → 分析 → 候选比较 | 原有照片示例与来源比较路径可用。 |
| 8项Node行为检查 | 日期未知、选择顺序、裁剪取消/确认、重排预览/撤销、本机恢复、存储失败、重复素材ID与标签、SVG转义均通过。 |
| 双语设计校验、JavaScript语法、相对链接及离线打包一致性 | 通过；原有19/28与新增6/8设计分开校验。 |

限制：完整本地文件选择器检查曾停滞并停止，未完成相册导入端到端验证；触摸拖拽/双指手势、原生手机与微信、真实AI、云端同步、周期任务、实际微信分享均未验收。本轮并未重跑原有全部异常和社交验收项。示例插画不代表真实照片识别。浏览器内8项单元状态检查不等同于真实服务或真机测试。

### English counterpart

Desktop Chrome checks covered 20 main-tab/language/frame combinations and 4 journal-editor layouts without horizontal overflow. The central Identify control stayed 56×56. Sample material, custom title, crop, explicit local save and full reload/reopening worked. A real 900×1200 PNG was downloaded through a Blob link and opened for visual inspection. Journal-to-post demonstration changed posts 1→2 while private records 2, map contributions 2 and selected species 1 stayed unchanged. Profile collection and the existing sample recognition/comparison path remained accessible.

Eight behaviour checks, paired design validators, JS syntax, relative links and standalone packaging consistency passed. The complete local-file chooser test stalled and was stopped, so end-to-end import remains unverified. No claim is made about touch gestures, native WeChat/phones, real AI, cloud sync, scheduling or real WeChat sharing. Historical QA results above are not relabelled as newly executed.


## v0.6 本地文件选择器重试（2026-10-29）

恢复本地预览后，通过实际文件选择器导入一张 PNG 测试图片（journal-import-test.png）。素材出现且自动选中，日期保持未知。随后完成自定义标题、4:3 横版初稿、照片裁剪确认、本机保存、整页刷新、重新打开、生成 PNG 与实际下载。下载文件为 1200×900 PNG，544887 字节，已打开核对内容。

此项补齐前次因预览访问中断而未完成的正常 PNG 导入路径；不将此结果扩大为 JPG/WebP、批量导入、无效文件、所有浏览器或微信真机的验收。测试图片是已有示例插画的栅格文件，不是真实观鸟识别结果。

### English

After reopening the local preview, the actual file chooser imported one PNG test image. It appeared selected with its capture date still unknown. A custom title, 4:3 draft, crop confirmation, local save, full reload/reopening, PNG rendering and download all succeeded. The downloaded file was opened and verified as a 1200×900 PNG of 544887 bytes.

This completes the previously interrupted normal PNG import path. It does not establish acceptance for JPG/WebP, batch import, invalid files, all browsers or native WeChat. The test image is a raster version of the sample illustrations, not a real recognition result.


## v0.7 评阅反馈回归（2026-10-29）

- 实际滚轮只缩放不拖动：z=1→0.9→0.8，两个公开地点合并；逆向滚轮恢复分离。标记层在手势中更新，按钮路径共用更新函数；两指事件由Node模拟检查，未声称真机双指已验收。
- 标题/正文在同一对象编辑；右边缘拖动使宽度756→484.57，正文23号不变，高度随换行增加。撤销恢复756，取消选择不清空重做，重做恢复484.57。
- 小花添加→删除→撤销恢复；六类装饰可见。照片2写作入口锁定必要照片，只包含1张关联照片；要求/字数预览可用，生成按钮因无服务保持不可用。
- 输入3280个字符后，可见末行有省略号；正文仍保留3280字符。撤销恢复原说明“待鉴定”。
- 初次浏览器检查发现：视口缩小时正常文档高度也变，自动滚动后按钮会在点击中移位，可能触发错误动作。改为固定布局占位、仅改变可见视口后，重复装饰添加/删除恢复与照片写作入口均正确。
- 414外框中文编辑已检查；360外框中文和英文可用内容宽度均336、滚动宽度336，无横向溢出。缩小后的画布高286，保持可见，边界附近选中元素受画布边缘约束。未重跑历史20种主标签组合。
- v0.6已保存草稿可由新版本读取；v0.7显式保存并整页刷新重开已走通。实际PNG导出900×1200，下载完成并打开核对，含标题、正文、照片及新增装饰。
- 18项Node行为检查通过：包括完整编辑历史、无变化与选择保留redo、文本溢出无数据丢失、照片九宫格标签/稳定编号、写作图文请求与预算、假适配器预览/确认/失败、重排文字与照片身份保留、v1迁移与过期响应隔离。

边界：不使用OpenAI，尚未连接任何真实AI生成；假适配器单测不等于模型验收。浏览器SpeechRecognition入口具有键盘回退，本轮没有使用实际麦克风；手机、微信、原生双指、字体包、实际地图SDK/半径、云存储、自动周期与微信分享仍未验收。此记录只增加本轮具体检查结果。

English: Actual browser checks confirmed wheel-only clustering/splitting, fixed-font width wrapping, title/body editing, resize undo/redo through deselection, decoration delete recovery, a required photo-linked writing brief, full retention of 3,280 overflowing characters, compact bilingual layouts and a downloaded/opened 900×1200 PNG. A viewport flow bug caught during QA was fixed and its affected actions repeated successfully. Eighteen Node behaviour regressions passed. Real AI, microphone, native touch/WeChat and map-SDK policy remain unverified; historical checks are not relabelled as new runs.


## v0.8 文字/语音同位输入与视觉统一（2026-10-29）

用户纠正：语音不是大文本框下面另一个按钮，而是同一输入区域的两种模式；旁边的麦克风/键盘按钮切换。文字初始单行、随内容增长（演示最高144px后内部滚动）；语音模式为波形与“按住说话”。按住后松开转写并确认输入，左滑达到取消区后松开丢弃，移回原位可继续；取消、切换、离开和转写失败保留原有文字，不自动生成文案。

- 手帐矩形按钮/选择器/输入边界统一12px圆角。画布照片框与中央识别圆钮不属于这套矩形控件。
- AI写作入口、照片/文本框AI按钮、整理要求、生成和确认应用采用青绿—紫色渐变边框/主色。边框缓慢流动；禁用与减少动态效果时停止动画。
- 当前ASR适配器未连接。正常模式只可预览按住、波形和左滑，不申请麦克风、不生成虚构转写。评阅情景中有明确标注的固定中英混合转写及失败示例，均不录音、不调用ASR。
- 已实现浏览器MediaRecorder捕获与音频分析波形适配层，只有真实ASR适配器配置后才使用麦克风。转写请求带音频、格式、时长、自动语言、zh/en混说要求及当前文本/手帐标题/关联照片标签上下文；不按界面语言强制锁定中文或英文。微信端录音应替换捕获适配器。
- 本项目继续排除OpenAI。实际供应商须验收中英混说、句中切换语言、上下文同音词消歧、鸟名/数字和口语标点；本轮没有选择供应商，也没有验证任何模型的真实准确率。

取消、短按、麦克风未就绪就松开、权限失败、转写失败、切换模式/离开及过期返回均不得加入文字。转写结果进入同一可编辑输入，再由用户确认写作要求；转写/输入模式不计入画布撤销历史。

验证：原18项与新增12项语音状态回归共30项通过。真实浏览器验证切换、按住松开示例、左滑取消、失败保留及回到文字编辑；正常未连接预览明确不录音。紧凑中英文均无横向溢出，检查到的按钮/选择器圆角均12px；980字符输入高度上限144px、全文保留。未使用真实麦克风或ASR，微信触摸及真实混说/同音词识别尚未验收。


## v0.8 unified text/voice input and visual consistency (29 October 2026)

Text and voice are two modes of one composer, switched by an adjacent microphone/keyboard control. Typing starts on one line and grows to a 144px demo maximum before internal scrolling. Voice displays a waveform and Hold to speak. Release confirms transcription; swipe left and release cancels; moving back restores confirmation. Cancellation, failures and mode changes retain previous input. Transcription never generates journal copy automatically.

Journal rectangular controls share 12px corners. AI actions use a restrained teal/violet gradient with a slowly moving border; disabled controls and reduced-motion preferences use a static treatment. Canvas frames and the circular Identify control retain their existing shapes.

The real ASR adapter is unconfigured. Normal mode offers a labelled interaction preview without accessing the microphone or fabricating text. Review presets provide explicitly labelled mixed-language transcript/failure samples without recording or calling ASR. The browser capture adapter uses MediaRecorder and an audio analyser when a real ASR adapter is configured; native WeChat must replace that capture layer. Requests carry audio, format/duration, automatic zh/en code-switching requirements and text/title/photo-label context, independent of interface language. OpenAI remains excluded. Real provider selection and accuracy testing for code switching, context-sensitive homophones, bird names, numbers and punctuation remain pending.

Thirty behaviour regressions passed, including twelve new voice checks. Browser checks cover mode switching, sample hold/release, left-swipe cancellation, failure retention and editable return to text; compact Chinese/English have no horizontal overflow. Inspected button/selector corners are 12px. A 980-character input remains intact at the 144px height cap. Real microphones, ASR accuracy and native WeChat touch are unverified.

## v0.9 identification frontend — 2026-10-30

Scope: clickable browser design, not native WeChat capture or recognition.

- All 41 Node checks passed (30 existing map/journal/voice checks plus 11 identification state/handoff regressions). They cover offline capture, album failure preservation, bounded and opt-in recovery, no fabricated import recovery, six-item cap, cancelled/stale analysis, retry, selection invalidation, intentional video retention, mixed evidence handoff, audio without camera access and valid analysis segments.
- Browser: default live entry; tap photo; 1.1-second hold/release created one sample video; Keep call retained a separate audio sample. Two selected media were saved as an unresolved private observation, with time/place/weather unknown, and the video could reopen from observation detail.
- Browser: photo/video/audio sample imports, sample video segment start changed to 3 seconds, mixed selection, analysis failure preserving three items and a user-selected Great tit, private save failure, then successful save retaining all three items. Collection remained opt-in and public map/forum counts unchanged.
- Browser: no-shutter review offered two recovery samples, both initially unchecked; saving was disabled until one was opted in. A later low-storage capture stayed in the list with failed album state and a retry action.
- Browser: offline and stale scenarios retired boxes while keeping the shutter enabled; camera denial disabled image capture and retained import/audio alternatives; audio denial left visual capture enabled; disagreement showed a separate possible off-screen bird. Offline audio explicitly waits for connection.
- Browser: the stable-name preset showed Tree sparrow while held and switch-pending, then corrected to Great tit after the later sample evidence.
- Browser: compact English app area measured 346 px wide and 598 px tall, with matching scroll dimensions and no live overflow. Rectangular controls used 12 px radii; the capture hint cleared the raised central navigation circle. Chinese standard and compact English were visually inspected.
- One real generated QA PNG was imported and labelled as device media. The cloud file chooser stalled on the first attempt; a retry succeeded. Real video/audio imports and playback were not completed in this browser run. Labelled video/audio samples are not substituted as evidence that real codecs work.
- Syntax checks, offline-v0.9 generation, original bilingual story/link validation and journal validation passed. Existing 19 stories/28 screens and six journal stories/eight states are historical design counts, not claims of native completion.

Still unverified: native camera/zoom/OEM processing, real microphone/video concurrency, ASR/BirdNET/vision APIs, phone-album writes, actual thermal/battery/memory behaviour, native touch and background lifecycle. The browser never requested camera/microphone permission, uploaded media or called an AI provider. Review presets simulate those states. Imported evidence and observations are session-only; journal persistence remains browser-local.

Design handoff: ../09-live-identification-design.md and ../en/10-live-identification-design.md. Further system optimization remains the discussion in GitHub #20; this release does not expand #12/#13 implementation acceptance.

## v0.10 portrait and review revision — 2026-10-30

- All 43 Node checks passed, including the 41 existing checks and two new state regressions: clue focus changes preserve audio, capture mode, selection and in-flight analysis; optional manual names preserve original model evidence and can return to unresolved.
- Browser: portrait preview fills the compact 346×598 px app area. Collapsed and expanded layouts have no horizontal/vertical overflow; zoom clears the dock and the capture hint clears the raised navigation button. Compact English was visually inspected.
- Browser: Quick heat guidance opened, explained continued heat risk in Wait, and its Switch to Wait action changed mode and closed the guidance. No timed or silent automatic switch is implemented.
- Browser: a horizontal pointer swipe selected Sound without muting audio or changing Wait mode; keyboard ArrowRight moved focus to Sound. Tabs and expand/collapse exposed the independent audio toggle and Keep call.
- Browser: Keep call plus a 900 ms hold/release created selected audio/video samples; review kept both. After sample analysis, the name remained unresolved until explicit adoption. Clearing the suggestion and entering a custom name handed that name and both items to the private save form. The fixed species dropdown is absent.
- Browser: compact offline/camera-denied/audio-denied cases retained the intended capture and independent-sound behaviour. No real media upload or native camera/microphone was attempted this revision; prior real video/audio codec limits remain unverified.
- Product media limits are undecided. Demo memory guards remain functional but are under collapsed prototype notes. Automatic image compression is a future design, not a tested feature.

The previous v0.9 snapshots and QA remain historical. Current offline output is bird-assistant-prototype-offline-v0.10.html. The user will provide the later team handoff; this revision is a frontend review checkpoint, not the start of native WeChat implementation.
