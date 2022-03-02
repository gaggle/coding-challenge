import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { DataStreamsData, WorkerStatus } from './app.models';

@Resolver(() => WorkerStatus)
export class AppResolvers {
  constructor(private readonly appService: AppService) {}

  @Query(() => DataStreamsData, { name: 'dataStreams' })
  async data(): Promise<DataStreamsData> {
    const data = await this.appService.getData();
    return { data };
  }

  @Query(() => WorkerStatus)
  async workerStatus(): Promise<WorkerStatus> {
    const workerStatus = await this.appService.getWorkerStatus();
    return { ...workerStatus };
  }

  @Mutation(() => WorkerStatus)
  async startFetchingData(
    @Args({ name: 'interval', type: () => Int, nullable: true })
    interval: number | null,
  ): Promise<WorkerStatus> {
    await this.appService.setWorkerInterval(interval);
    const workerStatus = await this.appService.getWorkerStatus();
    return { ...workerStatus };
  }
}
