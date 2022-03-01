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
  @Field(() => [DataElement])
  data: Array<DataElement>;
}

@ObjectType()
class DataElement {
  @Field()
  foo: 'bar';
}
