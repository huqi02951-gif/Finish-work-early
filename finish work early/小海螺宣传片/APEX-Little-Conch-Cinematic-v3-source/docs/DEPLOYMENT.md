# GitHub 与 Cloudflare Pages 发布记录

## 当前自动部署（2026-10-13 · V3.3）

- 网站：https://apex-little-conch.pages.dev/
- 当前固定版本：https://2bd3b6a2.apex-little-conch.pages.dev/
- 源码提交：`eceb5d7aea68377dea06df009f300ecd5e89a209`
- 成功 CI：https://github.com/huqi02951-gif/Finish-work-early/actions/runs/38409865202
- 20 项测试、构建、当前 Pages 项目权限核验与自动发布全部成功。上传3个新静态文件，10个复用；无 Functions、无付费升级、没有扩大凭据权限。
- 正式网站等待WebGL资源就绪后，在1440×900、390×844、320×568实际滚动复测：页面高度分别13500、12660、8520px；进度分别.4600、.1800、.3200，WebGL ready、没有QA工具、没有横向溢出。加载脚本 `index-DJ5f3UnH.js` 与本轮构建及CI一致。
- 公网键盘PageDown推进，End抵达片尾，返航回到waiting且scrollY=0；控制台警告/错误0。三张公网截图与 `public-observations.json`、`ci-success.json` 位于 `qa/native-scroll-2026-10-13/`。物理iOS/Android未测。
- 原2026-10-11手机手势修复仍是历史版本，固定地址ac79b5a6可用于回滚。当前使用真实原生滚动，移除捕获手势推进与五秒阅读锁，见 [V3.3交接](NATIVE-SCROLL-ISLAND-V3.3.md)。


## 初次上传记录

- 公网网站：https://apex-little-conch.pages.dev/
- 发布日期：2026-10-11（Asia/Shanghai）
- Pages 项目：`apex-little-conch`，直接上传模式。
- 部署 ID：`499c0351-e5e5-43af-b0d5-e32aeb7562c2`。
- 固定版本链接：https://499c0351.apex-little-conch.pages.dev/
- 生产包：`deliverables/APEX-Little-Conch-pages-v3.2.zip`，13 个文件，6,218,444 字节，zip 根目录包含 index.html，CRC 校验通过。
- 生产包 SHA-256：`5f3c674cf8ae065fd71b5c1b4f138ecf3a99e0770fd6cf3dd7d2678f5fb78ad2`。
- Cloudflare 页面显示 “13/13 files uploaded” 及 “Success! Your site was built and deployed to”；本机部署页面证据在 `qa/growth-v1/public/pages-success.jpg`。

## GitHub

- 仓库：https://github.com/huqi02951-gif/Finish-work-early
- 开发分支：`codex/little-conch-stage1-director-v1`
- 发布源码提交：`a132d84cf8959e087d9fc18b1f6440b8d9bab040`
- 交接文档提交：`705547fffc16e81831f057a92ed46843842d3404`
- 草稿 PR：https://github.com/huqi02951-gif/Finish-work-early/pull/1
- 未合并 main；父仓库原有暂存区 SHA-256 未变。

## 更新与回滚

初次发布采用直接上传，现已接通 GitHub Actions + Wrangler，保留原项目和域名。当前成功 CI 记录见上方。备份保存在 `backups/`；如需回退到原 V3，解压 `backups/V3-original-2026-10-11.zip` 到独立目录预览。前一阶段备份为 `backups/V3.1-before-director-review-2026-10-11.zip`。不覆盖当前工程。

后续 Pages 成功部署后，可在项目部署列表选择之前的成功生产部署回滚。保留先前成功生产版本以便回滚。

本机预览：http://127.0.0.1:4180/ 。本轮47张实测截图（44张本地与3张公网）画廊：http://127.0.0.1:4180/qa/native-scroll-2026-10-13/gallery.html 。旧版63张画廊：http://127.0.0.1:4180/qa/growth-v1/gallery.html 。

## 公网浏览器验收

真实 Chrome 打开公网域名，点击舱门后自动抵达 underwater / 18 m，人类前景切换为 hidden；生产页面没有验收面板。01/02/06 导航、向下拖动、滚轮、片尾署名、重播和跳过开场通过实际操作验证。

1440×900、390×844、320×568 截图文件尺寸已校验，三个视口均无横向溢出。公网实测截图在 `qa/growth-v1/public/`，画廊可本机打开 http://127.0.0.1:4180/qa/growth-v1/public/gallery.html 。此画廊不放入生产部署包。

