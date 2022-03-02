import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { DataStreamsData, WorkerStatus } from './app.models';

@Resolver(() => WorkerStatus)
export class AppResolvers {
  constructor(private readonly appService: AppService) {}

  @Query(() => DataStreamsData)
  async getData(): Promise<DataStreamsData> {
    console.debug('AppResolvers#getData');
    return { data: this.appService.getWeatherMeasurements() };
  }

  @Query(() => WorkerStatus)
  async status(): Promise<WorkerStatus> {
    console.debug('AppResolvers#status');
    const workerStatus = await this.appService.getWorkerStatus();
    return { ...workerStatus };
  }

  @Mutation(() => WorkerStatus)
  async startFetchingData(
    @Args({ name: 'frequencyMs', type: () => Int })
    frequencyMs: number | null,
  ): Promise<WorkerStatus> {
    console.debug('AppResolvers#startFetchingData', { frequencyMs });
    await this.appService.setWorkerInterval(frequencyMs);
    const workerStatus = await this.appService.getWorkerStatus();
    return { ...workerStatus };
  }

  @Mutation(() => WorkerStatus)
  async stopFetchingData(): Promise<WorkerStatus> {
    console.debug('AppResolvers#stopFetchingData');
    await this.appService.setWorkerInterval(null);
    const workerStatus = await this.appService.getWorkerStatus();
    return { ...workerStatus };
  }
}
