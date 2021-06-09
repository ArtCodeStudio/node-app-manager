import { NestFactory } from '@nestjs/core';
import { ManagerModule } from './manager.module';
import { loadConfig } from './helper/config';

async function bootstrap() {
  const config = await loadConfig();
  const app = await NestFactory.create(await ManagerModule.forRoot(config), {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  await app.listen(config.manager.target?.port || 3333);
}
bootstrap();
