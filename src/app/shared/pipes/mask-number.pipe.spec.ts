import { MaskNumber } from './mask-number.pipe';

xdescribe('MaskNumber', () => {
  it('create an instance', () => {
    const pipe = new MaskNumber();
    expect(pipe).toBeTruthy();
  });
});
