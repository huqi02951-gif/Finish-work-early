# Forum 服务统一说明

## 目标

以 [`ForumService`](/Users/daisy/gemini demo/finish work early/Finish-work-early/backend/src/forum/forum.service.ts) 作为唯一帖子/评论主服务，避免 `PostsService + CommentsService + ForumService` 三套并行。

## 当前结论

1. 运行链路已收敛到 `ForumModule`
2. 旧 `backend/src/posts/*` 与 `backend/src/comments/*` 已退出 `AppModule`
3. [`/users/me/posts`](/Users/daisy/gemini demo/finish work early/Finish-work-early/backend/src/users/users.controller.ts#L19) 保留为兼容接口，内部复用 `ForumService.listMyPosts`
4. canonical 社区接口统一为 `/api/v1/forum/*`

## 路由策略

### canonical

- `GET /api/v1/forum/boards`
- `GET /api/v1/forum/posts`
- `GET /api/v1/forum/posts/:id`
- `GET /api/v1/forum/posts/:id/comments`
- `POST /api/v1/forum/posts`
- `PATCH /api/v1/forum/posts/:id`
- `DELETE /api/v1/forum/posts/:id`
- `POST /api/v1/forum/posts/:id/comments`
- `GET /api/v1/forum/me/posts`

### compatibility

- `GET /api/v1/users/me/posts`

说明：

- 该接口仅作为旧前端兼容读接口保留
- 新前端与后端联调一律使用 `/forum/me/posts`

## 废弃路径

以下路径不再恢复：

- `/api/v1/posts`
- `/api/v1/posts/:id`
- `/api/v1/posts/:id/comments`

原因：

1. 继续保留会形成第二套社区入口
2. `ForumService` 已覆盖帖子列表、详情、我的帖子、评论写入
3. 后续审核、置顶、锁评、官方贴等能力都只应挂在 `forum` 域

## 工程约束

后续新增社区需求遵循两条：

1. 只在 `forum` 域扩展
2. 不再新建独立的 `posts/comments` 服务
