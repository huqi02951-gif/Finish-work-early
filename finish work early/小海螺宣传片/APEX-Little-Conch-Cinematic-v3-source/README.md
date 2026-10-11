# THE LITTLE CONCH · V3.1 第一阶段工程版

在现有 V3 上接入 Three.js，重构机舱 → 手动开门 → 连续自由落体 → 海面穿越 → 小海螺第一视角。深海原章节顺序保留，片尾署名为「小海螺诞生于 APEX Studio」「动画、3D 与网站制作：胡晓丹」。

**当前是经过浏览器测试的镜头联调版本，尚未达到最终写实美术标准。** 原机舱/门板暂用 V3 图片；旧手部图因分辨率与裁切不合格而默认禁用。等待 GPT 交付正式素材，要求详见 [素材清单](docs/ASSET-REQUESTS.md)。

## 本机预览

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4180/ 。仅当前电脑可访问；这不是公网部署链接。

- 点击门板或向右拖动把手开始。短拖动或取消会回弹。
- 门开后自动演出约 19 秒；鼠标只轻微转动视线，不自动推进故事。
- 抵达水下后，滚轮、上拖/触屏上滑或方向键继续原章节。
- 声音、暂停、跳过开场、片尾重播均保留。系统减少动态效果时减弱镜头旋转、震动和速度模糊。
- QA：http://127.0.0.1:4180/?qa=1 。时间轴/八个关键帧/片尾按钮、Canvas WebM 录制；H 隐藏或显示工具。
- 截图与实录：http://127.0.0.1:4180/qa/first-stage/gallery.html 。

## 构建与验证

```sh
npm test
npm run build
npm run preview
```

生产预览 http://127.0.0.1:4181/ 。发布时仅部署 `dist/`，`base: './'` 支持目录部署。不要把 research、备份或 node_modules 一起发布。依赖已锁定；生产运行不请求 CDN。

测试范围、实测截图与局限见 [验收记录](docs/FIRST-STAGE-QA.md)。模块和镜头坐标见 [架构说明](docs/FIRST-STAGE-ARCHITECTURE.md)。

## 保留与回滚

原 V3 的 index、src、assets、README 共 10 个文件已在改动前备份：`backups/V3-original-2026-10-11.zip`；同目录 SHA-256 清单已校验。原 assets 和 `src/style.css` 保持逐字节不变。`dive-preview/` 是此前的独立试作，本轮未以它替换 V3。

安全恢复为独立目录：

```sh
unzip backups/V3-original-2026-10-11.zip -d ../APEX-V3-restored
python3 -m http.server 4182 --directory ../APEX-V3-restored
```

当前渲染包含三维框架、水面和粒子，以及照片曲面远景；不是完整三维海底世界。径向模糊为实时近似。声音是原版合成音的连贯调整，未完成专业拟音混音。手部/壳边的最终艺术验收和真实 iOS/Android 设备验收仍待完成。

使用技能：engineering-change-discipline（改动/证据/回归与范围），hyperframes:gsap（手动回弹与动画控制参考）。参考站技术研究见 `research/freefall-2026-10-10/`；未采用其专有图片、模型、字体或贴纸。
