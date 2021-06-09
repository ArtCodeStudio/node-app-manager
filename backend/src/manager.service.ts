import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { RedbirdService } from './redbird/redbird.module';
import { Pm2Service } from './pm2/pm2.module';
import { ConfigService } from '@nestjs/config';
import type { ManagerApp } from './types/app';
import type { ManagerOptions } from './types/options';

@Injectable()
export class ManagerService implements OnApplicationBootstrap {
  protected log = new Logger('ManagerService');
  protected options: ManagerOptions;

  constructor(
    protected readonly config: ConfigService,
    protected readonly redbird: RedbirdService,
    protected readonly pm2: Pm2Service,
  ) {
    this.options = this.config.get<ManagerOptions>('manager');
  }

  onApplicationBootstrap() {
    this.startApps();
    this.proxyApps();
  }

  async proxyApps() {
    // this.log.debug('registerApps');
    const apps = this.config.get<ManagerApp[]>('apps');
    try {
      await this.redbird.registerApp(this.options);
      await this.redbird.registerApps(apps);
    } catch (error) {
      this.log.error('Error on register app proxies ', error);
      throw error;
    }
  }
  async startApps() {
    // this.log.debug('startApps');
    const apps = this.config.get<ManagerApp[]>('apps');
    try {
      await this.pm2.startApps(apps, []);
    } catch (error) {
      this.log.error('Error on start app processes : ' + error);
      throw error;
    }
  }
}
