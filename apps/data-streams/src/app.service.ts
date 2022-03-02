import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { WeatherMeasurement } from './app.models';

@Injectable()
export class AppService {
  private data: Array<WeatherMeasurement> = [];

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

  getWeatherMeasurements(): Array<WeatherMeasurement> {
    return this.data;
  }

  addWeatherMeasurement(data: WeatherMeasurement) {
    this.data.push(data);
  }
}
