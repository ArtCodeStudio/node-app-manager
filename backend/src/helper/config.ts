import { Logger } from '@nestjs/common';
import { resolve } from 'path';
import type { ManagerConfig } from '../types/config';
import type { ManagerOptions } from '../types/options';
import type { ManagerApp } from '../types/app';
import type { RedbirdSSL } from '../redbird/types/ssl';
import type { RedbirdRegisterOptions } from '../redbird/types/register-options';
import { CustomConfigService } from '../config/config.module';
import { sync } from 'glob';
import { parse as dotenvParse } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { URL } from 'url';
import { isInteger } from 'lodash';
import * as getPort from 'get-port';
import * as appRoot from 'app-root-path';

const log = new Logger('config helpers');

const getWorkspaceDirs = () => {
  const mainPkg = loadJsonFile(resolve(appRoot.path, 'package.json'));
  const match = mainPkg.workspaces.filter((s: string) => !s.startsWith('!'));

  let matchGlob = '';

  if (match.length === 1) {
    matchGlob = match.toString();
  } else if (match.length > 1) {
    matchGlob = `{${match.join(',')}}`;
  }

  log.debug(`matchGlob: ${matchGlob}`);

  const dirs = sync(matchGlob, {
    cwd: appRoot.path,
  });
  log.debug(`workspace dirs: ${dirs}`);
  return dirs;
};

const loadJsonFile = (path: string) => {
  if (!existsSync(path)) {
    log.warn(`Path not found! ${path}`);
    return;
  }
  return JSON.parse(loadTextFile(path));
};

const loadEnvFile = (path: string) => {
  if (!existsSync(path)) {
    log.warn(`Path not found! ${path}`);
    return;
  }
  return dotenvParse(readFileSync(path, 'utf8'));
};

const loadTextFile = (path: string) => {
  if (!existsSync(path)) {
    log.warn(`Path not found! ${path}`);
    return;
  }
  return readFileSync(path, 'utf8');
};

/**
 * Load package.json for each app
 * @param apps
 */
const loadPkgData = (apps: ManagerApp[]) => {
  const wsDirs = getWorkspaceDirs();
  for (let wsDir of wsDirs) {
    wsDir = resolve(appRoot.path, wsDir);
    if (!existsSync(wsDir)) {
      log.warn('Directory not found! ' + wsDir);
      continue;
    }
    const pgk = loadJsonFile(resolve(wsDir, 'package.json'));
    if (!pgk) {
      log.warn('package.json not found for ' + wsDir);
      continue;
    }
    if (pgk?.name) {
      const index = apps.findIndex((app) => app.pkgName === pgk.name);
      if (index === -1) {
        // log.debug('App not found for ' + pgk?.name);
        continue;
      }
      // Add more properties here if you need more
      apps[index].pkg = {
        name: pgk.name,
        scripts: pgk.scripts,
      };
      apps[index].dir = wsDir;
      log.debug(
        `package.json found for ${apps[index]?.pkgName} in ${apps[index].dir}`,
      );
    }
  }
};

const getUsedPorts = (apps: ManagerApp[]) => {
  const ports: number[] = [];
  apps
    .filter((app) => isInteger(Number(app?.target?.port)))
    .map((app) => {
      app.target.port;
    });

  return ports;
};

const findPort = async (
  exclude: number[] = [],
  options: getPort.Options = {},
) => {
  let port = await getPort(options);
  while (exclude.includes(port)) {
    port = await getPort(options);
  }
  return port;
};

