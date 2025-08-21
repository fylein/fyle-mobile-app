import { TestBed } from '@angular/core/testing';
import { MileageRateName } from './mileage-rate-name.pipe';
import { TranslocoService } from '@jsverse/transloco';

describe('MileageRateNamePipe', () => {
  let mileageRateName: MileageRateName;
  let translocoService: jasmine.SpyObj<TranslocoService>;

  beforeEach(() => {
    const translocoServiceSpy = jasmine.createSpyObj('TranslocoService', ['translate']);

    TestBed.configureTestingModule({
      providers: [{ provide: TranslocoService, useValue: translocoServiceSpy }],
    });

    translocoService = TestBed.inject(TranslocoService) as jasmine.SpyObj<TranslocoService>;
    mileageRateName = TestBed.runInInjectionContext(() => new MileageRateName());

    translocoService.translate.and.callFake((key: any, params?: any) => {
      const translations: { [key: string]: string } = {
        'pipes.mileageRateName.twoWheeler': 'Two Wheeler',
        'pipes.mileageRateName.fourWheelerType1': 'Four Wheeler - Type 1',
        'pipes.mileageRateName.fourWheelerType2': 'Four Wheeler - Type 2',
        'pipes.mileageRateName.fourWheelerType3': 'Four Wheeler - Type 3',
        'pipes.mileageRateName.fourWheelerType4': 'Four Wheeler - Type 4',
        'pipes.mileageRateName.bicycle': 'Bicycle',
        'pipes.mileageRateName.electricCar': 'Electric Car',
      };
      return translations[key] || key;
    });
  });

  it('create an instance', () => {
    expect(mileageRateName).toBeTruthy();
  });

  it('mileageRateName() transform : should return the corresponding name for a given value', () => {
    expect(mileageRateName.transform('two_wheeler')).toBe('Two Wheeler');
    expect(mileageRateName.transform('four_wheeler')).toBe('Four Wheeler - Type 1');
    expect(mileageRateName.transform('four_wheeler1')).toBe('Four Wheeler - Type 2');
    expect(mileageRateName.transform('four_wheeler3')).toBe('Four Wheeler - Type 3');
    expect(mileageRateName.transform('four_wheeler4')).toBe('Four Wheeler - Type 4');
    expect(mileageRateName.transform('bicycle')).toBe('Bicycle');
    expect(mileageRateName.transform('electric_car')).toBe('Electric Car');
  });

  it('mileageRateName() transform : should return the same value if it is not found in the names object', () => {
    expect(mileageRateName.transform('unknown')).toBe('unknown');
  });

  it('mileageRateName() transform : should return an empty string if the value is falsy', () => {
    expect(mileageRateName.transform('')).toBe('');
    expect(mileageRateName.transform(null)).toBe('');
    expect(mileageRateName.transform(undefined)).toBe('');
  });
});
