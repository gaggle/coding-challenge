import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { WorkerService } from './worker.service';

@Controller()
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @MessagePattern('getStatus')
  handleGetStatus():
    | {
        interval?: never;
        state: 'stopped';
      }
    | {
        interval: number;
        state: 'running';
      } {
    console.debug('WorkerController#handleGetStatus');
    return this.workerService.getStatus();
  }

  @EventPattern('setInterval')
  handleSetInterval({ ms }: { ms: number | null }): void {
    console.debug('WorkerController#handleSetInterval', { ms });
    if (ms) {
      this.workerService.startFetching(ms);
    } else {
      this.workerService.stopFetching();
    }
  }
}
