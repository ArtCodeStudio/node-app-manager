import { Injectable, Logger } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { transpileModule, CompilerOptions, ModuleKind } from 'typescript';
import * as YAML from 'yaml';
import { Script } from 'vm';

@Injectable()
export class CustomConfigService {
  protected static log = new Logger('CustomConfigService');

  /**
   * Loads a pure TypeScript or yaml config file
   * @param configPath
   */
  static loadConfig<T>(searchConfigPaths: string[]) {
    for (const configPath of searchConfigPaths) {
      if (!existsSync(configPath)) {
        this.log.warn('Config file not found! ' + configPath);
        continue;
      }
      this.log.debug('Load config: ' + configPath);
      // Transpile typescript config file
      if (configPath.endsWith('.ts')) {
        const tSource = readFileSync(configPath, 'utf8');
        const compilerOptions: CompilerOptions = {
          module: ModuleKind.CommonJS,
        };
        const context = {
          exports: {},
          require,
          __dirname,
        };
        const jSource = transpileModule(tSource, { compilerOptions })
          .outputText;
        const script = new Script(jSource);
        script.runInNewContext(context);
        return context.exports as T;
      }
      // Parse yaml config file
      else if (configPath.endsWith('.yaml')) {
        const result: T = YAML.parse(readFileSync(configPath, 'utf8'));
        return result;
      } else {
        throw new Error('Config file extension not supported! ' + configPath);
      }
    }
    throw new Error(
      'No config file found! Searched for config files: \n' +
      JSON.stringify(searchConfigPaths, null, 2),
    );
  }
}
