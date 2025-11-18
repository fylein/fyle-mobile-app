import { TestBed } from '@angular/core/testing';
import { DateWithTimezonePipe } from './date-with-timezone.pipe';
import { TIMEZONE } from 'src/app/constants';
import { BehaviorSubject } from 'rxjs';
import { getCommonTestProviders } from 'src/app/core/testing/common-test-providers.utils';

describe('DateWithTimezonePipe', () => {
  let pipe: DateWithTimezonePipe;
  const mockTimezone$ = new BehaviorSubject('HST');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateWithTimezonePipe, { provide: TIMEZONE, useValue: mockTimezone$ }, ...getCommonTestProviders()],
    });

    pipe = TestBed.inject(DateWithTimezonePipe);
  });

  const d = new Date('02-02-2025');
  const dateInString = '05/06/2024';

  it(`transforms "${d}" date to "Feb 02, 2025"`, () => {
    expect(pipe.transform(d)).toBe('Feb 01, 2025');
  });

  it(`transforms "${dateInString}" string to "May 06, 2024"`, () => {
    expect(pipe.transform(dateInString)).toBe('May 05, 2024');
  });
});
