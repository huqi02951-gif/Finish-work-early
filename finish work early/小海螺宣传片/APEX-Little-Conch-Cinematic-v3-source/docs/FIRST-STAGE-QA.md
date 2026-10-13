# 第一阶段验收记录 · 2026-10-11

## 结论

**镜头工程与交互可预览；最终视觉尚未验收。** 已在实际 Chrome/Chromium 浏览器运行源码和生产构建，保存桌面与手机视口关键帧及实际 Canvas 连播 WebM。未做真实 iPhone/Android/Safari 测试，不能据此保证所有手机的画质、触控或帧率。

已知阻塞：原机舱、门板是插画底图；近景扶门/自由落体手部没有合格资产，默认不显示；壳口目前是克制的着色器弧线，尚非正式珍珠材质美术。因此“写实机舱 + 人类身体感 + 正式海螺壳口”的最终视觉要求 **未完成**。素材要求见 [ASSET-REQUESTS.md](ASSET-REQUESTS.md)。

## 已完成并实测

| 项目 | 证据 / 结果 |
|---|---|
| 手动开门 | 31px 短拖后仍 waiting；92px 右拖后 opening；点击与 Enter 均启动；单元测试覆盖反向/纵向拖动与取消 |
| 连续镜头 | 实际播放到 19s / underwater；8 个阶段关键帧；位置、俯仰、滚转、FOV 边界数值连续；水面两侧速度导数匹配 |
| 空间层级 | 门和贴纸同一铰链局部空间；机舱留在世界坐标；相机穿过门框；分距离云层、双面水面、水下曲面远景与三维粒子 |
| 水面穿越 | 相机穿过 Y=0；同一水面材质两面渲染，叠加折射、径向多采样、泡沫波、气泡、色吸收；没有整屏淡出再淡入 |
| 水下身份 | 外部海螺角色不再常驻；壳边/感知脉冲可见；手部显示曲线在入水前归零（实际手部美术未接入，不能表述为已做视觉手部验收） |
| 暂停 / 静音 | 生产版暂停前后时间保持 0.12s；静音→暂停→恢复后 AudioContext 仍 suspended；取消静音后 running |
| 故事推进 | 390×844 视口上拖使进度增加；滚轮进入后续能力章节；移动鼠标只控制视线，不自动滚到下一章 |
| 重播 | 片尾 replay 返回 waiting；章节 visibility=hidden；门按钮启用；门容器 opacity=1；再次点击能开门 |
| 片尾 | 页面实际显示“小海螺诞生于 APEX STUDIO”“动画、3D 与网站制作：胡晓丹” |
| 窄屏 / 横屏 | 390×844 八个阶段；320×568 门可操作、文档 scrollWidth=320；844×390 机舱/HUD/按钮可见 |
| WebGL 不可用 | QA 模拟初始化失败后提示错误；点击“跳过开场”进入原 V3 水下故事；模拟失败会产生一个刻意注入的控制台错误 |
| 生产资源 | `npm run build` 成功；独立 `npm run preview` 页面正常载入、操作；正常渲染路径未观察到新增 WebGL/JS 错误 |

触屏兼容使用 Pointer Events + pointer capture，与桌面按住上拖共用输入路径；本次在窄屏浏览器验证了此路径，**没有物理手指触控测试**。

## 验收中修复的问题

- 高空水面高频闪烁：按屏幕像素覆盖范围衰减细节，降低未过滤的波面频率。
- 入水后照片底图露出矩形边缘：更换为世界空间曲面远景，覆盖镜头俯仰范围。
- 重播时上一章短暂残留：非活动章节立即隐藏；恢复门容器透明度。
- 静音后按暂停/恢复可能重新唤醒声音：统一依据 running 与 soundEnabled 两个状态管理 AudioContext。
- 避免视口恢复时大段跳帧：后台冻结，单帧推进上限 50ms；其代价是严重掉帧时影片墙钟时长可能超过 19 秒。

## 自动检查

最终执行 `npm test`：**7/7 通过**。

1. 手势点击、短拖、反向拖、纵向拖、提交与取消。
2. 未启动 / 暂停 / 不可见时不推进；恢复与重置。
3. 四种画幅在分镜边界的位置、姿态、FOV 连续。
4. 入水瞬间速度连续，HUD 速度等于位移导数。
5. 高度单调、数值有限、入水后手部显示值为零、水下终点约 18m。
6. 减少动态效果时关闭滚转、视野脉冲和速度模糊，但故事坐标一致。
7. 竖屏入口构图调整不改变出舱后路径和终点。

`npm run build` 成功；生产 JS：应用约 130.5KB / gzip 50.3KB，Three.js 约 486.7KB / gzip 121.9KB。图片保持原 V3 大小，未用工具伪造更高分辨率。

原始 zip 的 CRC 与 SHA-256 校验成功。再次比对：六张原素材、`src/style.css` 与整个 `CHAPTERS` 定义逐字节不变。

