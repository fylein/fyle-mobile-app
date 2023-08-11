import { ArrayToCommaListPipe } from './array-to-comma-list.pipe';

xdescribe('ArrayToCommaListPipe', () => {
  it('create an instance', () => {
    const pipe = new ArrayToCommaListPipe();
    expect(pipe).toBeTruthy();
  });
});
