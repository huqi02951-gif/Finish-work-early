import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth(): string {
    return 'OK'; // 健康检查接口 Phase 1
  }
}
