# 后端部署到 Hostuno 操作指南

## 前提条件
- SSH 服务器: s2.hostuno.com
- 数据库: pgsql2.hostuno.com (已配置)
- 子域名: coolkiy.useruno.com

## Step 1: SSH 登录服务器

```bash
ssh 你的用户名@s2.hostuno.com
```

> 用户名和密码从 Hostuno 面板获取: https://panel2.hostuno.com/

## Step 2: 上传后端代码

有两种方式：

### 方式 A: Git Clone (推荐)
```bash
cd ~/public_html  # 或你的网站目录
git clone https://github.com/huqi02951-gif/Finish-work-early.git
cd Finish-work-early/backend
```

### 方式 B: SFTP 上传
用 FileZilla 或类似工具把 `backend/` 整个上传到服务器

## Step 3: 配置环境变量

在 `backend/` 目录下创建 `.env` 文件：

```env
PORT=3000
JWT_SECRET=换一个更复杂的随机字符串_2024
DATABASE_URL="postgresql://p3397_finishwork:Ab123123%40@pgsql2.hostuno.com:5432/p3397_finishwork?schema=public"

# SMTP (可选，配了才能发邮件验证码)
SMTP_HOST=mail2.hostuno.com
SMTP_PORT=465
SMTP_USER=你的邮箱@域名
SMTP_PASS=你的邮箱密码
```

## Step 4: 安装依赖并部署

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

或手动执行：
```bash
npm install --production
npx prisma generate
npx prisma db push --accept-data-loss
npm run build
pm2 delete finishwork-api 2>/dev/null || true
pm2 start dist/main.js --name "finishwork-api"
pm2 save
```

## Step 5: 配置子域名代理

在 DevilWEB 面板 (https://panel2.hostuno.com/) 中：
1. 找到 Domain/Subdomain 管理
2. 选择 coolkiy.useruno.com
3. 设置反向代理到 `localhost:3000`

或通过 `.htaccess` 配置（如果面板不支持反向代理）：

在子域名的 webroot 下创建 `.htaccess`：
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## Step 6: 验证

```bash
curl http://localhost:3000/api/v1/health
# 或
curl https://coolkiy.useruno.com/api/v1/health
```

应该返回 `{"status":"ok"}`

## Step 7: 验证前端

访问 GitHub Pages 地址，打开浏览器开发者工具 → Network，确认 API 请求指向 `https://coolkiy.useruno.com/api/v1/...`

## 常见问题

### PM2 未安装
```bash
npm install -g pm2
```

### 端口被占用
```bash
lsof -ti:3000 | xargs kill -9
```

### 数据库连接失败
确认 `DATABASE_URL` 中的密码特殊字符已 URL 编码（`@` → `%40`）
