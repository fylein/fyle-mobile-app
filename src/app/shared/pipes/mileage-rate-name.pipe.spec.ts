import { MileageRateName } from './mileage-rate-name.pipe';

describe('MileageRateNamePipe', () => {
  const mileageRateName = new MileageRateName();
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
