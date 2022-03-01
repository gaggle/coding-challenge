import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: MockProxy<AppService>;

  beforeEach(async () => {
    appService = mock<AppService>();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    })
      .useMocker((token) => {
        if (token === AppService) {
          return appService;
        }
      })
      .compile();

    appController = app.get(AppController);
  });

  describe('#handleData', () => {
    it('should add the data to appService', () => {
      appController.handleData({ foo: 'bar' });

      expect(appService.addData).toHaveBeenCalledWith({ foo: 'bar' });
    });
  });
});
