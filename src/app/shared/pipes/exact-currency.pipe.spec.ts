import { CurrencyPipeConfig } from 'src/app/core/models/currency-pipe-config.model';
import { ExactCurrencyPipe } from './exact-currency.pipe';
import { FyCurrencyPipe } from './fy-currency.pipe';

fdescribe('ExactCurrencyPipe', () => {
  let fyCurrencyPipeSpy: jasmine.SpyObj<FyCurrencyPipe>;
  let exactCurrencyPipe: ExactCurrencyPipe;

  beforeEach(() => {
    // Create a spy object for FyCurrencyPipe
    fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
    exactCurrencyPipe = new ExactCurrencyPipe(fyCurrencyPipeSpy);
  });

  it('should create the pipe', () => {
    expect(exactCurrencyPipe).toBeTruthy();
  });

  describe('transform()', () => {
    it('should format a positive value correctly with default options', () => {
      fyCurrencyPipeSpy.transform.and.returnValue('$100.00');
      const config: CurrencyPipeConfig = { value: 100, currencyCode: 'USD' };
      const result = exactCurrencyPipe.transform(config);
      expect(fyCurrencyPipeSpy.transform).toHaveBeenCalledWith(100, 'USD', 'symbol', undefined);
      expect(result).toEqual('$100.00');
    });

    it('should format a negative value correctly', () => {
      fyCurrencyPipeSpy.transform.and.returnValue('$100.00');
      const config: CurrencyPipeConfig = { value: -100, currencyCode: 'USD' };
      const result = exactCurrencyPipe.transform(config);
      expect(fyCurrencyPipeSpy.transform).toHaveBeenCalledWith(100, 'USD', 'symbol', undefined);
      expect(result).toEqual('-$100.00');
    });

    it('should format a value without the currency symbol when skipSymbol is true', () => {
      fyCurrencyPipeSpy.transform.and.returnValue('100.00');
      const config: CurrencyPipeConfig = { value: 100, currencyCode: 'USD', skipSymbol: true };
      const result = exactCurrencyPipe.transform(config);
      expect(fyCurrencyPipeSpy.transform).toHaveBeenCalledWith(100, 'USD', '', undefined);
      expect(result).toEqual('100.00');
    });

    it('should format a value with custom fraction digits', () => {
      fyCurrencyPipeSpy.transform.and.returnValue('$100.1234');
      const config: CurrencyPipeConfig = { value: 100.1234, currencyCode: 'USD', fraction: 4 };
      const result = exactCurrencyPipe.transform(config);
      expect(fyCurrencyPipeSpy.transform).toHaveBeenCalledWith(100.1234, 'USD', 'symbol', '1.4-4');
      expect(result).toEqual('$100.1234');
    });

    it('should handle a value of 0 correctly', () => {
      fyCurrencyPipeSpy.transform.and.returnValue('$0.00');
      const config: CurrencyPipeConfig = { value: 0, currencyCode: 'USD' };
      const result = exactCurrencyPipe.transform(config);
      expect(fyCurrencyPipeSpy.transform).toHaveBeenCalledWith(0, 'USD', 'symbol', undefined);
      expect(result).toEqual('$0.00');
    });

    it('should handle missing optional parameters by applying defaults', () => {
      fyCurrencyPipeSpy.transform.and.returnValue('$50.00');
      const config: CurrencyPipeConfig = { value: 50, currencyCode: 'USD' };
      const result = exactCurrencyPipe.transform(config);
      expect(fyCurrencyPipeSpy.transform).toHaveBeenCalledWith(50, 'USD', 'symbol', undefined);
      expect(result).toEqual('$50.00');
    });

    it('should format a large value correctly', () => {
      fyCurrencyPipeSpy.transform.and.returnValue('$1,000,000.00');
      const config: CurrencyPipeConfig = { value: 1000000, currencyCode: 'USD' };
      const result = exactCurrencyPipe.transform(config);
      expect(fyCurrencyPipeSpy.transform).toHaveBeenCalledWith(1000000, 'USD', 'symbol', undefined);
      expect(result).toEqual('$1,000,000.00');
    });

    it('should format a negative value without the currency symbol when skipSymbol is true', () => {
      fyCurrencyPipeSpy.transform.and.returnValue('100.00');
      const config: CurrencyPipeConfig = { value: -100, currencyCode: 'USD', skipSymbol: true };
      const result = exactCurrencyPipe.transform(config);
      expect(fyCurrencyPipeSpy.transform).toHaveBeenCalledWith(100, 'USD', '', undefined);
      expect(result).toEqual('-100.00');
    });
  });
});
