import { CurrencySymbolPipe } from './currency-symbol.pipe';

describe('CurrencySymbolPipe', () => {
  const pipe = new CurrencySymbolPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transform CAD to $', () => {
    expect(pipe.transform('CAD')).toEqual('$');
  });

  it('transform CAD to CA$', () => {
    expect(pipe.transform('CAD', 'wide')).toEqual('CA$');
  });

  it('handle invalid currency codes', () => {
    expect(pipe.transform('')).toEqual('');
  });

  it('handle null and undefined values', () => {
    expect(pipe.transform(undefined)).toEqual('');
    expect(pipe.transform(null)).toEqual('');
  });
});
