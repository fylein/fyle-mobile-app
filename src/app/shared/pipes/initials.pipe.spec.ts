import { InitialsPipe } from './initials.pipe';

describe('InitialsPipe', () => {
  const initialsPipe = new InitialsPipe();
  it('create an instance', () => {
    expect(initialsPipe).toBeTruthy();
  });

  it('converts Shikhar Dhawan to SD', () => {
    expect(initialsPipe.transform('Shikhar Dhawan')).toBe('SD');
  });

  it('converts Amitabh Bacchan to AB', () => {
    expect(initialsPipe.transform('Amitabh Bacchan')).toBe('AB');
  });

  it('converts shikhar dhawan to SD', () => {
    expect(initialsPipe.transform('shikhar dhawan')).toBe('SD');
  });

  it('converts amitabh bacchan to AB', () => {
    expect(initialsPipe.transform('amitabh bacchan')).toBe('AB');
  });

  it('converts shikhar dhawan with trailing spaces to SD', () => {
    expect(initialsPipe.transform('     shikhar dhawan      ')).toBe('SD');
  });

  it('converts amitabh bacchan with trailing spaces to AB', () => {
    expect(initialsPipe.transform('   amitabh bacchan ')).toBe('AB');
  });

  it('can handle empty strings by returning an empty string', () => {
    expect(initialsPipe.transform('')).toBe('');
  });

  it('can handle null and undefined', () => {
    expect(initialsPipe.transform(null)).toBe('');
    expect(initialsPipe.transform(undefined)).toBe('');
  });

  it('converts amitabh to A', () => {
    expect(initialsPipe.transform('amitabh')).toBe('A');
  });
});
