import { TestBed } from '@angular/core/testing';
import { DateWithTimezonePipe } from './date-with-timezone.pipe';
import { FORMAT_PREFERENCES, TIMEZONE } from 'src/app/constants';
import { BehaviorSubject } from 'rxjs';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';

describe('DateWithTimezonePipe', () => {
  let pipe: DateWithTimezonePipe;
  const mockTimezone$ = new BehaviorSubject('HST');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DateWithTimezonePipe,
        { provide: TIMEZONE, useValue: mockTimezone$ },
        {
          provide: DATE_PIPE_DEFAULT_OPTIONS,
          useValue: { dateFormat: 'MMM dd, yyyy' },
        },
        {
          provide: FORMAT_PREFERENCES,
          useValue: {
            timeFormat: 'hh:mm a',
            currencyFormat: {
              placement: 'before',
              thousandSeparator: ',',
              decimalSeparator: '.',
            },
          },
        },
      ],
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
