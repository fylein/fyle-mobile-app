import { MaskNumber } from './mask-number.pipe';

describe('MaskNumber', () => {
  it('create an instance', () => {
    const pipe = new MaskNumber();
    expect(pipe).toBeTruthy();
  });
});