const setPorts = async (config: ManagerConfig) => {
  const DEBUGGER_PORT = 9229;
  const used: number[] = [DEBUGGER_PORT];

  config.redbird = config.redbird || {};
  config.redbird.port = config.redbird.port || 80;

  // Redbird http port
  config.redbird.port = await findPort([], {
    port: config.redbird.port,
  });

  used.push(config.redbird.port);

  // Redbird https port
  if ((config.redbird?.ssl as RedbirdSSL)?.port) {
    (config.redbird.ssl as RedbirdSSL).port = await findPort([], {
      port: (config.redbird.ssl as RedbirdSSL).port || 443,
    });
    used.push((config.redbird.ssl as RedbirdSSL).port);
  }

  if (config.redbird.letsencrypt) {
    config.redbird.letsencrypt.port = await findPort(used, {
      port: config.redbird.letsencrypt.port || 9999,
    });
    used.push(config.redbird.letsencrypt.port);
  }

  // Manager port
  config.manager.target = config.manager.target || {};
  if (process.env.PORT) {
    config.manager.target.port = Number(process.env.PORT);
  }
  if (!config.manager.target?.port) {
    config.manager.target.port = await findPort(used);
  }
  used.push(config.manager.target.port);

  // App ports
  for (const app of config.apps) {
    app.target = app.target || {};
    if (!app.target?.port) {
      const exclude = [...used, ...getUsedPorts(config.apps)];
      app.target.port = await findPort(exclude);
    }
  }
  return config;
};

const setAppDefaults = (
  apps: ManagerApp[],
  defaults: RedbirdRegisterOptions = {},
) => {
  let shortEnv = '';
  switch (process.env.NODE_ENV) {
    case 'production':
      shortEnv = 'prod';
      break;
    case 'development':
      shortEnv = 'dev';
      break;
    case 'local':
      shortEnv = 'local';
      break;
    default:
      shortEnv = process.env.NODE_ENV;
      break;
  }

  // Set defaults for each app
  for (const app of apps) {
    // redbird
    app.redbird = { ...defaults, ...app.redbird };

    // target
    app.target = app.target || {};
    if (!app.target.url) {
      app.target.url = new URL(app.target.host || 'http://localhost');
      if (app.target.port) {
        app.target.url.port = app.target.port.toString();
      }
      if (app.target.pathname) {
        app.target.url.pathname = app.target.pathname;
      }
    }

    if (app.dir) {
      const env = loadEnvFile(resolve(app.dir, '.env')) || {};

      // pm2
      app.pm2 = app.pm2 || ({} as any);
      app.pm2.name = shortEnv + ':' + (app.pm2.name || app.pkgName);
      app.pm2.instances = app.pm2.instances || 1;
      app.pm2.env = app.pm2.env || {};
      app.pm2.env = {
        ...env,
        ...app.pm2.env,
      };
      app.pm2.cwd = app.dir;

      // Environment variables
      app.pm2.env.PORT = app.target.port.toString() || app.pm2.env.PORT;
    }
  }
};

const validateAppConfigs = (apps: ManagerApp[], manager: ManagerOptions) => {
  for (const app of apps) {
    // Ignore app manager itself
    if (app.pkgName === manager.pkg.name) {
      continue;
    }
    if (!app?.pm2?.script) {
      throw new Error('You must set a script for pm2 apps!');
    }
  }
};

const processConfigs = async (config: ManagerConfig) => {
  await setPorts(config);

  // The manager itself is an app
  loadPkgData([config.manager]);
  setAppDefaults([config.manager], config.redbird.appDefaults);
  // All other apps
  loadPkgData(config.apps);
  setAppDefaults(config.apps, config.redbird.appDefaults);
  validateAppConfigs(config.apps, config.manager);

  // log.debug(`apps: ${JSON.stringify(config.apps, null, 2)}`);
};

export const loadConfig = async (configDir: string, env: string) => {
  const basePath = resolve(appRoot.path, configDir);
  log.debug(`Load config for "${env}"`);
  const configPath = resolve(basePath, `${env}.ts`);
  let fallbackConfigPath = '';

  switch (env) {
    case 'local':
      fallbackConfigPath = resolve(basePath, `development.ts`);
      break;
    case 'development':
      fallbackConfigPath = resolve(basePath, `local.ts`);
      break;
    case 'production':
      fallbackConfigPath = resolve(basePath, `development.ts`);
      break;
    default:
      fallbackConfigPath = resolve(basePath, `local.ts`);
      break;
  }

  const config = CustomConfigService.loadConfig<ManagerConfig>([
    configPath,
    fallbackConfigPath,
  ]);

  await processConfigs(config);
  // log.debug(`Config redbird: "${JSON.stringify(config.redbird, null, 2)}"`);
  // log.debug(`Config manager: "${JSON.stringify(config.manager, null, 2)}"`);
  // log.debug(`Config apps: "${JSON.stringify(config.apps, null, 2)}"`);

  return config;
};
