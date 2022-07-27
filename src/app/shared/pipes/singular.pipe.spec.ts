import { SingularPipe } from './singular.pipe';

describe('SingularPipe', () => {
  it('create an instance', () => {
    const pipe = new SingularPipe();
    expect(pipe).toBeTruthy();
  });
});
