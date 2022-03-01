import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('data')
  handleData(data: { foo: 'bar' }) {
    console.debug('AppController#handleData', { data });
    this.appService.addData(data);
  }
}