## 性能记录与边界

实际桌面 1440×900、DPR=1，水下稳定阶段最近 240 个有效 RAF 间隔样本：中位数 **8.3ms**，P95 **9ms**，该帧 **5 次绘制调用**，45 个几何体 / 7 个纹理驻留。记录见 `qa/first-stage/browser-observations.json`。这是当前桌面场景样本，**不是全片 GPU 基准、低端手机结果或跨设备 120fps 保证**；没有可对比的 V3 帧时间基线，故不声称提升百分比。

代码包含桌面/手机 DPR 上限、初始窄屏云层和粒子减量、持续慢帧降 DPR。未在真实低端设备触发降级分支，也未做 GPU context loss 真机注入、系统减少动态效果偏好端到端测试或完整屏幕阅读器审计。

音频验证了状态和代码路径；没有完成听音设备上的电影混音/风噪质感验收。模糊为实时径向近似，不是逐物体速度缓冲。

## 截图与录像

[本机截图画廊](http://127.0.0.1:4180/qa/first-stage/gallery.html)；该页面也可以直接打开同目录 gallery.html 查看本地图片与视频。

| 时间 / 场景 | 桌面 1440×900 | 手机视口 390×844 |
|---|---|---|
| 0s 机舱 | [截图](../qa/first-stage/desktop-01-cabin.jpg) | [截图](../qa/first-stage/mobile-01-cabin.jpg) |
| 1.90s 开门 | [截图](../qa/first-stage/desktop-02-door.jpg) | [截图](../qa/first-stage/mobile-02-door.jpg) |
| 3.50s 跃出 | [截图](../qa/first-stage/desktop-03-exit.jpg) | [截图](../qa/first-stage/mobile-03-exit.jpg) |
| 6.60s 自由落体 | [截图](../qa/first-stage/desktop-04-freefall.jpg) | [截图](../qa/first-stage/mobile-04-freefall.jpg) |
| 10.55s 海面接近 | [截图](../qa/first-stage/desktop-05-approach.jpg) | [截图](../qa/first-stage/mobile-05-approach.jpg) |
| 10.94s 穿水 | [截图](../qa/first-stage/desktop-06-entry.jpg) | [截图](../qa/first-stage/mobile-06-entry.jpg) |
| 13.60s 水下 | [截图](../qa/first-stage/desktop-07-underwater.jpg) | [截图](../qa/first-stage/mobile-07-underwater.jpg) |
| 19s 抵达 | [截图](../qa/first-stage/desktop-08-arrival.jpg) | [截图](../qa/first-stage/mobile-08-arrival.jpg) |

[实际 Canvas 连播 WebM](../qa/first-stage/desktop-live-canvas.webm)：1440×900，VP9 / 30fps，719 帧，约 24 秒、11.75MB；不包含 HTML HUD 或音轨。由浏览器 `captureStream` 录制，并用 ffprobe 检查可解码帧，**不是把静态截图拼成的视频**。

## 实际文件改动

原文件修改：`index.html`、`src/film.js`、`README.md`。

新增运行文件：`src/first-stage.css`；`src/first-stage/` 下的 `AircraftCabin.js`、`AircraftDoor.js`、`FirstPersonCamera.js`、`FreefallSequence.js`、`OceanSurface.js`、`WaterTransition.js`、`UnderwaterPOV.js`、`Atmosphere.js`、`HumanForeground.js`、`FirstStageDirector.js`、`assetManifest.js`、`QARecorder.js`。

新增工程文件：`package.json`、`package-lock.json`、`vite.config.js`、`.gitignore`、`tests/first-stage.test.js`、`public/THIRD-PARTY-LICENSES.txt`。

新增交付证据：`backups/` 原 V3 zip 与 SHA-256 清单；`docs/` 三份交接文档；`qa/first-stage/` 截图、视频、画廊、观测和改动记录。构建生成 `dist/`。

父目录 Git 将整个项目视为未跟踪，未提交或暂存用户文件。最终差异采用原 V3 zip 比对，仅上述三个原文件变化；此前的 `dive-preview/` 与研究文件未纳入本轮改写。

## 预览和回滚

生产预览：http://127.0.0.1:4181/ 。关闭服务后，在项目目录运行 `npm run preview`（已构建）；开发与镜头定位用 `npm run dev` 和 `http://127.0.0.1:4180/?qa=1`。

这些是本机地址，不是公网链接。回滚用原 V3 zip 解压到独立目录：

```sh
unzip backups/V3-original-2026-10-11.zip -d ../APEX-V3-restored
python3 -m http.server 4182 --directory ../APEX-V3-restored
```

使用 `engineering-change-discipline` 与 `hyperframes:gsap` 技能；后续应先按素材清单完成 GPT 美术审批，再做真实移动设备与最终视觉验收。
