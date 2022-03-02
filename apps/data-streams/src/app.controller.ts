import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { WeatherMeasurement } from './app.models';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('data')
  handleData(data: WeatherMeasurement) {
    console.debug('AppController#handleData', { data });
    this.appService.addWeatherMeasurement(data);
  }
}
