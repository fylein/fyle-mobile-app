import { SingularPipe } from './singular.pipe';

describe('SingularPipe', () => {
  const singularPipe = new SingularPipe();
  const string1 = 'Locations';
  const string2 = 'Testing';

  it('create an instance', () => {
    expect(singularPipe).toBeTruthy();
  });

  it('SingularPipe transform() : should remove s from the end of a string', () => {
    expect(singularPipe.transform(string1)).toBe('Location');
  });

  it('SingularPipe transform() : should return the same string if it does not end with "s"', () => {
    expect(singularPipe.transform(string2)).toBe('Testing');
  });

  it('SingularPipe transform() : should return an empty string if the input is falsy', () => {
    expect(singularPipe.transform('')).toBe('');
  });
});
