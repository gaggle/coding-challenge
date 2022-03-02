import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { WorkerService } from './worker.service';

@Controller()
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @MessagePattern('getStatus')
  handleGetStatus():
    | {
        interval?: never;
        nextCheck?: never;
        status: 'paused';
      }
    | {
        interval: number;
        nextCheck: number;
        status: 'ok';
      } {
    this.workerService.getHello();
    return { status: 'paused' };
  }

  @MessagePattern('setInterval')
  handleSetInterval(): void {
    this.workerService.getHello();
  }
}
