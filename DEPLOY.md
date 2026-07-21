# APEX 生产部署指南

当前生产拓扑：

- 前端：GitHub Pages，`https://huqi02951-gif.github.io/Finish-work-early/`
- API：Hostuno Node.js / Phusion Passenger，`https://api.coolkiy.useruno.com`
- 数据库：Hostuno PostgreSQL（仅通过生产环境变量注入连接串）
- 邮件：Hostuno SMTP，账号与密码仅保存在服务器 `.env`

仓库内禁止保存数据库密码、SMTP 密码、JWT secret、SSH 密码或 Supabase 项目密钥。

## 1. 部署前检查与备份

```bash
npm ci
npm run lint
npm run build

cd backend
npm ci
npm run build
npm audit --omit=dev --audit-level=high
```

数据库部署前必须创建 PostgreSQL custom-format 备份，并把备份保存在数据库之外。服务器旧应用目录使用改名保留，禁止直接覆盖。

## 2. Hostuno Node.js 站点

首次创建：

```bash
devil www add api.coolkiy.useruno.com nodejs /usr/local/bin/node22 production
devil www options api.coolkiy.useruno.com sslonly on
devil www options api.coolkiy.useruno.com gzip on
devil www options api.coolkiy.useruno.com cache off
devil www options api.coolkiy.useruno.com waf 2
devil www options api.coolkiy.useruno.com processes 1
```

应用目录必须是：

```text
~/domains/api.coolkiy.useruno.com/public_nodejs
```

Passenger 入口为 `backend/app.js`，它会加载构建产物 `dist/main.js`。

## 3. 生产环境变量

服务器 `public_nodejs/.env` 权限必须是 `600`。使用 `backend/.env.example` 作为字段清单，至少配置：

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
CORS_ORIGINS=https://huqi02951-gif.github.io
JWT_SECRET=<至少 48 字节随机值>
JWT_EXPIRES_IN=7d
ENABLE_DEMO_AUTH=false
SEED_ADMIN_PASSWORD=<随机值>
DATABASE_URL=<Hostuno PostgreSQL 连接串>
SMTP_HOST=mail2.hostuno.com
SMTP_PORT=465
SMTP_USER=<生产发件邮箱>
SMTP_PASS=<生产发件邮箱密码>
```

## 4. 数据库迁移

Hostuno FreeBSD 没有 Prisma schema-engine 预编译包，因此生产迁移使用已审计的 PostgreSQL runner：

```bash
cd ~/domains/api.coolkiy.useruno.com/public_nodejs
ALLOW_PRODUCTION_MIGRATION=1 npm run migrate:deploy:pg
```

runner 会校验 Prisma checksum、使用 PostgreSQL advisory lock，并把每个迁移放在独立事务中。迁移前应先在生产备份克隆库完整演练。

Prisma Client 使用 `engineType = "client"`。FreeBSD 发布包需要包含在受支持平台预生成的 `.prisma/client`（WASM query compiler），不得把 macOS 原生 `.dylib` 当作服务器运行时依赖。

## 5. 发布与回滚

将新版本解压到同级 staging 目录，安装依赖、验证迁移与健康检查后再原子改名：

```bash
mv public_nodejs public_nodejs-previous
mv public_nodejs-next public_nodejs
devil www restart api.coolkiy.useruno.com
```

回滚：

```bash
mv public_nodejs public_nodejs-failed
mv public_nodejs-previous public_nodejs
devil www restart api.coolkiy.useruno.com
```

数据库只在迁移无法向前修复时从部署前 custom-format 备份恢复。

## 6. 前端发布

`.env.production` 只保存公开 API 地址。GitHub Actions 的 `Deploy GitHub Pages` workflow 会构建并发布 `dist/`：

```bash
gh workflow run deploy-pages.yml --ref <已推送分支>
gh run watch <run-id>
```

## 7. 验证

```bash
curl https://api.coolkiy.useruno.com/api/v1/health
curl https://api.coolkiy.useruno.com/api/v1/forum/boards
curl https://api.coolkiy.useruno.com/api/v1/pantry/listings
```

期望：健康检查返回 `OK`，公开列表返回 JSON，浏览器从 GitHub Pages Origin 请求 API 时存在正确 CORS 响应头。邮箱 OTP 必须完成“发送 → 验证 → 退出”全链路测试；手机 OTP 只有在独立 SMS Provider 配置完成后才能启用。
