import { Module } from '@nestjs/common';
import { Pm2Service } from './pm2.service';

@Module({
  imports: [],
  providers: [Pm2Service],
  exports: [Pm2Service],
})
export class Pm2Module {}
export { Pm2Service };
