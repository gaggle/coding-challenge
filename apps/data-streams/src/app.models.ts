import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkerStatus {
  @Field(() => Int, { nullable: true })
  interval?: number;

  @Field(() => Int, { nullable: true })
  nextCheck?: number;

  @Field()
  status: 'paused' | 'ok';
}

@ObjectType()
export class DataStreamsData {
  @Field(() => [Int])
  data: Array<number>;
}
