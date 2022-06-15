import { SnakeCaseToSpaceCase } from './snake-case-to-space-case.pipe';

describe('SnakeCaseToSpaceCasePipe', () => {
  const pipe = new SnakeCaseToSpaceCase();
  const string1 = 'A_b_c_Defg_qr-AjkCamD';
  const string2 = '___xyz___';
  const string3 = '___xyz-%^&*AJo__ih_-_-_gv___';

  it('transforms "" to ""', () => {
    expect(pipe.transform('')).toBe('');
  });

  it(`transforms "${string1}" to "A b c Defg qr-AjkCamD"`, () => {
    expect(pipe.transform(string1)).toBe('A b c Defg qr-AjkCamD');
  });

  it(`transforms "${string2}" to "   xyz   "`, () => {
    expect(pipe.transform(string2)).toBe('   xyz   ');
  });

  it(`transforms "${string3}" to "   xyz-%^&*AJo  ih - - gv   "`, () => {
    expect(pipe.transform(string3)).toBe('   xyz-%^&*AJo  ih - - gv   ');
  });
});
