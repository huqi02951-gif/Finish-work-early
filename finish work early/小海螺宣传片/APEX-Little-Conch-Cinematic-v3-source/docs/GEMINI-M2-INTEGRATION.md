# Gemini M2 整合与 AdSense 接入记录

日期：2026-10-18。执行技能：engineering-change-discipline → cloudflare-deploy。当前工程、四项业务底稿和镜头系统是整合基线，没有重建项目。

## 对比与取舍

| 新包内容 | 本次处理 | 原因 |
| --- | --- | --- |
| 小海螺岛主视觉、深海发光场景 | 接入首页与水下远景；保留世界坐标中的旧岛屿地形 | 原包提供的不透明场景画用于景片，不冒充透明资产、PBR 或三维地形 |
| 螺旋海螺实体、声呐环、四个能力节点 | 移植为 ConchBeacon，使用当前 Three.js、环境光和同一摄像机 | 保留原包的几何与配色方向；避免两个渲染器和旧 CDN Three r128 |
| 全息任务工作台 | 新增四项可交互执行示意，支持切换、重演、暂停/恢复原阅读位置 | 使用虚构样例，交付对应已确认四场景，取消假签章、假生产调用 |
| 海洋地图与第二座岛 | 展示第一座岛与授信报告编排岛概念；后一项明确尚未开放 | 保留海洋世界概念，不把研发计划当作已上线能力 |
| 故事滑块、自动潜航 | 连续滑块和可选自动探索，始终移动同一份真实文档；手动滚动即停止巡航 | 原包的滚轮逐屏跳转会破坏已有连续、可反向的下潜；不回退原生滚动 |
| 机舱光影概念画 | 素材原样存档，不用它覆盖真实舱门、手部或当金属贴图 | 完整构图不是可拆层、可光照的正式资产，当前手动门与连续落体继续保留 |
| 913 次调用、13 年、8 渠道、降幅、26 Skills/10 Agent 等 | 暂不发布为业务事实 | 不在先前确认底稿内，需要负责人逐项核实后再更新 |
| 原包的广告/部署控制面板 | 不放进宣传页面；改为真实发布商配置与独立介绍页广告位置 | 原包使用占位账号和访客 localStorage，并错误显示已激活；还生成对错误仓库 force push 的命令 |

## 实际修改

- `assets/gemini-m2/`：保留用户交付的四幅 WebP；来源、用途与 SHA256 见 GEMINI-M2-ASSETS.json。
- `src/first-stage/assetManifest.js`、`UnderwaterPOV.js`：新深海景片；缩小横向铺展范围以集中像素，保留入水俯角覆盖和 .68 倍跟随的景深视差。
- `src/first-stage/ConchBeacon.js`、`FirstStageDirector.js`：立体海螺及四节点；沿用同一个渲染器与相机。
- `src/first-stage/SeaLifeEncounters.js`：390 与 320 小屏的独立图标构图，避免覆盖标题、HUD。
- `src/ExperiencePanels.js`、`src/m2.css`、`index.html`：地图、下一岛预告、四场景工作台、视效与文案。
- `src/first-stage/AutoExplore.js`、`src/film.js`：连续滑块、110 秒可选自动探索、原生手动输入中断；对话框关闭恢复同一深度。
- `about.html`、`privacy.html`、`src/about.js`、`src/privacy.js`、`src/editorial.css`：可正常滚动、可阅读的介绍和隐私说明。广告位与电影控制分离。
- `config/adsense.json`、`src/AdSenseConfig.js`、`src/AdSense.js`、`vite.config.js`：真实发布商/广告单元配置，三页所有权 Meta 标签、根目录 ads.txt。拒绝占位 ID；缺审核或同意配置时不能开启广告。
- 原自动部署 workflow：只补充新配置与两页的路径触发条件；沿用最小权限 Secret、原 Pages 项目与免费公开仓库 runner。
- 新增 `tests/adsense.test.js`、`tests/m2-integration.test.js`。

## 验证与限制

- 基线 25 项测试通过；整合后 32 项通过，生产构建成功。Three chunk 仍超过 Vite 默认 500 kB 提醒（约 515 kB，压缩约 130 kB），没有当作无警告构建。
- Chrome 实测 1440×900、390×844、320×568，每种 14 张镜头/章节关键帧，另含首页、地图和工作台截图；无横向溢出。原始截图在 `qa/gemini-m2/`，观测 JSON 同目录。
- 实测滚动：文档 Y 2186→4718→3874；下潜进度 .1850→.3993→.3279；深度 58→135→118 m。自动探索 aria-pressed true，手动滚动后 false。
- 四项工作台均实际跑完；关闭前后进度同为 .1850，继续播放状态不丢失。该浏览器测试控制台 warn/error 为空。
- Three 射线测试覆盖三种比例、入水到 320m、九个画面采样点，确保新远景无露底。测试还覆盖镜头连续性、门的主动开启、GLB 高度只加一次、原生滚动与旋转。
- 1440×900 实录 `first-stage-actual.webm`：30fps，最后时间戳 23.964 秒，只包含 WebGL 场景，不包含 HTML HUD 和音轨。
- 已用 iOS 26.4 的 iPhone 13 Simulator 的 Safari 实际打开网站，触摸开门、自动自由落体与水下渲染有截图。它是模拟器，不是真实 iPhone。
- **不能宣称 iPhone 上下滑手势通过**：工具的原生 drag 在最简单的 6000px 原生滚动对照页上只触发 pointerdown/touchstart、pointerup/touchend，没有任何 move，scrollY 仍为 0。证据为 `input-calibration.html` 和 `ios-drag-calibration-no-move.png`。这也不证明网站在真实手机上不能滚动；该验收仍需有效触摸输入补测。微信/Chrome iOS 真机本轮未验证。

