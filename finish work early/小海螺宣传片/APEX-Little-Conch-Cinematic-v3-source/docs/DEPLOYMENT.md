# GitHub 与 Cloudflare Pages 发布记录

## 已发布的预览

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

初次发布采用直接上传，现已配置 GitHub Actions + Wrangler，保留原项目和域名。新的自动发布实测记录见下方。备份保存在 `backups/`；如需回退到原 V3，解压 `backups/V3-original-2026-10-11.zip` 到独立目录预览。前一阶段备份为 `backups/V3.1-before-director-review-2026-10-11.zip`。不覆盖当前工程。

后续 Pages 成功部署后，可在项目部署列表选择之前的成功生产部署回滚。当前为本项目首次成功部署。

本机预览：http://127.0.0.1:4180/ 。63 张本地实测截图画廊：http://127.0.0.1:4180/qa/growth-v1/gallery.html 。

## 公网浏览器验收

真实 Chrome 打开公网域名，点击舱门后自动抵达 underwater / 18 m，人类前景切换为 hidden；生产页面没有验收面板。01/02/06 导航、向下拖动、滚轮、片尾署名、重播和跳过开场通过实际操作验证。

1440×900、390×844、320×568 截图文件尺寸已校验，三个视口均无横向溢出。公网实测截图在 `qa/growth-v1/public/`，画廊可本机打开 http://127.0.0.1:4180/qa/growth-v1/public/gallery.html 。此画廊不放入生产部署包。

浏览器控制台告警与错误为 0，DOM 状态记录在 `qa/growth-v1/public/browser-observations.json`。独立 Python HTTP 文件哈希检查收到 403，未能完成线上逐文件 SHA 核验；不将这项检查称为通过。浏览器视口模拟不等同物理 iOS/Android 真机测试。

## 免费自动部署与手机上滑修复（2026-10-11）

- 工作流位于父仓库根目录 `.github/workflows/little-conch-pages.yml`。触发分支为 `codex/little-conch-stage1-director-v1`，仅网站源码、素材、依赖、测试及工作流变化触发。文档修改不触发。
- 顺序：锁定依赖安装 → 21 项测试 → Vite 构建 → Wrangler 身份核验 → 发布既有 Pages 项目。源码分支未合并 main；Wrangler 的 `--branch=main` 只是既有 Pages 项目的生产部署标记。
- 用户已授权创建 `little-conch-pages-ci` 凭据，仅当前账户 Cloudflare Pages 编辑权限。已保存 GitHub 加密 Secret `LITTLE_CONCH_CLOUDFLARE_API_TOKEN`。无 DNS、Workers 或计费权限；不记录凭据值。
- 免费范围：公开仓库的标准 ubuntu-latest Actions 运行器；Pages 纯静态托管。没有 Functions、付费运行器、域名购买或套餐升级。仓库转私有时工作流停止。
- 当前本机测试与构建通过；首次 CI/线上验收结果将在成功后补充，配置存在不等于部署成功。
- 回滚：Pages 部署列表选择上一成功生产版本（初次固定版本为 https://499c0351.apex-little-conch.pages.dev/）。如需暂停自动发布，可在 GitHub Actions 禁用此工作流；撤销发布权限可撤销该 Cloudflare token 并删除同名 GitHub Secret。
- 修改前配置备份：`backups/auto-deploy-before-configuration/`；手机输入备份：`backups/mobile-input-before-fix/`。不覆盖原 V3 备份。

官方依据：[CI 直接上传](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)、[GitHub 免费运行器](https://docs.github.com/en/billing/concepts/product-billing/github-actions)、[Pages 静态请求免费](https://developers.cloudflare.com/pages/functions/pricing/)。
