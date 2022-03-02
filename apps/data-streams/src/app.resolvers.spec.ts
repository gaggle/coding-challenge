import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { AppResolvers } from './app.resolvers';
import { AppService } from './app.service';

describe('AppResolvers', () => {
  let app: INestApplication;
  let appService: MockProxy<AppService>;

  beforeAll(async () => {
    appService = mock<AppService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
          sortSchema: true,
          // ↑ sort types lexicographically (instead of the order they're included in)
        }),
      ],
      providers: [AppResolvers],
    })
      .useMocker((token) => {
        if (token === AppService) {
          return appService;
        }
      })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  afterEach(() => mockReset(appService));

  it('should respond with Worker status', () => {
    appService.getWorkerStatus.mockResolvedValue({ status: 'paused' });

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: 'query { workerStatus { interval, nextCheck, status } }',
      })
      .expect({
        data: {
          workerStatus: {
            interval: null,
            nextCheck: null,
            status: 'paused',
          },
        },
      })
      .expect(() => expect(appService.getWorkerStatus).toHaveBeenCalledWith())
      .expect(200);
  });

  it('should set Worker to fetch data on an interval', () => {
    appService.getWorkerStatus.mockResolvedValue({
      interval: 1000,
      nextCheck: Date.now() + 1000,
      status: 'ok',
    });

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: 'mutation { startFetchingData(interval: 1000) { status } }',
      })
      .expect({
        data: {
          startFetchingData: {
            status: 'ok',
          },
        },
      })
      .expect(() => {
        expect(appService.setWorkerInterval).toHaveBeenCalledWith(1000);
        expect(appService.getWorkerStatus).toHaveBeenCalledWith();
      })
      .expect(200);
  });

  it('should fetch data stored on DataStreams', () => {
    appService.getData.mockResolvedValue([1, 2]);

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: 'query { dataStreams { data } }',
      })
      .expect({
        data: {
          dataStreams: {
            data: [1, 2],
          },
        },
      })
      .expect(() => expect(appService.getData).toHaveBeenCalledWith())
      .expect(200);
  });
});
