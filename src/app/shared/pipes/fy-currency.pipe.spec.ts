import { TestBed } from '@angular/core/testing';
import { FyCurrencyPipe } from './fy-currency.pipe';
import { FORMAT_PREFERENCES } from 'src/app/constants';
import { FormatPreferences } from 'src/app/core/models/format-preferences.model';

const defaultCurrencyFormat: FormatPreferences['currencyFormat'] = {
  placement: 'before',
  thousandSeparator: ',',
  decimalSeparator: '.',
};

function createFyCurrencyPipeWithFormat(currencyFormat: FormatPreferences['currencyFormat']): FyCurrencyPipe {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: FORMAT_PREFERENCES,
        useValue: {
          timeFormat: 'hh:mm a',
          currencyFormat,
        } as FormatPreferences,
      },
    ],
  });
  return TestBed.runInInjectionContext(() => new FyCurrencyPipe());
}

describe('FyCurrencyPipe', () => {
  let pipe: FyCurrencyPipe;

  beforeEach(() => {
    pipe = createFyCurrencyPipeWithFormat(defaultCurrencyFormat);
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

  it('should return empty string when value is null or NaN', () => {
    expect(pipe.transform(null, 'USD')).toEqual('');
    expect(pipe.transform('abc' as unknown as string, 'USD')).toEqual('');
  });

  it('should format zero without decimals when digitsInfo is not provided', () => {
    expect(pipe.transform(0, 'USD')).toEqual('$0');
  });

  it('should honor digitsInfo when provided, including for zero', () => {
    expect(pipe.transform(0, 'USD', undefined, '1.1-1')).toEqual('$0.0');
    expect(pipe.transform(1234.5, 'USD', undefined, '1.1-1')).toEqual('$1,234.5');
  });

  it('should hide currency token when display is empty string', () => {
    expect(pipe.transform(5, 'USD', '')).toEqual('5.00');
  });

  it('should use currency code when display is code', () => {
    expect(pipe.transform(5, 'USD', 'code')).toEqual('USD 5.00');
  });

  it('should return only the number when currencyCode is not provided', () => {
    expect(pipe.transform(1234.56)).toEqual('1,234.56');
  });

  it('should place currency after number when placement is set to after in format preferences', () => {
    const pipeWithAfterPlacement = createFyCurrencyPipeWithFormat({
      ...defaultCurrencyFormat,
      placement: 'after',
    });
    expect(pipeWithAfterPlacement.transform(5, 'USD')).toEqual('5.00$');
  });

  it('should respect custom thousand and decimal separators from format preferences', () => {
    const pipeWithCustomSeparators = createFyCurrencyPipeWithFormat({
      placement: 'before',
      thousandSeparator: '.',
      decimalSeparator: ',',
    });
    expect(pipeWithCustomSeparators.transform(1234.56, 'EUR')).toEqual('€1.234,56');
  });
});
