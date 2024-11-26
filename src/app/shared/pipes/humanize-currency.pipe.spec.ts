import { HumanizeCurrencyPipe } from './humanize-currency.pipe';
import { FyCurrencyPipe } from './fy-currency.pipe';

describe('HumanizeCurrencyPipe', () => {
  const fyCurrencyPipeSpy: jasmine.SpyObj<FyCurrencyPipe> = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
  const humanizeCurrencyPipe = new HumanizeCurrencyPipe(fyCurrencyPipeSpy);

  it('should be created', () => {
    expect(humanizeCurrencyPipe).toBeTruthy();
  });

  describe('transform():', () => {
    it('should humanize currency | without symbol', () => {
      const expectedAmount = '651.55K';
      fyCurrencyPipeSpy.transform.and.returnValue('651.55');
      expect(humanizeCurrencyPipe.transform(651547.297922, 'USD', true)).toEqual(expectedAmount);
    });

    it('should humanize currency | with symbol', () => {
      const expectedAmount = '$651.55K';
      fyCurrencyPipeSpy.transform.and.returnValue('$651.55');
      expect(humanizeCurrencyPipe.transform(651547.297922, 'USD', false)).toEqual(expectedAmount);
    });

    it('should handle negative amounts when humanized', () => {
      const expectedAmount = '-$122.57K';
      fyCurrencyPipeSpy.transform.and.returnValue('$122.57');
      expect(humanizeCurrencyPipe.transform(-122570, 'USD')).toEqual(expectedAmount);
    });

    it('should return humanized amount with fraction specified', () => {
      const expectedAmount = '$651.547K';
      fyCurrencyPipeSpy.transform.and.returnValue('$651.547');
      expect(humanizeCurrencyPipe.transform(651547.297922, 'USD', false, 3)).toEqual(expectedAmount);
    });

    it('should return exact amount when humanize is false | without symbol', () => {
      const expectedAmount = '651547.30';
      fyCurrencyPipeSpy.transform.and.returnValue('651547.30');
      expect(humanizeCurrencyPipe.transform(651547.297922, 'USD', true, 2, false)).toEqual(expectedAmount);
    });

    it('should return exact amount when humanize is false | with symbol', () => {
      const expectedAmount = '$651547.30';
      fyCurrencyPipeSpy.transform.and.returnValue('$651547.30');
      expect(humanizeCurrencyPipe.transform(651547.297922, 'USD', false, 2, false)).toEqual(expectedAmount);
    });

    it('should handle negative amounts when humanize is false', () => {
      const expectedAmount = '-$122.57';
      fyCurrencyPipeSpy.transform.and.returnValue('$122.57');
      expect(humanizeCurrencyPipe.transform(-122.57, 'USD', false, undefined, false)).toEqual(expectedAmount);
    });

    it('should return "$0" for zero amount', () => {
      const expectedAmount = '$0';
      fyCurrencyPipeSpy.transform.and.returnValue('$0');
      expect(humanizeCurrencyPipe.transform(0, 'USD')).toEqual(expectedAmount);
    });

    it('should return exact zero amount when humanize is false', () => {
      const expectedAmount = '$0.00';
      fyCurrencyPipeSpy.transform.and.returnValue('$0.00');
      expect(humanizeCurrencyPipe.transform(0, 'USD', false, 2, false)).toEqual(expectedAmount);
    });
  });
});
