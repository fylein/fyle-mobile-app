import { MaskNumberPipe } from './mask-number.pipe';

describe('MaskNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new MaskNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
