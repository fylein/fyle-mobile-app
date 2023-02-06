import { MaskNumber } from './mask-number.pipe';

describe('MaskNumber', () => {
  const maskNumber = new MaskNumber();

  const number1 = '123456789';
  const number2 = '1234';

  it('create an instance', () => {
    expect(maskNumber).toBeTruthy();
  });

  it('MaskNumber transform() : should mask the numbers and only display the last 4 digits', () => {
    expect(maskNumber.transform(number1)).toBe('****6789');
    expect(maskNumber.transform(number2)).toBe('****1234');
    expect(maskNumber.transform('12')).toBe('****12');
  });

  it('MaskNumber transform() : return the original value if it is falsy', () => {
    expect(maskNumber.transform('')).toEqual('');
  });
});
