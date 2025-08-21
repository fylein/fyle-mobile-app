import { TestBed } from '@angular/core/testing';
import { DateFormatPipe } from './date-format.pipe';
import { TranslocoService } from '@jsverse/transloco';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    TestBed.configureTestingModule({
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    });

    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    pipe = TestBed.runInInjectionContext(() => new DateFormatPipe());

    // Mock translate method to return expected strings
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.dateFormat.format': 'MMM DD, YYYY',
      };
      return translations[key] || key;
    });
  });

  const d = new Date('02-02-2020');
  const dateInString = '05/06/2021';

  it(`transforms "${d}" date to "Feb 02, 2020"`, () => {
    expect(pipe.transform(d)).toBe('Feb 02, 2020');
  });

  it(`transforms "${dateInString}" string to "May 06, 2021"`, () => {
    expect(pipe.transform(dateInString)).toBe('May 06, 2021');
  });
});
