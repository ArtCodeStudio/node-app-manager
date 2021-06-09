import type { ManagerApp } from "@artcodestudio/node-app-manager/src/types/app";
import type { ManagerOptions } from "@artcodestudio/node-app-manager/src/types/options";
import type { RedbirdOptions } from "@artcodestudio/node-app-manager/src/redbird/types/options";

export const manager: ManagerOptions = {
  pkgName: "@artcodestudio/node-app-manager",
  domain: "manager.localhost",
  target: {
    port: 3000,
  },
  pm2: {},
};

export const redbird: RedbirdOptions = {
  ssl: false,
};

export const apps: ManagerApp[] = [
  {
    pkgName: "@node-app-manager/example-app",
    domain: "example.localhost",
    target: {
      // This port will also be the set as env.PORT in pm2
      port: 3001,
    },
    pm2: {
      script: "yarn workspace @node-app-manager/example-app run watch",
      // The app restarts by itself on changes but this is not working fpr new packages, so we also watch the package.json with pm2
      watch: ["package.json", "./.pnp.js"],
      env: {
        MESSAGE: "App managed by @artcodestudio/node-app-manager in local mode",
      },
    },
  },
];
