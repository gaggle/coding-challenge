import { ClientProxy } from '@nestjs/microservices';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';
import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;
  let workerClient: MockProxy<ClientProxy>;

  beforeEach(async () => {
    workerClient = mock<ClientProxy>();
    appService = new AppService(workerClient);
  });

  describe('#getWorkerStatus', () => {
    it('should call workerClient with getStatus command', () => {
      workerClient.send.mockReturnValue(of('some-value'));

      appService.getWorkerStatus();
      expect(workerClient.send).toHaveBeenCalledWith('getStatus', '');
    });
  });

  describe('#setWorkerInterval', () => {
    it('should call workerClient with getStatus command', () => {
      workerClient.emit.mockReturnValue(of(undefined));

      appService.setWorkerInterval(1000);
      expect(workerClient.emit).toHaveBeenCalledWith('setInterval', {
        ms: 1000,
      });
    });
  });

  describe('#getData', () => {
    it('should call workerClient with getStatus command', () => {
      expect(appService.getWeatherMeasurements()).toEqual([]);
    });
  });
});
