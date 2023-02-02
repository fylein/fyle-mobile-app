import { EllipsisPipe } from './ellipses.pipe';

describe('EllipsisPipe', () => {
  const ellipsisPipe = new EllipsisPipe();

  it('should create an instance', () => {
    expect(ellipsisPipe).toBeTruthy();
  });

  it('ellipsisPipe transform() : should return original input value if args is undefined', () => {
    const input = 'We are testing';
    const expectedOutput = 'We are testing';
    expect(ellipsisPipe.transform(input, undefined)).toBe(expectedOutput);
  });

  it('ellipsisPipe transform() : should return the original value if val is undefined or null', () => {
    const input = undefined;
    const expectedOutput = undefined;

    expect(ellipsisPipe.transform(input, 10)).toEqual(expectedOutput);

    const input2 = null;
    const expectedOutput2 = null;

    expect(ellipsisPipe.transform(input2, 10)).toEqual(expectedOutput2);
  });

  it('ellipsisPipe transform() : should return a truncated string if val is longer than args', () => {
    const input = 'Hello World';
    const expectedOutput = 'Hello...';
    expect(ellipsisPipe.transform(input, 5)).toEqual(expectedOutput);
  });

  it('ellipsisPipe transform() : should return the original string if val is shorter than or equal to args', () => {
    const input = 'Hello';
    const expectedOutput = 'Hello';

    expect(ellipsisPipe.transform(input, 5)).toEqual(expectedOutput);

    const input2 = 'Hello';
    const expectedOutput2 = 'Hello';

    expect(ellipsisPipe.transform(input2, 10)).toEqual(expectedOutput2);
  });
});
