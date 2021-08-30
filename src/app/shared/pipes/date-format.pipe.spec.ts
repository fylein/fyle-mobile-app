import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  const pipe = new DateFormatPipe();
  const d = new Date('02-02-2020');
  const dateInString = '05/06/2021';

  it(`transforms "${d}" date to "Feb 02, 2020"`, () => {
    expect(pipe.transform(d)).toBe('Feb 02, 2020');
  });

  it(`transforms "${dateInString}" string to "May 06, 2021"`, () => {
    expect(pipe.transform(dateInString)).toBe('May 06, 2021');
  });
});
