import { HumanizeCurrencyPipe } from './humanize-currency.pipe';
import { FyCurrencyPipe } from './fy-currency.pipe';
import { TranslocoService } from '@jsverse/transloco';

describe('HumanizeCurrencyPipe', () => {
  const fyCurrencyPipeSpy: jasmine.SpyObj<FyCurrencyPipe> = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
  const translocoServiceSpy: jasmine.SpyObj<TranslocoService> = jasmine.createSpyObj('TranslocoService', ['translate']);
  const humanizeCurrencyPipe = new HumanizeCurrencyPipe(fyCurrencyPipeSpy, translocoServiceSpy);

  beforeEach(() => {
    translocoServiceSpy.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.humanizeCurrency.kiloSuffix': 'K',
        'pipes.humanizeCurrency.megaSuffix': 'M',
        'pipes.humanizeCurrency.gigaSuffix': 'B',
        'pipes.humanizeCurrency.teraSuffix': 't',
        'pipes.humanizeCurrency.quadrillionSuffix': 'q',
        'pipes.humanizeCurrency.quintillionSuffix': 'Q',
        'pipes.humanizeCurrency.sextillionSuffix': 's',
        'pipes.humanizeCurrency.septillionSuffix': 'S',
        'pipes.humanizeCurrency.octillionSuffix': 'o',
        'pipes.humanizeCurrency.nonillionSuffix': 'n',
      };
      return translations[key] || key;
    });
  });

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

    it('should humanize negtive amount', () => {
      const expectedAmount = '-$122.57';
      fyCurrencyPipeSpy.transform.and.returnValue('$122.57');
      expect(humanizeCurrencyPipe.transform(-122.57, 'USD')).toEqual(expectedAmount);
    });

    it('should return amount when fraction specified', () => {
      const expectedAmount = '$651.547K';
      fyCurrencyPipeSpy.transform.and.returnValue('$651.547');
      expect(humanizeCurrencyPipe.transform(651547.297922, 'USD', false, 3)).toEqual(expectedAmount);
    });
  });

  it('should return amount when fraction specified', () => {
    fyCurrencyPipeSpy.transform.and.returnValue('$0');
    expect(humanizeCurrencyPipe.transform(0, 'USD')).toEqual('$0');
  });
});
