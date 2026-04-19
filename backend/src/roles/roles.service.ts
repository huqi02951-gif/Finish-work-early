import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesService {
  listRoles() {
    return [
      {
        code: UserRole.USER,
        label: '普通用户',
        description: '可浏览、发帖、评论和使用基础业务能力',
      },
      {
        code: UserRole.MANAGER,
        label: '运营/版主',
        description: '可管理内容、查看审计日志和执行部分后台操作',
      },
      {
        code: UserRole.ADMIN,
        label: '管理员',
        description: '系统最高权限，可执行全局治理和配置调整',
      },
    ];
  }
}
