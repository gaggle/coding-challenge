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

  beforeEach(async () => {
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

  afterEach(async () => {
    mockReset(appService);
    await app.close();
  });

  it('should respond with Worker status', () => {
    appService.getWorkerStatus.mockResolvedValue({ state: 'stopped' });

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: 'query { status { interval, state } }',
      })
      .expect({
        data: {
          status: {
            interval: null,
            state: 'stopped',
          },
        },
      })
      .expect(() => expect(appService.getWorkerStatus).toHaveBeenCalledWith())
      .expect(200);
  });

  it('should set Worker to fetch data on an interval', () => {
    appService.getWorkerStatus.mockResolvedValue({
      interval: 1000,
      state: 'running',
    });

    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: 'mutation { startFetchingData(frequencyMs: 1000) { state } }',
      })
      .expect({
        data: {
          startFetchingData: {
            state: 'running',
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
    appService.getData.mockReturnValue([{ foo: 'bar' }]);
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: 'query { getData { data { foo } } }',
      })
      .expect({
        data: {
          getData: {
            data: [{ foo: 'bar' }],
          },
        },
      })
      .expect(() => expect(appService.getData).toHaveBeenCalledWith())
      .expect(200);
  });
});
