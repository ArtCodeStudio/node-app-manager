import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';
import { RedbirdService } from './redbird.service';
import type { RedbirdOptions } from './types/options';

@Module({
  imports: [],
  providers: [RedbirdService],
  exports: [RedbirdService],
})
export class RedbirdModule {
  static async forRoot(redbird: RedbirdOptions): Promise<DynamicModule> {
    return {
      imports: [
        ConfigModule.forRoot({
          load: [registerAs('redbird', () => redbird)],
        }),
      ],
      module: RedbirdModule,
      providers: [],
      controllers: [],
      exports: [],
    };
  }
}
export { RedbirdService };
