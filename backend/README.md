# FinishWork Backend

这是当前阶段后端基础，提供认证、论坛、catalog、页面配置等核心 API。
使用 `NestJS` + `Prisma` + `PostgreSQL` 构建。

## 环境要求
- Node.js (v18+)
- PostgreSQL 数据库信息（参考配置文件）

## 本地启动步骤
1. **安装依赖**
   ```bash
   npm install
   ```
2. **连接数据库**
   复制环境变量模板：
   ```bash
   cp .env.example .env
   ```
   **注意**：
   - `JWT_SECRET` 必填，不能使用占位值
   - `ENABLE_DEMO_AUTH` 建议仅在本地联调时开启
   - 本地开发建议通过 SSH Tunnel 工具映射数据库到本地（端口 5432）
3. **初始化数据库表（Migration）**
   此命令会读取你的 `.env`，连接库并创建三张核心表（users, posts, comments）：
   ```bash
   npm run prisma:migrate
   ```
   随后代码会自动生成 Prisma Client，你也可以手动执行：
   ```bash
   npm run prisma:generate
   ```
4. **启动服务**
   ```bash
   npm run start:dev
   ```
   服务将默认启动于 `http://localhost:3000`。

## 本地 Docker PostgreSQL 开发库

当前地下茶水间本地开发推荐使用项目根目录的 `docker-compose.yml` 启动独立 PostgreSQL，避免远程 Hostuno 数据库 IP 白名单和权限问题阻塞开发。

1. 启动本地数据库：
   ```bash
   cd ..
   docker compose up -d postgres
   ```

2. 使用本地数据库环境变量。不要覆盖生产/远程配置；可以临时复制一份：
   ```bash
   cd backend
   cp .env.local-docker.example .env.local
   ```

3. 在当前 shell 导入 `.env.local` 后执行迁移和 seed：
   ```bash
   set -a
   source .env.local
   set +a
   npx prisma migrate deploy
   npx prisma db seed
   npx prisma generate
   ```

4. 启动本地后端：
   ```bash
   set -a
   source .env.local
   set +a
   npm run start
   ```

5. 前端仍然指向本地后端：
   ```bash
   VITE_API_BASE_URL=http://127.0.0.1:3001 npm run dev -- --host 127.0.0.1 --port 5173
   ```

本地开发库连接串：

```bash
DATABASE_URL="postgresql://finishwork:finishwork_dev@127.0.0.1:5432/finish_work_early?schema=public"
```

如果需要清空本地开发数据：

```bash
docker compose down -v
docker compose up -d postgres
```

## Supabase PostgreSQL

当前生产用户、论坛和茶水间数据统一落在 Hostuno PostgreSQL。邮箱 OTP 由 APEX Nest 后端与生产 SMTP 处理，不依赖 Supabase。

Supabase bridge 仅保留为未来手机短信供应商或迁移方案；只有配置了一个真实可访问的 Supabase 项目和 SMS Provider 后，才可以在前端启用手机登录。后端可通过 `POST /api/v1/auth/supabase/exchange` 校验 Supabase token，并签发 APEX JWT。

安全模板见 `.env.supabase.example`，完整步骤见 `../docs/supabase-prisma-setup.md`。

关键点：
- 前端邮箱注册由 APEX `auth/email/*` 接口处理
- 手机注册仅在 Supabase/SMS Provider 完整配置后启用
- 后端 exchange 会同步 `users.supabase_auth_id`
- `sb_publishable_...` 是浏览器公开 key，不能作为 Prisma 的数据库连接串
- 真实 database password、service role key、JWT secret 不要提交到 GitHub

## 已有旧版开发库的升级方式

如果你的数据库里已经存在旧版 `users/posts/comments` 表，但字段还是早期 MVP 结构，先执行这份保守升级脚本：

```bash
npx prisma db execute --file prisma/manual/20260412_legacy_dev_upgrade.sql --schema prisma/schema.prisma
```

这份脚本会优先重命名旧列并补充新字段，避免直接删表。

## Hostuno 环境部署步骤
生产使用 Hostuno Node.js / Phusion Passenger，不再使用 PM2。完整发布、FreeBSD Prisma Client、备份与回滚步骤见根目录 `DEPLOY.md`。

核心命令：

```bash
npm ci
npm run build
ALLOW_PRODUCTION_MIGRATION=1 npm run migrate:deploy:pg
devil www restart api.coolkiy.useruno.com
```

`public_nodejs/.env` 必须为 `600` 权限；数据库、JWT 和 SMTP 密码不得进入 Git。

## ✅ 测试是否成功 Checklist

后端启动完毕后，推荐利用 `curl`, `Postman`, 或 `Apifox` 依次执行以下测试：

- [ ] **1. 健康检查**：
  访问 `GET http://localhost:3000/api/v1/health`，应返回 `OK` (HTTP 200)。证明核心框架路由成功启动。

- [ ] **2. 用户注册**：
  访问 `POST http://localhost:3000/api/v1/auth/register` 提供：
  ```json
  { "username": "testuser", "password": "123" }
  ```
  成功则返回生成的用户对象 `{ "id": 1, "username": "testuser" }`，象征持久化入库成功。

- [ ] **3. 用户登录**：
  访问 `POST http://localhost:3000/api/v1/auth/login` 提供同上信息。应收到 `{"access_token": "eyJhbGci..."}` 的响应格式。

- [ ] **4. 自身数据校验 (鉴权通道)**：
  在 Header 中携带 `Authorization: Bearer <填入上一步获取到的token>`
  再去访问 `GET http://localhost:3000/api/v1/users/me`，若解出了当前库中存储的用户身份，证明全局 JWT 鉴权层运转正常。

- [ ] **5. 发送帖子**：
  携带 token 访问 `POST http://localhost:3000/api/v1/forum/posts` 提交：
  ```json
  { "boardSlug": "experience-sharing", "title": "my first post", "content": "hello world" }
  ```
  能顺利返回带有 `id` 及其时间戳的整条新记录，证明发帖（鉴权身份提取外联）逻辑贯通。

- [ ] **6. 发表评论**：
  携带 token 访问 `POST http://localhost:3000/api/v1/forum/posts/1/comments` (假设上一个发帖 ID 为 1) 提交：
  ```json
  { "content": "great post!" }
  ```
  成功则反馈带 `postId` 制约关联插入的评论对象数据。

- [ ] **7. 查看社区公开内容集**：
  不携带任何凭证，访问裸 API：
  `GET http://localhost:3000/api/v1/forum/boards` 获取版块阵列；
  `GET http://localhost:3000/api/v1/forum/posts` 获取帖子阵列；
  `GET http://localhost:3000/api/v1/forum/posts/1` 获取帖子详情；
  `GET http://localhost:3000/api/v1/forum/posts/1/comments` 获取评论阵列。
