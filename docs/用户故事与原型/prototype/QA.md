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
