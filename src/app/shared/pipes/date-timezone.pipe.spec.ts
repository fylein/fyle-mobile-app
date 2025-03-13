import { DateTimezonePipe } from './date-timezone.pipe';

describe('DateTimezonePipe', () => {
  const pipe = new DateTimezonePipe();
  const d = new Date('02-02-2025');
  const dateInString = '05/06/2025';

  it(`transforms "${d}" date to "Feb 02, 2025"`, () => {
    expect(pipe.transform(d.toISOString(), 'America/New_York')).toBe('Feb 02, 2025');
  });

  it(`transforms "${dateInString}" string to "May 06, 2025"`, () => {
    expect(pipe.transform(dateInString, 'America/New_York')).toBe('May 06, 2025');
  });
});
