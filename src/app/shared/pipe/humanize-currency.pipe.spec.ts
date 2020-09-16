import { HumanizeCurrencyPipe } from './humanize-currency.pipe';

describe('HumanizeCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new HumanizeCurrencyPipe();
    expect(pipe).toBeTruthy();
  });
});
