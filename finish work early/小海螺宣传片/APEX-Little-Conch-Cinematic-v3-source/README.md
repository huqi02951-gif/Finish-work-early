# THE LITTLE CONCH · V3.3

在现有 V3 工程上完善第一人称机舱、手动开门、连续坠落、穿越水面与海螺视角。水下按用户最新要求加入主动下潜、逐项技能叙事、原创海洋生物贴图和持续生长的片尾。

当前为可运行的工程预览；写实机舱、手部和壳口的正式美术尚未交付。G0 概念板未进入运行时。原 V3 图片保留；布局在既有样式上逐项调整。海洋宇宙仅以“第一座岛”和返航文案表达。

## 运行

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4180/ 。点击门把或向右拖动开门，之后自动演出约 19 秒。进入水下后，真实页面滚动驱动镜头：滚轮向下 / 手指从下向上滑动会深入，反向滚动回看。浏览器负责触摸惯性，不再捕获触摸拖动或设置五秒阅读锁。鼠标轻移可环顾，触摸只滚动。方向键、空格与 PageUp/PageDown 保留浏览器原生操作；01–06 导航滚动同一条镜头时间线。水下滚动行程为 14 个初始视口高度（最小高度 568px），每项技能约 1.8–2 个视口；暂停冻结滚动，片尾可回看或返回天空再次启航。

QA：http://127.0.0.1:4180/?qa=1 。时间轴、开门比例、穿水前后、技能和片尾可独立验收；H 显示/隐藏工具。QA 采样暂停时显示全息面板的完成状态。生产页面不显示验收工具。

本轮截图画廊：http://127.0.0.1:4180/qa/native-scroll-2026-10-13/gallery.html 。旧版画廊：http://127.0.0.1:4180/qa/growth-v1/gallery.html 。前半段连续关键帧：http://127.0.0.1:4180/qa/director-v1/gallery.html 。这些是本地验收资料，默认不随生产 `dist/` 发布。

## 构建与发布

```sh
npm test
npm run build
npm run preview
```

20 项自动化测试覆盖门交互、镜头连续性、入水速度、GLB 局部坐标、手部锚点、背景几何以及下潜技能顺序和真实深度。生产预览 http://127.0.0.1:4181/ 。Cloudflare Pages 上传 `dist/`，不得上传备份、研究资料或整个父仓库。

GitHub 使用独立分支 `codex/little-conch-stage1-director-v1`，不修改父仓库原有暂存区，也不合并 main。GPT 完成 G4 美术验收后再决定合并。Pages 已接通免费自动部署：仓库根目录 `.github/workflows/little-conch-pages.yml` 在当前开发分支的网站相关文件推送后，执行测试、构建、项目权限核验和发布。首次成功运行：[38151068229](https://github.com/huqi02951-gif/Finish-work-early/actions/runs/38151068229)。公开仓库使用标准免费运行器，仓库改为私有时工作流停止；无 Pages Functions 或付费服务。详见 [部署记录](docs/DEPLOYMENT.md)。

## 文案升级

[全文案与场景对照](docs/copy/小海螺_全文案与修改对照.md) / [可编辑 CSV](docs/copy/小海螺_文字修改表.csv)。268 项文字区分当前展示、隐藏旧稿、仪表和验收工具。保留编号，只填写新文案和说明；例如 `SKILL-01-cn` 对应第一项技能的中文主句。

## 交接与局限

- [V3.3 原生滚动交接](docs/NATIVE-SCROLL-ISLAND-V3.3.md)：跟手滚动、色彩、文案与实测。
- [前一轮交接](docs/GROWTH-V1-HANDOFF.md)：修改、实测、剩余资产与生成贴图来源。
- [第一阶段实现](docs/DIRECTOR-V1-IMPLEMENTATION.md)：构图、光照、门比例、坐标及镜头。
- [正式资产需求](docs/ASSET-REQUESTS.md) / [坐标契约](docs/SCENE-COORDINATES.md)。

当前水下使用照片曲面远景、三维水面、粒子与世界空间贴图生物；生物作为大图标呈现，桌面左右交替、手机上图下文。天空使用原创写实透明云片，尚非完整三维海底。实时模糊为近似效果；音效为合成音。手机截图来自桌面 Chrome 的指定视口，不能替代真实 iOS/Android 验收。

## 备份与回滚

改动前完整备份 `backups/V3-original-2026-10-11.zip` 与 `backups/V3.1-before-director-review-2026-10-11.zip`，附 SHA-256 清单。需要回滚时解压到新目录，避免覆盖当前工程：

```sh
unzip backups/V3.1-before-director-review-2026-10-11.zip -d ../APEX-V3.1-restored
```

本轮技能：engineering-change-discipline、diagnosing-bugs、redesign-existing-projects、cloudflare-deploy。未复制参考站专有图片、模型、字体或贴纸。
