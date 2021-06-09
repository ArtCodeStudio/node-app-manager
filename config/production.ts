import type { ManagerApp } from "@artcodestudio/node-app-manager/src/types/app";
import type { ManagerOptions } from "@artcodestudio/node-app-manager/src/types/options";
import type { RedbirdOptions } from "@artcodestudio/node-app-manager/src/redbird/types/options";

import { resolve } from "path";

export const manager: ManagerOptions = {
  pkgName: "@artcodestudio/node-app-manager",
  domain: "manage.artandcode.de",
  target: {
    port: 3000,
  },
  pm2: {},
};

export const redbird: RedbirdOptions = {
  /**
   * http port is needed for LetsEncrypt challenge during request / renewal. Also enables automatic http->https redirection for registered https routes.
   */
  port: 80,
  letsencrypt: {
    path: resolve(__dirname, "../..", "certs"),
    /**
     *  LetsEncrypt minimal web server port for handling challenges. Routed 80->9999, no need to open 9999 in firewall.
     */
    port: 9999,
  },
  ssl: {
    http2: true,
    redirect: true, // False to disable HTTPS auto redirect to this route.
    /**
     * SSL port used to serve registered https routes with LetsEncrypt certificate.
     */
    port: 443,
  },
  appDefaults: {
    ssl: {
      letsencrypt: {
        email: "hi@artandcode.studio", // Domain owner/admin email
        production: false, // WARNING: Only use this flag when the proxy is verified to work correctly to avoid being banned!
      },
    },
  },
};

export const apps: ManagerApp[] = [
  {
    pkgName: "@node-app-manager/example",
    domain: "example.artandcode.de",
    target: {
      port: 3001,
    },
    pm2: {
      script: "yarn workspace @node-app-manager/example start",
      env: {
        MESSAGE:
          "App managed by @artcodestudio/node-app-manager in production mode",
      },
    },
  },
];
