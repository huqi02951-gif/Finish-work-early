# FinishWork - Phase 1 Backend (MVP)

这是平台一期后端，仅提供核心业务的 API （用户、帖子、评论）及数据持久化连通。
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
   **注意**：本地开发建议通过 SSH Tunnel 工具映射 Hostuno 数据库到本地（端口 5432），并使用 Option 1（127.0.0.1）进行连接。
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

## 已有旧版开发库的升级方式

如果你的数据库里已经存在旧版 `users/posts/comments` 表，但字段还是早期 MVP 结构，先执行这份保守升级脚本：

```bash
npx prisma db execute --file prisma/manual/20260412_legacy_dev_upgrade.sql --schema prisma/schema.prisma
```

这份脚本会优先重命名旧列并补充新字段，避免直接删表。

## Hostuno 环境部署步骤
根据 Hostuno 的 Node 方案机制部署建议：
1. 配置好服务器的 Node 安装（如使用 nvm 安装 Node 18+）。
2. 将此项目的代码传至服务器。
3. 配置环境变量：将外网真实的 `DB_URL` (`postgresql://p3397_finishwork:Ab123123%40@pgsql2.hostuno.com...`) 配置至服务器上的 `.env`。由于是在 Hostuno 体系内，使用 `pgsql2.hostuno.com` 直接互连网络质量最佳。
4. 在服务器端执行安装及打包构建：
   ```bash
   npm install
   npm run prisma:generate
   npm run build
   ```
5. 使用 PM2 常驻进程运行（假设已经在服务端全局安装 PM2）：
   ```bash
   pm2 start dist/main.js --name "finishwork-api"
   ```

## ✅ 测试是否成功 Checklist

后端启动完毕后，推荐利用 `curl`, `Postman`, 或 `Apifox` 依次执行以下测试，全通即代表 Phase 1 （本基础连通模块）彻底完结：

- [ ] **1. 健康检查**：
  访问 `GET http://localhost:3000/health`，应返回 `OK` (HTTP 200)。证明核心框架路由成功启动。
  
- [ ] **2. 用户注册**：
  访问 `POST http://localhost:3000/auth/register` 提供：
  ```json
  { "username": "testuser", "password": "123" }
  ```
  成功则返回生成的用户对象 `{ "id": 1, "username": "testuser" }`，象征持久化入库成功。
  
- [ ] **3. 用户登录**：
  访问 `POST http://localhost:3000/auth/login` 提供同上信息。应收到 `{"access_token": "eyJhbGci..."}` 的响应格式。
  
- [ ] **4. 自身数据校验 (鉴权通道)**：
  在 Header 中携带 `Authorization: Bearer <填入上一步获取到的token>` 
  再去访问 `GET http://localhost:3000/users/me`，若解出了当前库中存储的用户身份，证明全局 JWT 鉴权层运转正常。
  
- [ ] **5. 发送帖子**：
  携带 token 访问 `POST http://localhost:3000/posts` 提交：
  ```json
  { "title": "my first post", "content": "hello world" }
  ```
  能顺利返回带有 `id` 及其时间戳的整条新记录，证明发帖（鉴权身份提取外联）逻辑贯通。
  
- [ ] **6. 发表评论**：
  携带 token 访问 `POST http://localhost:3000/posts/1/comments` (假设上一个发帖 ID 为 1) 提交：
  ```json
  { "content": "great post!" }
  ```
  成功则反馈带 `postId` 制约关联插入的评论对象数据。

- [ ] **7. 查看社区公开内容集**：
  不携带任何凭证，访问裸 API：
  `GET http://localhost:3000/posts` 获取帖子阵列；
  `GET http://localhost:3000/posts/1` 获取具体帖子详情及其下挂评论阵列。验证连表查询无误。
