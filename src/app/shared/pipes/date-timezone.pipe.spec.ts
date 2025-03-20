import { DateTimezonePipe } from './date-timezone.pipe';

describe('DateTimezonePipe', () => {
  const pipe = new DateTimezonePipe();
  const d = new Date('02-02-2025');
  const dateInString = '05/06/2025';
  const userTimezone = 'America/New_York';

  it(`transforms "${d}" date in "${userTimezone}"`, () => {
    expect(pipe.transform(d.toISOString(), userTimezone)).toBe('Feb 01, 2025');
  });

  it(`transforms "${dateInString}" string in "${userTimezone}" string`, () => {
    expect(pipe.transform(dateInString, userTimezone)).toBe('May 05, 2025');
  });
});
