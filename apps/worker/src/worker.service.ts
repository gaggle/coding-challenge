import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';

@Injectable()
export class WorkerService {
  private workerState:
    | {
        intervalMs: number;
        intervalTimer: NodeJS.Timer;
      }
    | { intervalTimer: null } = { intervalTimer: null };

  constructor(
    @Inject('DATA_STREAMS_SERVICE')
    private readonly dataStreamsClient: ClientProxy,
    private readonly httpService: HttpService,
  ) {}

  getStatus():
    | {
        interval?: never;
        state: 'stopped';
      }
    | {
        interval: number;
        state: 'running';
      } {
    return this.workerState.intervalTimer
      ? {
          state: 'running',
          interval: this.workerState.intervalMs,
        }
      : { state: 'stopped' };
  }

  async startFetching(frequencyMs: number): Promise<void> {
    if (this.workerState.intervalTimer) {
      clearInterval(this.workerState.intervalTimer);
    }
    this.workerState = {
      intervalMs: frequencyMs,
      intervalTimer: setInterval(async () => {
        // This callback is a simplistic approach to getting data fetched on an interval. Simplistic because
        // setInterval pushes all this into a callback without error-handling.
        // We could model this as an event instead (we already have access to the rxjs dependency)
        // to put this logic back into a more normal control flow.
        await this.intervalHandler();
      }, frequencyMs),
    };
    await this.intervalHandler();
    // ↑ The interval is set up to trigger the interval handler, but we also want to trigger the handler immediately
    // so there's an immediate effect for starting the fetch.
  }

  stopFetching(): void {
    if (this.workerState.intervalTimer) {
      clearInterval(this.workerState.intervalTimer);
      this.workerState = { intervalTimer: null };
    }
  }

  async intervalHandler(): Promise<void> {
    console.debug('WorkerService#intervalInvocationHandler');

    const locationSearchResponse = await lastValueFrom(
      this.httpService
        .get<
          Array<{
            /**
             * Name of the location
             *
             * e.g. `title: 'Copenhagen'`
             */
            title: string;
            /**
             * (City | Region / State / Province | Country | Continent)
             *
             * e.g. `location_type: 'City'`
             */
            location_type: string;
            /**
             * floats, comma separated
             *
             * e.g. `latt_long: '55.676311,12.569350'`
             */
            latt_long: string;
            /**
             * Where On Earth ID
             *
             * e.g. `woeid: 554890`
             */
            woeid: number;
            /**
             * Metres  Only returned on a lattlong search
             */
            distance?: number;
          }>
        >('https://www.metaweather.com/api/location/search/?query=copenhagen')
        .pipe(timeout(5000)),
    );
    const woeid = locationSearchResponse.data[0].woeid;

    console.debug(
      'WorkerService#intervalInvocationHandler got location search data',
      { data: locationSearchResponse.data },
    );

    const locationResponse = await lastValueFrom(
      this.httpService
        .get<{
          consolidated_weather: Array<{
            id: number;
            weather_state_name: string;
            weather_state_abbr: string;
            wind_direction_compass: string;
            created: string;
            applicable_date: string;
            min_temp: number;
            max_temp: number;
            the_temp: number;
            wind_speed: number;
            wind_direction: number;
            air_pressure: number;
            humidity: number;
            visibility: number;
            predictability: number;
          }>;
          time: string;
          sun_rise: string;
          sun_set: string;
          timezone_name: string;
          parent: {
            title: string;
            location_type: string;
            woeid: number;
            latt_long: string;
          };
          sources: Array<{
            title: string;
            slug: string;
            url: string;
            crawl_rate: number;
          }>;
          title: string;
          location_type: string;
          woeid: number;
          latt_long: string;
          timezone: string;
        }>(`https://www.metaweather.com/api/location/${woeid}`)
        .pipe(timeout(5000)),
    );
    const firstWeather = locationResponse.data.consolidated_weather[0];
    const firstSource = locationResponse.data.sources[0];

    const data = {
      measurement_created: firstWeather.created,
      request_time: locationResponse.data.time,
      source_title: firstSource.title,
      wind_direction: firstWeather.wind_direction_compass,
    };
    console.debug(
      'WorkerService#intervalInvocationHandler got weather data',
      data,
    );

    this.dataStreamsClient.emit('data', data);
  }

  onModuleDestroy() {
    this.stopFetching();
    // ↑ If we don't stop fetching on shutdown we risk leaking timers.
  }
}
