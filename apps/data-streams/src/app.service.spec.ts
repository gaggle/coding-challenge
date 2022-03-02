import { ClientProxy } from '@nestjs/microservices';
import { mock, MockProxy } from 'jest-mock-extended';
import { of } from 'rxjs';
import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;
  let workerClient: MockProxy<ClientProxy>;

  beforeEach(async () => {
    workerClient = mock<ClientProxy>();
    workerClient.send.mockReturnValue(of('foo'));
    appService = new AppService(workerClient);
  });

  describe('#getWorkerStatus', () => {
    it('should call workerClient with getStatus command', () => {
      appService.getWorkerStatus();
      expect(workerClient.send).toHaveBeenCalledWith('getStatus', '');
    });
  });
});
