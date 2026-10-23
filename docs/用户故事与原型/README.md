# 用户故事卡与交互原型

关联任务：[#3 用户故事卡和产品原型](https://github.com/bird-assistant/bird-assistant/issues/3)。

本稿包含19个用户故事、28个设计页面或状态，以及可点击的中英文浏览器原型。中文为团队评阅入口，[英文工作副本](en/00-product-baseline.md)保持相同故事编号。设计范围仍供团队收敛，不把故事或页面数量当作已完成功能数量。

## 阅读顺序

1. [产品与交互基线](00-product-baseline.md)
2. [故事地图](01-story-map.md)
3. [用户故事卡](02-user-story-cards.md)：角色、目的、价值、优先级、难度、页面与验收条件。
4. [页面设计](03-screen-outline.md)
5. [原型检查与边界](04-prototype-review.md)
6. [候选功能与待定事项](05-backlog-and-decisions.md)
7. [识别候选与证据比较](06-recognition-evidence-design.md)
8. [识别流程检查记录](07-recognition-review.md)

## 体验原型

下载 [单文件离线原型](prototype/dist/bird-assistant-prototype-offline-v0.5.html)，在浏览器打开。GitHub 文件页面不会直接运行 HTML，需要先下载原文件。无需安装依赖，默认中文，外侧可切换英文。

推荐路线：识别 → 相机 → 使用示例插画 → 分析这张照片 → 比较相似鸟种与参考来源。也可按外侧19个故事入口逐项体验。

原型源码位于 [prototype](prototype/README.md)。相机、声音、地图、识别和社交均按界面注明的示例或模拟能力呈现；新增数据只在本次浏览会话保留。真实微信设备能力、模型、账号、持久存储和对外通知仍需独立实现与验证。

## 校验

在本目录执行 `python validate.py`，校验故事和页面编号、引用、验收条件数量及中英文对应关系。浏览器检查记录与静态校验含义不同，具体结果见相应评阅文件。
