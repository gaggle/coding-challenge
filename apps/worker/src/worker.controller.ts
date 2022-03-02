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
  async handleSetInterval({ ms }: { ms: number | null }): Promise<void> {
    console.debug('WorkerController#handleSetInterval', { ms });
    if (ms) {
      await this.workerService.startFetching(ms);
    } else {
      this.workerService.stopFetching();
    }
  }
}
