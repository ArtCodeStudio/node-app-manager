import { Injectable, Logger } from '@nestjs/common';
import Redbird from '@artcodestudio/redbird';
import { ConfigService } from '@nestjs/config';
import type { ManagerApp } from '../types/app';
import type { RedbirdSSL } from './types/ssl';
import type { RedbirdOptions } from './types/options';
import { URL } from 'url';

@Injectable()
export class RedbirdService {
  protected proxy: Redbird;
  protected log = new Logger('RedbirdService');
  protected options: RedbirdOptions;

  constructor(protected readonly config: ConfigService) {
    this.options = this.config.get<RedbirdOptions>('redbird');
    this.proxy = new Redbird(this.options);
  }

  protected getFullUrl(app: ManagerApp) {
    let protocol = 'http';
    let port = '';
    if (this.options.ssl && app.redbird.ssl) {
      protocol = 'https';
      if (
        typeof this.options.ssl === 'object' &&
        (this.options.ssl as RedbirdSSL).port
      ) {
        port = (this.options.ssl as RedbirdSSL).port.toString();
      }
    } else {
      port = this.options.port.toString();
    }
    const url = new URL(`${protocol}://${app.domain}`);
    url.protocol = protocol;
    if (port !== '80' && port !== '443') {
      url.port = port;
    }

    return url;
  }

  // Also possible on runtime, see https://github.com/OptimalBits/redbird#adding-and-removing-resolvers-at-runtime
  async registerApp(app: ManagerApp) {
    await this.proxy.register(
      app.domain,
      app.target.url.toString(),
      app.redbird || {},
    );
    const url = this.getFullUrl(app);
    this.log.log(`Start reverse proxy from ${url} to ${app.target.url}`);
  }

  async registerApps(apps: ManagerApp[]) {
    for (const app of apps) {
      await this.registerApp(app);
    }
  }
}
