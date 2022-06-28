import { CurrencyPipe } from '@angular/common';
import { FyCurrencyPipe } from './fy-currency.pipe';

describe('FyCurrencyPipe', () => {
  it('create an instance', () => {
    const currencyPipe = new CurrencyPipe('en');
    const pipe = new FyCurrencyPipe(currencyPipe);
    expect(pipe).toBeTruthy();
  });
});
