import type { ManagerApp } from '../types/app';
import type { ManagerOptions } from '../types/options';
import type { RedbirdOptions } from '../redbird/types/options';

export interface ManagerConfig {
  redbird: RedbirdOptions;
  apps: ManagerApp[];
  manager: ManagerOptions;
  environment: string;
}
