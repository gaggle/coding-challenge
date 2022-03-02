import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(
    @Inject('WORKER_SERVICE') private readonly workerClient: ClientProxy,
  ) {}

  async getWorkerStatus(): Promise<
    | {
        interval?: never;
        nextCheck?: never;
        status: 'paused';
      }
    | {
        interval: number;
        nextCheck: number;
        status: 'ok';
      }
  > {
    return await lastValueFrom(
      this.workerClient.send('getStatus', '').pipe(timeout(5000)),
    );
  }

  setWorkerInterval(interval: number): void {
    this.workerClient.emit('setInterval', { interval }).pipe(timeout(5000));
  }

  async getData(): Promise<Array<number>> {
    return [1, 2];
    // TODO: Just some quick fake nonsense data
  }
}
