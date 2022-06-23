import { CurrencyPipe } from '@angular/common';
import { FyCurrencyPipe } from './fy-currency.pipe';

describe('FyCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new FyCurrencyPipe(new CurrencyPipe('en'));
    expect(pipe).toBeTruthy();
  });
});
