import { NestFactory } from '@nestjs/core';
import { ManagerModule } from './manager.module';
import { loadConfig } from './helper/config';
import yargs, { Argv } from "yargs";
import { hideBin } from "yargs/helpers";

const parseArgs = async () => {
  const argv = await yargs(hideBin(process.argv))
    .option("configDir", {
      alias: "c",
      type: "string",
      description: "Config directory",
      default: 'config',
    })
    .option("env", {
      alias: "e",
      type: "string",
      description: "Enviroment",
      default: process.env.NODE_ENV || 'development',
    })
    .argv

  return argv
}

const bootstrap = async () => {
  const args = await parseArgs();
  const config = await loadConfig(args.configDir, args.env);
  const app = await NestFactory.create(await ManagerModule.forRoot(config), {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  await app.listen(config.manager.target?.port || 3333);
}
bootstrap();
