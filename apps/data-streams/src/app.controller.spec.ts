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
      appController.handleData({
        measurement_created: '2022-03-03T11:02:43.739373Z',
        request_time: '2022-03-03T14:19:22.074538+01:00',
        source_title: 'BBC',
        wind_direction: 'NNE',
      });

      expect(appService.addWeatherMeasurement).toHaveBeenCalledWith({
        measurement_created: '2022-03-03T11:02:43.739373Z',
        request_time: '2022-03-03T14:19:22.074538+01:00',
        source_title: 'BBC',
        wind_direction: 'NNE',
      });
    });
  });
});
