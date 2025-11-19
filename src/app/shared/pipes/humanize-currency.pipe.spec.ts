import { TestBed } from '@angular/core/testing';
import { HumanizeCurrencyPipe } from './humanize-currency.pipe';
import { FyCurrencyPipe } from './fy-currency.pipe';
import { TranslocoService } from '@jsverse/transloco';
import { FORMAT_PREFERENCES } from 'src/app/constants';
import { FormatPreferences } from 'src/app/core/models/format-preferences.model';

const HUMANIZE_TRANSLATIONS: { [key: string]: string } = {
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

const defaultHumanizeCurrencyFormat: FormatPreferences['currencyFormat'] = {
  placement: 'before',
  thousandSeparator: ',',
  decimalSeparator: '.',
};

function setupTranslateSpy(spy: jasmine.SpyObj<TranslocoService>): void {
  spy.translate.and.callFake((key: any) => HUMANIZE_TRANSLATIONS[key] || key);
}

function createHumanizeCurrencyPipeWithFormat(
  currencyFormat: FormatPreferences['currencyFormat'],
  fySpy: jasmine.SpyObj<FyCurrencyPipe>,
  translocoSpy: jasmine.SpyObj<TranslocoService>,
): HumanizeCurrencyPipe {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: FyCurrencyPipe, useValue: fySpy },
      { provide: TranslocoService, useValue: translocoSpy },
      {
        provide: FORMAT_PREFERENCES,
        useValue: {
          timeFormat: 'hh:mm a',
          currencyFormat,
        } as FormatPreferences,
      },
    ],
  });

  return TestBed.runInInjectionContext(() => new HumanizeCurrencyPipe());
}

describe('HumanizeCurrencyPipe', () => {
  let fyCurrencyPipeSpy: jasmine.SpyObj<FyCurrencyPipe>;
  let translocoServiceSpy: jasmine.SpyObj<TranslocoService>;
  let humanizeCurrencyPipe: HumanizeCurrencyPipe;

  beforeEach(() => {
    fyCurrencyPipeSpy = jasmine.createSpyObj('FyCurrencyPipe', ['transform']);
    translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    setupTranslateSpy(translocoServiceSpy);
    humanizeCurrencyPipe = createHumanizeCurrencyPipeWithFormat(
      defaultHumanizeCurrencyFormat,
      fyCurrencyPipeSpy,
      translocoServiceSpy,
    );
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
      // When display is '', fyCurrencyPipe should return just the number without symbol
      fyCurrencyPipeSpy.transform.and.callFake((value, currencyCode, display) => {
        if (display === '') {
          return '651.55';
        }
        return '$651.55';
      });
      expect(humanizeCurrencyPipe.transform(651547.297922, 'USD', false)).toEqual(expectedAmount);
    });

    it('should humanize negtive amount', () => {
      const expectedAmount = '-$122.57';
      // When display is '', fyCurrencyPipe should return just the number without symbol
      fyCurrencyPipeSpy.transform.and.callFake((value, currencyCode, display) => {
        if (display === '') {
          return '122.57';
        }
        return '$122.57';
      });
      expect(humanizeCurrencyPipe.transform(-122.57, 'USD')).toEqual(expectedAmount);
    });

    it('should return amount when fraction specified', () => {
      const expectedAmount = '$651.547K';
      // When display is '', fyCurrencyPipe should return just the number without symbol
      fyCurrencyPipeSpy.transform.and.callFake((value, currencyCode, display) => {
        if (display === '') {
          return '651.547';
        }
        return '$651.547';
      });
      expect(humanizeCurrencyPipe.transform(651547.297922, 'USD', false, 3)).toEqual(expectedAmount);
    });
  });

  it('should return amount when fraction specified', () => {
    fyCurrencyPipeSpy.transform.and.returnValue('$0');
    expect(humanizeCurrencyPipe.transform(0, 'USD')).toEqual('$0');
  });

  it('should place currency after number when placement is set to after in format preferences', () => {
    const localFyCurrencyPipeSpy = jasmine.createSpyObj<FyCurrencyPipe>('FyCurrencyPipe', ['transform']);
    const localTranslocoServiceSpy = jasmine.createSpyObj<TranslocoService>('TranslocoService', ['translate']);

    localFyCurrencyPipeSpy.transform.and.returnValue('651.55');
    setupTranslateSpy(localTranslocoServiceSpy);

    const pipeWithAfterPlacement = createHumanizeCurrencyPipeWithFormat(
      { ...defaultHumanizeCurrencyFormat, placement: 'after' },
      localFyCurrencyPipeSpy,
      localTranslocoServiceSpy,
    );
    expect(pipeWithAfterPlacement.transform(651547.297922, 'USD', false)).toEqual('651.55K$');
  });

  it('should fall back to currency code when Intl fails to resolve a symbol', () => {
    fyCurrencyPipeSpy.transform.and.returnValue('1.5');

    const result = humanizeCurrencyPipe.transform(1500, 'INV', false);
    expect(result).toEqual('INV 1.5K');
  });

  it('should handle very large values using the highest available suffix', () => {
    fyCurrencyPipeSpy.transform.and.returnValue('1.00');

    const result = humanizeCurrencyPipe.transform(1e35, 'USD', false);
    expect(result).toEqual('$1.00n');
  });
});
