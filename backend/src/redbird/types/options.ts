import { RedbirdSSL } from './ssl';
import type { RedbirdRegisterOptions } from './register-options';

export interface RedbirdOptions {
  /**
   * http port is needed for LetsEncrypt challenge during request / renewal. Also enables automatic http->https redirection for registered https routes.
   */
  port?: number;
  letsencrypt?: {
    path?: string;
    /**
     *  LetsEncrypt minimal web server port for handling challenges. Routed 80->9999, no need to open 9999 in firewall. Default 3000 if not defined.
     */
    port: number;
  };
  ssl?: RedbirdSSL | RedbirdSSL[] | boolean;
  appDefaults?: RedbirdRegisterOptions;
}
