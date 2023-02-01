import { SingularPipe } from './singular.pipe';

describe('SingularPipe', () => {
  let pipe: SingularPipe;

  beforeEach(() => {
    pipe = new SingularPipe();
  });

  const string1 = 'Locations';
  const string2 = 'Testing';

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it(`should remove "s" from the end of a "${string1}"`, () => {
    expect(pipe.transform(string1)).toBe('Location');
  });

  it('should return the same string if it does not end with "s"', () => {
    expect(pipe.transform(string2)).toBe('Testing');
  });

  it('should return an empty string if the input is falsy', () => {
    expect(pipe.transform('')).toBe('');
  });
});
