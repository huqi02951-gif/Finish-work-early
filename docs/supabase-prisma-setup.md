# Supabase Prisma Setup

> 可选集成，当前 Hostuno 生产环境未启用。邮箱 OTP 已由 APEX 后端 SMTP 接管；本方案仅用于未来接入手机短信供应商或迁移认证平台。

启用后，APEX 采用 Supabase Auth + APEX 后端 JWT 的两段式登录：

1. 前端使用 Supabase 邮箱 OTP 或手机 OTP 完成注册/登录，用户会进入 Supabase `auth.users`
2. 前端把 Supabase access token 交给 `POST /api/v1/auth/supabase/exchange`
3. 后端验证 Supabase token，创建或同步本地 `public.users`，再签发 APEX JWT
4. 可选：前端通过 Data API upsert `public.apex_user_profiles`，方便在 Table Editor 查看 APEX profile 映射

这样用户注册后可以在 Supabase 后台看到账号，同时仍然能继续使用 APEX 现有的论坛、工作台等后端功能。

## 1. 获取连接串

在 Supabase Dashboard 打开你新建且可访问的项目：

1. 点击顶部 `Connect`
2. 选择 `Session pooler`
3. 复制形如下面的连接串：

```bash
postgresql://postgres.[PROJECT_REF]:[YOUR-DB-PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres
```

APEX 后端是长驻 Nest 服务，优先用 Session pooler。不要用 publishable key 当作 `DATABASE_URL`，它只是前端公开 API key，不能给 Prisma 连接数据库。

## 2. 配置前端 Supabase Auth

项目根目录创建 `.env.local`：

```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<你的 publishable key>
```

生产构建也需要同样的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`。`sb_publishable_...` 是浏览器侧公开 key，可以用于 Supabase Auth；不要把 service role key 放进前端。

## 3. 配置后端环境变量

```bash
cd backend
cp .env.supabase.example .env.supabase
```

编辑 `backend/.env.supabase`：

```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:<你的数据库密码>@aws-<region>.pooler.supabase.com:5432/postgres?schema=public"
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_PUBLISHABLE_KEY="<你的 publishable key>"
JWT_SECRET="<至少32位随机字符串>"
ENABLE_DEMO_AUTH="true"
```

`backend/.env.supabase` 只放本机，不提交到 GitHub。

## 4. 部署 Prisma 表结构

```bash
cd backend
set -a
source .env.supabase
set +a
npx prisma migrate deploy
npx prisma generate
```

这会给 `public.users` 增加 `supabase_auth_id`，用于把 Supabase Auth 的 UUID 用户映射到 APEX 原有的整数用户 ID。

如果希望前端通过 Data API 同步 profile 行，在 Supabase SQL Editor 运行 [supabase-data-api-profile.sql](/Users/daisy/gemini%20demo/finish%20work%20early/Finish-work-early/docs/supabase-data-api-profile.sql)。

这会创建 `public.apex_user_profiles`，并启用 RLS，只允许已登录用户读写自己的 profile。该表支持邮箱账号和手机号账号，字段包括 `email`、`phone`、`nickname`、`apex_user_id`。

如果这是一个全新的 Supabase 库，需要初始化演示数据：

```bash
npx prisma db seed
```

## 5. 启动后端和前端

```bash
cd backend
set -a
source .env.supabase
set +a
npm run start
```

前端环境变量保持指向后端：

```bash
npm run dev
```

## 6. 验证用户注册入库

1. 打开 APEX 登录页，选择邮箱或手机登录
2. 发送 Supabase 验证码
3. 输入验证码完成登录/注册
4. 在 Supabase Dashboard 查看 `Authentication > Users`
5. 如果后端 `DATABASE_URL` 已指向 Supabase，再到 Table Editor 查看 `public.users`
6. 如果运行了 Data API profile SQL，再查看 `public.apex_user_profiles`

首次邮箱或手机登录会自动创建一条 `users` 记录，字段包括 `email` 或 `phone`、`username`、`nickname`、`role`、`created_at`。

## 注意

- 手机验证码需要在 Supabase Dashboard 的 `Authentication > Providers > Phone` 中配置 SMS Provider；否则前端会显示 Supabase 手机验证码未启用。
- `sb_publishable_<public-key>` 可以放在浏览器侧，当前注册链路需要它调用 Supabase Auth。
- 不要把 database password、service role key、secret key 提交到仓库。
- 如果后端部署到 serverless/edge，再单独切换到 Transaction pooler，并按连接库要求处理 prepared statements。
