import type { RedbirdRegisterOptions } from '../redbird/types/register-options';
import type { StartOptions } from 'pm2';
import type { URL } from 'url';

export interface ManagerApp {
  pkgName: string;
  domain: string;
  target?: {
    url?: URL;
    host?: string;
    port?: number;
    pathname?: string;
  };
  redbird?: RedbirdRegisterOptions;
  dir?: string;
  pkg?: any;
  pm2?: StartOptions;
}
