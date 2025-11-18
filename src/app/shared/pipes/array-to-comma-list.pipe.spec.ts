import { TestBed } from '@angular/core/testing';
import { ArrayToCommaListPipe } from './array-to-comma-list.pipe';
import { TranslocoService } from '@jsverse/transloco';

describe('ArrayToCommaListPipe', () => {
  let arrayToCommaListPipe: ArrayToCommaListPipe;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    TestBed.configureTestingModule({
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    });

    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    arrayToCommaListPipe = TestBed.runInInjectionContext(() => new ArrayToCommaListPipe());

    // Mock translate method to return expected strings
    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.arrayToCommaList.and': 'and',
      };
      return translations[key] || key;
    });
  });

  it('create an instance', () => {
    expect(arrayToCommaListPipe).toBeTruthy();
  });

  it('should return an empty string if the array is falsy', () => {
    expect(arrayToCommaListPipe.transform(null)).toEqual('');
  });

  it('should return an empty string if the array is empty', () => {
    expect(arrayToCommaListPipe.transform([])).toEqual('');
  });

  it('should return the same item as it is if the array has only one item', () => {
    expect(arrayToCommaListPipe.transform(['a'])).toEqual('a');
  });

  it('should return the items joined by an "and" if the array has two items', () => {
    expect(arrayToCommaListPipe.transform(['a', 'b'])).toEqual('a and b');
  });

  it('should return the items joined by a comma and an "and" at the end if the array has more than two items', () => {
    expect(arrayToCommaListPipe.transform(['a', 'b', 'c'])).toEqual('a, b and c');
  });
});
