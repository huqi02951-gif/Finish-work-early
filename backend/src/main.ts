import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '127.0.0.1';
  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}/api/v1`);
}
bootstrap();
