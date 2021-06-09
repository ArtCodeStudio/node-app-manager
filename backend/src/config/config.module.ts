import { Module } from '@nestjs/common';
import { CustomConfigService } from './config.service';

@Module({
  providers: [CustomConfigService],
  exports: [CustomConfigService],
})
export class CustomConfigModule {}
export { CustomConfigService };
