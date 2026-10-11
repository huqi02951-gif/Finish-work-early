# THE LITTLE CONCH · V3.2

在现有 V3 工程上完善第一人称机舱、手动开门、连续坠落、穿越水面与海螺视角。水下按用户最新要求加入主动下潜、逐项技能叙事、原创海洋生物贴图和持续生长的片尾。

当前为可运行的工程预览；写实机舱、手部和壳口的正式美术尚未交付。G0 概念板未进入运行时。原 V3 图片和 `src/style.css` 保留。

## 运行

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4180/ 。点击门把或向右拖动开门，之后自动演出约 19 秒。进入水下后，滚轮向下、鼠标向下拖动、手指向下滑动或方向键推进技能；反向输入可回到上一技能。一次大幅输入最多进入下一技能，继续输入才会推进更多技能。输入行程已放慢约 5–7 倍；每遇见新技能保留 5 秒阅读时间，正向惯性在此期间不推进，反向可回看。01–06 导航可主动选择技能。

QA：http://127.0.0.1:4180/?qa=1 。时间轴、开门比例、穿水前后、技能和片尾可独立验收；H 显示/隐藏工具。QA 采样暂停时显示全息面板的完成状态。生产页面不显示验收工具。

截图画廊：http://127.0.0.1:4180/qa/growth-v1/gallery.html 。前半段连续关键帧：http://127.0.0.1:4180/qa/director-v1/gallery.html 。这些是本地验收资料，默认不随生产 `dist/` 发布。

## 构建与发布

```sh
npm test
npm run build
npm run preview
```

17 项自动化测试覆盖门交互、镜头连续性、入水速度、GLB 局部坐标、手部锚点、背景几何以及下潜技能顺序和真实深度。生产预览 http://127.0.0.1:4181/ 。Cloudflare Pages 上传 `dist/`，不得上传备份、研究资料或整个父仓库。

GitHub 使用独立分支 `codex/little-conch-stage1-director-v1`，不修改父仓库原有暂存区，也不合并 main。GPT 完成 G4 美术验收后再决定合并。Pages 使用静态直接上传，GitHub 推送不会自动触发部署。

## 交接与局限

- [本轮交接](docs/GROWTH-V1-HANDOFF.md)：修改、实测、剩余资产与生成贴图来源。
- [第一阶段实现](docs/DIRECTOR-V1-IMPLEMENTATION.md)：构图、光照、门比例、坐标及镜头。
- [正式资产需求](docs/ASSET-REQUESTS.md) / [坐标契约](docs/SCENE-COORDINATES.md)。

当前水下使用照片曲面远景、三维水面、粒子与世界空间贴图生物；生物作为大图标呈现，桌面左右交替、手机上图下文。天空使用原创写实透明云片，尚非完整三维海底。实时模糊为近似效果；音效为合成音。手机截图来自桌面 Chrome 的指定视口，不能替代真实 iOS/Android 验收。

## 备份与回滚

改动前完整备份 `backups/V3-original-2026-10-11.zip` 与 `backups/V3.1-before-director-review-2026-10-11.zip`，附 SHA-256 清单。需要回滚时解压到新目录，避免覆盖当前工程：

```sh
unzip backups/V3.1-before-director-review-2026-10-11.zip -d ../APEX-V3.1-restored
```

技能：engineering-change-discipline、hyperframes:gsap、imagegen、cloudflare-deploy。未复制参考站专有图片、模型、字体或贴纸。
