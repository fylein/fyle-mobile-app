import { EllipsisPipe } from './ellipses.pipe';

describe('EllipsisPipe', () => {
  const ellipsisPipe = new EllipsisPipe();

  it('should create an instance', () => {
    expect(ellipsisPipe).toBeTruthy();
  });

  it('ellipsisPipe transform() : should return original input value if args is undefined', () => {
    const input = 'Jan - 1 Report for reimbursement';
    const expectedOutput = 'Jan - 1 Report for reimbursement';
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
    const input = 'Requesting advances for the month of March 2023';
    const expectedOutput = 'Requesting...';
    expect(ellipsisPipe.transform(input, 10)).toEqual(expectedOutput);
  });

  it('ellipsisPipe transform() : should return the original string if val is shorter than or equal to args', () => {
    const input = 'Report for reimbursement';
    const expectedOutput = 'Report for reimbursement';

    expect(ellipsisPipe.transform(input, 24)).toEqual(expectedOutput);

    const input2 = 'Expense Report 1 Jan-2023';
    const expectedOutput2 = 'Expense Report 1 Jan-2023';

    expect(ellipsisPipe.transform(input2, 30)).toEqual(expectedOutput2);
  });
});
