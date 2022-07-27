import { Singular } from './singular.pipe';

describe('SingularPipe', () => {
  it('create an instance', () => {
    const pipe = new Singular();
    expect(pipe).toBeTruthy();
  });
});
