import { FyCurrencyPipe } from './fy-currency.pipe';

describe('FyCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new FyCurrencyPipe('en');
    expect(pipe).toBeTruthy();
  });
});
