import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable()
export class AppService {
  private data: Array<{ foo: 'bar' }> = [];

  constructor(
    @Inject('WORKER_SERVICE') private readonly workerClient: ClientProxy,
  ) {}

  async getWorkerStatus(): Promise<
    | {
        interval?: never;
        state: 'stopped';
      }
    | {
        interval: number;
        state: 'running';
      }
  > {
    return await lastValueFrom(
      this.workerClient.send('getStatus', '').pipe(timeout(5000)),
    );
  }

  setWorkerInterval(ms: number | null): void {
    this.workerClient.emit('setInterval', { ms }).pipe(timeout(5000));
  }

  getData(): Array<{ foo: 'bar' }> {
    return this.data;
  }

  addData(data: { foo: 'bar' }) {
    this.data.push(data);
  }
}
