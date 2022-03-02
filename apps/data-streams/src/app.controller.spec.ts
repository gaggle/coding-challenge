import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: INestApplication;
  let appService: MockProxy<AppService>;

  beforeAll(async () => {
    appService = mock<AppService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
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

  beforeEach(() => appService.getHello.mockResolvedValue('foo'));

  afterEach(() => mockReset(appService));

  describe('GET /', () => {
    it('should call service', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect(() => expect(appService.getHello).toHaveBeenCalledWith());
    });

    it('should respond with a string', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('foo');
    });
  });
});
