import { Controller, Get } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller()
export class AppController {
  constructor(private readonly manager: ManagerService) {}

  @Get()
  getHello(): string {
    return 'Hello from App Manger!';
  }
}
