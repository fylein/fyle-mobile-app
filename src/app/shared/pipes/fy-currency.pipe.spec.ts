import { TestBed } from '@angular/core/testing';
import { CurrencyPipe } from '@angular/common';
import { FyCurrencyPipe } from './fy-currency.pipe';

describe('FyCurrencyPipe', () => {
  let currencyPipe: CurrencyPipe;
  let pipe: FyCurrencyPipe;

  beforeEach(() => {
    currencyPipe = new CurrencyPipe('en');

    TestBed.configureTestingModule({
      providers: [{ provide: CurrencyPipe, useValue: currencyPipe }],
    });

    pipe = TestBed.runInInjectionContext(() => new FyCurrencyPipe());
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transform 5 and USD to $5.00', () => {
    expect(pipe.transform(5, 'USD')).toEqual('$5.00');
  });

  it('transform 5 and OMR to OMR 5.000', () => {
    expect(pipe.transform(5, 'OMR')).toEqual('OMR 5.000');
  });

  it('transform -5 and OMR to -OMR 5.000', () => {
    expect(pipe.transform(-5, 'OMR')).toEqual('-OMR 5.000');
  });
});