浏览器控制台告警与错误为 0，DOM 状态记录在 `qa/growth-v1/public/browser-observations.json`。独立 Python HTTP 文件哈希检查收到 403，未能完成线上逐文件 SHA 核验；不将这项检查称为通过。浏览器视口模拟不等同物理 iOS/Android 真机测试。

## 免费自动部署与手机上滑修复（2026-10-11）

- 工作流位于父仓库根目录 `.github/workflows/little-conch-pages.yml`。触发分支为 `codex/little-conch-stage1-director-v1`，仅网站源码、素材、依赖、测试及工作流变化触发。文档修改不触发。
- 顺序：锁定依赖安装 → 21 项测试 → Vite 构建 → 当前 Pages 项目权限核验 → 发布既有 Pages 项目。源码分支未合并 main；Wrangler 的 `--branch=main` 只是既有 Pages 项目的生产部署标记。
- 用户已授权创建 `little-conch-pages-ci` 凭据，仅当前账户 Cloudflare Pages 编辑权限。已保存 GitHub 加密 Secret `LITTLE_CONCH_CLOUDFLARE_API_TOKEN`。无 DNS、Workers 或计费权限；不记录凭据值。
- 免费范围：公开仓库的标准 ubuntu-latest Actions 运行器；Pages 纯静态托管。没有 Functions、付费运行器、域名购买或套餐升级。仓库转私有时工作流停止。
- 当前本机及 CI 的 21 项测试与构建均通过。用户已完成 GitHub workflow 权限授权；工作流已推送并自动发布成功。手机修复与文案源码提交为 a07a526cc5530a4024ad51dd268e1c5001cb248d，自动部署配置提交为 8ce780cea40b8552cd6b3c3c8085834b63e6c215。
- 回滚：Pages 部署列表选择上一成功生产版本（初次固定版本为 https://499c0351.apex-little-conch.pages.dev/）。如需暂停自动发布，可在 GitHub Actions 禁用此工作流；撤销发布权限可撤销该 Cloudflare token 并删除同名 GitHub Secret。
- 修改前配置备份：`backups/auto-deploy-before-configuration/`；手机输入备份：`backups/mobile-input-before-fix/`。不覆盖原 V3 备份。

官方依据：[CI 直接上传](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)、[GitHub 免费运行器](https://docs.github.com/en/billing/concepts/product-billing/github-actions)、[Pages 静态请求免费](https://developers.cloudflare.com/pages/functions/pricing/)。

### 手机修复已单独上线

- 通过已授权的直接上传发布，13/13 文件完成，Cloudflare 显示成功。
- 部署 ID：`d1d71324-debc-4b7e-b615-4df8cac6fed4`；固定版本：https://d1d71324.apex-little-conch.pages.dev/ 。
- 修复源码提交：`a07a526cc5530a4024ad51dd268e1c5001cb248d`；包：`deliverables/APEX-Little-Conch-pages-mobile-fix.zip`，SHA-256 `d54c934926ee51c1c4433acbee364f6cdabb8e8e68a7b8f0de25a0f1cd7c01ac`。
- 普通生产页面加载新脚本 `index-BqkyFVWf.js`；不点击 01–06，连续向上拖动由初识进入外部查询，再进入后续能力；手机提示为“手指向上滑动”。
- 线上截图：`qa/growth-v1/mobile-fix/public-1440-skill3.jpg`、`public-390-skill1.jpg`、`public-320-skill2.jpg`；尺寸已校验，均无横向溢出，控制台警告/错误 0。读数见 `public-observations.json`。物理手机未测。

### 自动部署故障修正与验收

首次 CI 38150864765 在 `wrangler whoami` 失败，它尝试读取通用账户列表，而专用 token 只含 Pages 编辑权限。未增加任何 token 权限；改为访问当前账户的 `pages/projects/apex-little-conch` 核验，确认响应成功且项目名匹配，再运行 Wrangler Pages deploy。第二次 CI 38151068229 全部成功；固定版本 ac79b5a6。只输出项目认证结果，不输出凭据或完整账户资料。

成功记录与截图：`qa/growth-v1/mobile-fix/ci-success.json`、`automatic-deploy-success.jpg`。自动部署后重新打开生产网页：WebGL ready、没有 QA 工具，脚本仍为经三种尺寸验证的 index-BqkyFVWf.js；控制台警告/错误 0，读数见 after-ci-observations.json。
