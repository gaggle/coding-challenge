import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class WorkerService {
  private workerState:
    | {
        intervalMs: number;
        intervalTimer: NodeJS.Timer;
      }
    | { intervalTimer: null } = { intervalTimer: null };

  constructor(
    @Inject('DATA_STREAMS_SERVICE')
    private readonly dataStreamsClient: ClientProxy,
  ) {}

  getStatus():
    | {
        interval?: never;
        state: 'stopped';
      }
    | {
        interval: number;
        state: 'running';
      } {
    return this.workerState.intervalTimer
      ? {
          state: 'running',
          interval: this.workerState.intervalMs,
        }
      : { state: 'stopped' };
  }

  startFetching(frequencyMs: number): void {
    if (this.workerState.intervalTimer) {
      clearInterval(this.workerState.intervalTimer);
    }
    this.workerState = {
      intervalMs: frequencyMs,
      intervalTimer: setInterval(async () => {
        // This callback is a simplistic approach to getting data fetched on an interval. Simplistic because
        // setInterval pushes all this into a callback without error-handling.
        // We could model this as an event instead (we already have access to the rxjs dependency)
        // to put this logic back into a more normal control flow,
        // but that'd probably be overkill for this challenge at this point.
        await this.intervalInvocationHandler();
      }, frequencyMs),
    };
  }

  async intervalInvocationHandler(): Promise<void> {
    console.debug('WorkerService#intervalInvocationHandler');
    this.dataStreamsClient.emit('data', { foo: 'bar' });
  }

  stopFetching(): void {
    if (this.workerState.intervalTimer) {
      clearInterval(this.workerState.intervalTimer);
      this.workerState = { intervalTimer: null };
    }
  }

  onModuleDestroy() {
    this.stopFetching();
    // ↑ If we don't stop fetching on shutdown we risk leaking timers.
  }
}
