# Supabase Prisma Setup

APEX 的登录/注册链路已经走后端：前端调用 `POST /api/v1/auth/email/send-code` 和 `POST /api/v1/auth/email/verify`，后端用 Prisma 写入 `users` 表。要在 Supabase 后台看到注册用户，需要把后端 `DATABASE_URL` 指向 Supabase Postgres，并把 Prisma migration 部署到 Supabase。

## 1. 获取连接串

在 Supabase Dashboard 打开项目 `oibwkknjgtkyxntyuybb`：

1. 点击顶部 `Connect`
2. 选择 `Session pooler`
3. 复制形如下面的连接串：

```bash
postgresql://postgres.oibwkknjgtkyxntyuybb:[YOUR-DB-PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres
```

APEX 后端是长驻 Nest 服务，优先用 Session pooler。不要用 publishable key 当作 `DATABASE_URL`，它只是前端公开 API key，不能给 Prisma 连接数据库。

## 2. 配置后端环境变量

```bash
cd backend
cp .env.supabase.example .env.supabase
```

编辑 `backend/.env.supabase`：

```bash
DATABASE_URL="postgresql://postgres.oibwkknjgtkyxntyuybb:<你的数据库密码>@aws-<region>.pooler.supabase.com:5432/postgres?schema=public"
JWT_SECRET="<至少32位随机字符串>"
ENABLE_DEMO_AUTH="true"
```

`backend/.env.supabase` 只放本机，不提交到 GitHub。

## 3. 部署 Prisma 表结构

```bash
cd backend
set -a
source .env.supabase
set +a
npx prisma migrate deploy
npx prisma generate
```

如果这是一个全新的 Supabase 库，需要初始化演示数据：

```bash
npx prisma db seed
```

## 4. 启动后端和前端

```bash
cd backend
set -a
source .env.supabase
set +a
npm run start
```

前端环境变量保持指向后端：

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## 5. 验证用户注册入库

1. 打开 APEX 登录页，选择邮箱登录
2. 发送验证码
3. 如果 SMTP 未配置，在后端日志复制验证码
4. 输入验证码完成登录/注册
5. 在 Supabase Dashboard 的 Table Editor 查看 `public.users`

首次邮箱登录会自动创建一条 `users` 记录，字段包括 `email`、`username`、`nickname`、`role`、`created_at`。

## 注意

- `sb_publishable_<public-key>` 可以放在浏览器侧，但当前注册链路不需要它。
- 不要把 database password、service role key、secret key 提交到仓库。
- 如果后端部署到 serverless/edge，再单独切换到 Transaction pooler，并按连接库要求处理 prepared statements。
