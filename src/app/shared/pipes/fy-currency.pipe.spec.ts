import { CurrencyPipe } from '@angular/common';
import { FyCurrencyPipe } from './fy-currency.pipe';

describe('FyCurrencyPipe', () => {
  const currencyPipe = new CurrencyPipe('en');
  const pipe = new FyCurrencyPipe(currencyPipe);

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transforms 5 and USD to $5.00', () => {
    expect(pipe.transform(5, 'USD')).toEqual('$5.00');
  });

  it('transforms 5 and OMR to OMR 5.000', () => {
    expect(pipe.transform(5, 'OMR')).toEqual('OMR 5.000');
  });
});
