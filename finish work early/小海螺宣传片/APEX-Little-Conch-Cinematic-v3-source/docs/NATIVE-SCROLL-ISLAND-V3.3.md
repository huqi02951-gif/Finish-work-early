# V3.3 · 小海螺第一座岛：原生滚动与润色

日期：2026-10-13。保留原工程与天空跃入海洋的故事；海洋宇宙仅作概念，不开发地图、其他岛屿或任务系统。

## 已实现

- **真实页面滚动**：`NativeDiveScroll.js` 建立文档滚动行程，`film.js` 从 `scrollY / travel` 读取唯一进度。全屏场景固定在视口，触摸采用 `pan-y pinch-zoom`。没有拦截 wheel/touch、捕获探索指针、合成惯性或五秒阅读锁。浏览器的原生滚动同时驱动相机、深度、图标、章节和编号。
- **跟手与节奏**：14 个初始视口高度，最小视口基准 568px；每项技能约 1.8–2 个视口，用户可停下阅读。镜头进度不再二次缓动；鼠标保留轻微环顾，触摸不写入环顾坐标。反向滚动回看，包括从片尾返回技能；导航按钮滚动同一页面，暂停锁住滚动，重播清零。
- **开场保留**：手动开门后自动演出约 19 秒，再开放水下滚动。没有改写坠落轨迹或重建网站。GLB 坐标契约与手部接口保持原工程；入水后人类前景为 hidden。
- **色彩与排版**：海面调整为绿松石色；水下色调随真实进度逐渐吸收暖光。水面从水下观察时，按水柱距离减弱对比，减少与远景照片的硬边。使用既有原创生物图集；桌面图文左右交替，窄屏调整图标尺寸与高度，避免压住正文。
- **文字**：初识表达“APEX 海洋里的第一座岛”；六项能力顺序及业务事实不变，保留“正在推动行内部署”而不夸大落地状态。片尾表达持续生长并可“返回天空 · 再次启航”。署名仍为创建团队 APEX STUDIO；动画、3D 与网站制作：胡晓丹。
- **文案导出**：CSV/Markdown/JSON 更新为 268 项，`SKILL-01-cn` 等章节编号保持，可直接编辑 replacement / 新文案字段。未采用文档中未确认的新人员、文化口号或额外技能。

## 修改文件

`src/first-stage/NativeDiveScroll.js`（新增）、`src/film.js`、`src/first-stage/DiveNavigation.js`、`src/first-stage.css`、`src/StoryChapters.js`、`index.html`、`UnderwaterPOV.js`、`OceanSurface.js`、`WaterTransition.js`、`FirstStageDirector.js`、`SeaLifeEncounters.js`、`tests/native-scroll.test.js`（新增）、`tests/mobile-input.test.js`、`tests/first-stage.test.js`、`scripts/export-copy.py`、文案导出及交接文档。

原测试中已废弃的“手势累加/阅读锁/单次只前进一项”检查，替换为实际原生滚动控制器与触摸隔离检查。没有新增依赖、改变 Cloudflare 凭据或工作流。

## 实测证据

修改前：390×844 下 scrollHeight=844、scrollY=0、touch-action=none。实际触摸指针处理器的回归测试会错误写入环顾坐标，已先运行并失败。修改后同一测试通过。

`npm test`：20/20 通过；`npm run build`：成功。覆盖手动门交互、开场镜头与速度连续性、GLB 局部坐标/手部锚点、入水取消人类前景、背景几何、技能深度与图标边界、像素预算，以及原生滚动的精确进度、反向回看、导航、暂停、地址栏高度变化和横竖屏切换。

实际 Chrome：

| 视口 | 文档高度 | 验证 |
| --- | --- | --- |
| 1440×900 | 13,500px | 原生滚动进入财报转换；大图与文字分区，无横向溢出 |
| 390×844 | 12,660px | 手动开门自动抵达18m；不用编号，滚动依次进入技能1–6与片尾；反向、暂停、继续正常 |
| 320×568 | 8,520px | 滚动进入技能2–6与片尾；窄屏图文间距调整；返航回机舱、scrollY归零 |

390 视口实际滚动读数：技能1 p=.18/62m → 技能2 .32/113m → 技能3 .46/165m → 技能4 .605/218m → 技能5 .74/270m → 技能6 .87/309m → 片尾 1/320m。镜头与仪表共享 `diveDepth`，这些是场景深度而非查询实时数据。

44 张原尺寸截图，含三种尺寸各10张连续开场关键帧。`qa/native-scroll-2026-10-13/` 保存截图、关键帧/滚动读数和实际录屏。浏览器本轮控制台警告/错误为0。1440×900 的场景实录为 VP9/30fps、约24秒，只含 WebGL 画面，不含 HTML 仪表和音轨。

这些验证来自桌面 Chrome 的视口与原生页面滚动，不等同物理手机触摸或 iOS Safari。触摸方向与不干扰环顾由浏览器原生滚动机制及真实处理器回归测试验证；真机惯性与移动浏览器地址栏仍需补测。当前高密度手机2x预算策略保留，本机测试DPR=1，不能把它说成真机帧率。

本机运行时采样约8.3ms中位帧间隔；这是工作站渲染循环读数，不是GPU基准，不声称手机同样性能。云仍是多层透明片、生物为世界空间贴图、海底为摄影曲面；正式高分辨率全景、手部、机舱PBR等仍需GPT制作与美术验收，见 `ASSET-REQUESTS.md`。

## 预览与发布

网站：https://apex-little-conch.pages.dev/ 。GitHub：`huqi02951-gif/Finish-work-early` 的 `codex/little-conch-stage1-director-v1` 分支。发布结果以 `DEPLOYMENT.md` 最新记录为准，不合并尚待美术验收的草稿PR。

本机：http://127.0.0.1:4180/ 。本轮画廊：http://127.0.0.1:4180/qa/native-scroll-2026-10-13/gallery.html 。QA资料、录屏、备份和调研不进入生产dist。部署沿用公开仓库标准免费Actions和Pages静态托管，无新增付费服务。

## 回滚

线上：在Cloudflare Pages部署列表选择上一成功生产版本 ac79b5a6（2026-10-11）。本机：备份 `backups/native-scroll-2026-10-13/before.zip` 保存修改前文件；先解压到独立目录，按路径恢复对应源文件，再移除本轮新增 `NativeDiveScroll.js`、`tests/native-scroll.test.js`，恢复原文案导出并运行测试构建。更稳妥的方法是在独立目录检出前一分支提交 `37c715b08d01e7d45102a878ea2767ed4f205c13`；不要重置父仓库原有暂存区。

使用技能：engineering-change-discipline → diagnosing-bugs → redesign-existing-projects → cloudflare-deploy。
