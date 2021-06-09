import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ManagerApp } from '../types/app';
import * as pm2 from 'pm2';
import type { Proc } from 'pm2';
import { promisify } from 'util';
import { exists, run } from '../helper/cmd';
import { URL } from 'url';

@Injectable()
export class Pm2Service
  implements OnApplicationBootstrap, OnApplicationShutdown {
  log = new Logger('Pm2');

  // constructor() {}

  async onApplicationBootstrap() {
    this.connect();
  }

  onApplicationShutdown() {
    this.disconnect();
  }

  protected onError(err: Error) {
    if (err) {
      this.log.error(err);
      this.disconnect();
      throw err;
    }
  }

  public async connect() {
    this.log.debug('connect');
    const pm2Exists = await exists('pm2');
    if (!pm2Exists) {
      console.warn(new Error(
        'pm2 not found, do you have pm2 installed globally with npm or yarn? If not, please follow the instructions on https://pm2.keymetrics.io/docs/usage/quick-start/',
      ));
    }
    pm2.connect(this.onError.bind(this));
  }

  public async disconnect() {
    this.log.debug('disconnect');
    pm2.disconnect();
  }

  /**
   *
   * @param app
   * @see https://pm2.keymetrics.io/docs/usage/pm2-api/#programmatic-api
   */
  public async startApp(app: ManagerApp) {
    // this.log.debug(`Start new process "${app.pkgName}"`);
    return new Promise((resolve, reject) => {
      pm2.start(app.pm2, (err: Error, proc: Proc) => {
        if (err) {
          this.log.error(err);
          return reject(err);
        }
        const url = new URL(app.target.url.toString());
        url.pathname = '';
        this.log.log(`Start process ${app.pm2.name} on ${url}`);
        resolve(proc);
      });
      
    });
  }

  /**
   *
   * @param apps
   * @see https://pm2.keymetrics.io/docs/usage/pm2-api/#programmatic-api
   */
  public async startApps(apps: ManagerApp[], excludeName: string[]) {
    for (const app of apps) {
      if (!excludeName.includes(app.pkgName)) {
        await this.startApp(app);
      }
    }
    await this.save();
  }

  public async delete(id: number | string) {
    return new Promise((resolve, reject) => {
      pm2.delete(id, (err, proc) => {
        if (err) {
          this.log.error(err);
          return reject(err);
        }
        return resolve(proc);
      });
    });
  }

  public async stop(id: number | string) {
    return new Promise((resolve, reject) => {
      pm2.stop(id, (err, proc) => {
        if (err) {
          this.log.error(err);
          return reject(err);
        }
        return resolve(proc);
      });
    });
  }

  public async restartApp(app: ManagerApp) {
    this.log.debug(`Restart process "${app.pkgName}"`);
    let proc = await this.getProcessByName(app.pm2.name);
    if (!proc) {
      this.log.warn('Process not found!');
      return;
    }
    proc = await this.stop(proc.pid);
    proc = await this.delete(proc.pid);
    return this.startApp(app);
  }

  public async getProcessByName(slug: string) {
    try {
      const processDescriptionList = await promisify(pm2.list)();
      const matches = processDescriptionList.filter(
        (proc) => proc.name === slug,
      );
      if (matches.length > 0) {
        return matches[0];
      }
      return null;
    } catch (error) {
      this.log.error(error);
      return null;
    }
  }

  public async save(force = false) {
    const pm2Exists = await exists('pm2');
    if (pm2Exists) {
      let cmd = "pm2 save";
      if (force) {
        cmd += " --force";
      }
      return run(cmd)
    }
    return null;
  }

  public async update() {
    const pm2Exists = await exists('pm2');
    if (pm2Exists) {
      return run("pm2 update")
    }
    return null;
  }
}
