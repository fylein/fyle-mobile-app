import { getTestBed } from '@angular/core/testing';

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import * as moment from 'moment';

import { TripDatesService } from '../../src/app/core/services/trip-dates.service';

describe('Unit test', () => {
  let service: TripDatesService;

  beforeEach(() => {
    getTestBed().resetTestEnvironment();

    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

    getTestBed().configureTestingModule({
      providers: [{ provide: TripDatesService, useClass: TripDatesService }],
    });

    service = getTestBed().inject(TripDatesService);
  });

  it('should be created', () => {
    const dateToBeChecked = new Date();
    const dateFixedObject = service.fixDates({ created_at: dateToBeChecked });

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(moment(dateFixedObject.created_at).day).to.equal(moment(service.getUTCDate(dateToBeChecked)).day);
  });
});
