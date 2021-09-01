import { HumanizeCurrencyPipe } from './humanize-currency.pipe';

fdescribe('Humanize Currency Pipe', () => {
  const pipe = new HumanizeCurrencyPipe();
  const smallNumber = 123;
  const numberWithKUnit = 1234;

  it('should keep small numbers as is', () => {
    expect(pipe.transform(smallNumber, 'USD',2)).toBe('$123.00');
  });

  it('should add K unit to number', () => {
    expect(pipe.transform(numberWithKUnit, 'USD', 2)).toBe('$1.23K');
  });
});