## AdSense 实际进度

- 经用户明确确认账号、美国收款地区和协议后，已创建 AdSense 账户。
- 真实 publisher：`ca-pub-8307042634047981`；已创建响应式展示广告单元 `9227677736`（Little Conch · About · Responsive）。这些是公开的站点配置，不是 API 密钥。
- Google 的 European regulations 消息 `Little Conch · Visitor choices` 已发布：Consent / Do not consent / Manage options，拒绝适用于所有配置地区，自动优化关闭，隐私链接指向本站 privacy.html，不强制 Logo。
- 网站所有权 Meta 与 ads.txt 已上线（HTTP 200，三个页面均包含同一真实发布商，线上构建与本地产物 SHA256 一致）。Google 已确认 Your site is verified，并已提交 Request review，当前 Getting ready / Review requested；仍不是 Ready。
- 收款资料由 Google 带入现有资料，需要用户本人核实账户类型、姓名和地址并提交。不得从 Google 默认值推定其真实有效；本站源码不保存该类资料。
- 当前广告开关关闭；只有确认审核 Ready 和必要配置后才允许开启。浏览测试没有访问或点击实际广告；不承诺收益或审核结果。
- Google 账户画面仅保留本机，不上传到 GitHub；公开版本仅包含网站截图及不敏感测试结果。

## 备份与回退

本次修改前完整工程备份：项目父目录 `backups/little-conch-before-gemini-merge-20261018-223916.zip`。Git 基线：`c16b14786a1040af79270473f46909ee6a41929a`，旧线上固定版本：`https://528dd7af.apex-little-conch.pages.dev/`。

回退网站：在隔离 checkout 从上述基线构建，沿用现有 Pages 部署任务发布 dist；不要在当前混合工作目录 checkout/reset，不要 force push。关闭广告：保持 `config/adsense.json` 的 enabled=false 并推送工程分支；若需要撤回同意消息，可在 Google Privacy & messaging 取消发布。Google 开户是外部状态，网站回退不会删除账户。

## 仍需正式美术资产

1. 手部四个分层透明切图或带绑定 GLB：扶框左手、随门右手、自由落体左右手；近景第一人称角度、无背景和无烘焙高度。保持原资产清单要求，未用机舱整图假装透明手部。
2. 机舱与舱门正式 GLB/PBR：局部米制坐标、真实门框厚度/铰链/把手、金属法线/粗糙度/金属度各自独立；不可把天空和手烘焙进金属材质。
3. 正式海螺模型与珍珠壳口：GLB/独立透明前景，材质/UV/灯光按原交接；当前是移植 M2 的程序化实体，不能替代最终角色定装。
4. 更高清、无前景生物烘焙的深海远景：建议 4096×2304 起，水平视域约 160°、入水俯视到平视，青绿光束/金色珊瑚；仅不透明远景，不混入字幕或 HUD。当前 M2 景片 1376×768，不会因为渲染提高清晰度而增加原始细节。
5. 如需让螺旋岛自由绕行：正式岛屿 GLB 与分层云、岸线和波面；当前首页是带轻微视差的景片，不能称其为完整实时三维岛屿。原工程三维岛屿几何保留用于天空镜头。

## 已发布证据

- 运行源码提交：711021cf811d86a890df7d7fc85db8a4f8808c45。
- 自动部署全部成功：https://github.com/huqi02951-gif/Finish-work-early/actions/runs/39139306121 。
- 固定版本：https://a096d2f7.apex-little-conch.pages.dev/ 。
- 生产：https://apex-little-conch.pages.dev/?v=20261018-m2 。线上实际打开 WebGL ready、没有 QA 工具。
- 介绍页生产构建实测：四任务、真实所有权 Meta、广告隐藏、广告 SDK 请求为 0、390×844 无横向溢出；隐私链接正常。
- 所有权和广告审核画面保存在本机；Getting ready 与 Review requested 是 Google 当前状态。由于收款表单带入现有个人资料，已交由本人核实提交，未代为提交。
- 当前只验证同意消息发布和代码准备，不等同于广告供应商/地区配置及实际广告展示验收；广告保持关闭至 Ready 并完成最后核验。
