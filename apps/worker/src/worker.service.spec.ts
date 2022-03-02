import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { mock, MockProxy } from 'jest-mock-extended';
import { WorkerService } from './worker.service';

describe('WorkerService', () => {
  let dataStreamClient: MockProxy<ClientProxy>;
  let httpService: MockProxy<HttpService>;
  let workerService: WorkerService;

  beforeEach(async () => {
    dataStreamClient = mock<ClientProxy>();
    httpService = mock<HttpService>();
    workerService = new WorkerService(dataStreamClient, httpService);

    const mockedIntervalHandler = jest.spyOn(workerService, 'intervalHandler');
    mockedIntervalHandler.mockResolvedValue();
    // ↑ #intervalHandler returns void so we resolve to nothing
  });

  afterEach(() => {
    workerService.onModuleDestroy();
  });

  it('should initialize in a stopped status', () => {
    expect(workerService.getStatus()).toEqual({ state: 'stopped' });
  });

  it('should be running after fetching is started', () => {
    workerService.startFetching(1000);

    const result = workerService.getStatus();
    expect(result).toEqual({
      state: 'running',
      interval: 1000,
    });
  });

  it('should be stopped after fetching is started and stopped', () => {
    workerService.startFetching(1000);
    workerService.stopFetching();

    const result = workerService.getStatus();
    expect(result).toEqual({
      state: 'stopped',
    });
  });

  it('should be stopped if stopped when already stopped (😅)', () => {
    workerService.stopFetching();

    const result = workerService.getStatus();
    expect(result).toEqual({
      state: 'stopped',
    });
  });
});
