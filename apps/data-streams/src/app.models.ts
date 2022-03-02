import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkerStatus {
  @Field(() => Int, { nullable: true })
  interval?: number;

  @Field()
  state: 'running' | 'stopped';
}

@ObjectType()
export class DataStreamsData {
  @Field(() => [WeatherMeasurement])
  data: Array<WeatherMeasurement>;
}

@ObjectType()
export class WeatherMeasurement {
  @Field()
  measurement_created: string;

  @Field()
  request_time: string;

  @Field()
  source_title: string;

  @Field()
  wind_direction: string;
}
