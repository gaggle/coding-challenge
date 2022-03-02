import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';

@Injectable()
export class AppService {
  constructor(
    @Inject('WORKER_SERVICE') private readonly workerClient: ClientProxy,
  ) {}

  getHello(): Promise<string> {
    return this.workerClient.send('hello', '').pipe(timeout(5000)).toPromise();
  }
}
