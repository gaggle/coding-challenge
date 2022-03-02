import { Test, TestingModule } from '@nestjs/testing';
import { mock, MockProxy } from 'jest-mock-extended';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';

describe('WorkerController', () => {
  let workerController: WorkerController;
  let workerService: MockProxy<WorkerService>;

  beforeEach(async () => {
    workerService = mock<WorkerService>();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [WorkerController],
    })
      .useMocker((token) => {
        if (token === WorkerService) {
          return workerService;
        }
      })
      .compile();

    workerController = app.get(WorkerController);
  });

  describe('#handleGetStatus', () => {
    it('should return a status object', () => {
      workerController.handleGetStatus();
      expect(workerService.getStatus).toHaveBeenCalledWith();
    });
  });

  describe('#handleSetInterval', () => {
    it('should start fetching with the passed-in interval', async () => {
      await workerController.handleSetInterval({ ms: 1000 });
      expect(workerService.startFetching).toHaveBeenCalledWith(1000);
    });

    it('should stop fetching if given an intervall of null', async () => {
      await workerController.handleSetInterval({ ms: null });
      expect(workerService.stopFetching).toHaveBeenCalledWith();
    });
  });
});
