import { EllipsisPipe } from './ellipses.pipe';

fdescribe('Ellipses Pipe', () => {
  const pipe = new EllipsisPipe();
  const sampleLongText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum";
  const sampleShortText = "Lorem Ipsum";
  const ellipsisTestLength = 11;

  it('should add ellipses to long text', () => {
    expect(pipe.transform(sampleLongText, ellipsisTestLength))
      .toBe(`${sampleLongText.slice(0, ellipsisTestLength)}...`);
  });

  it('should add ellipses to short text', () => {
    expect(pipe.transform(sampleShortText, ellipsisTestLength))
      .toBe(`${sampleShortText}`);
  });

  it('should not break in case of null, undefined being passed as a param', () => {
    expect(pipe.transform(null, ellipsisTestLength)).toBe(null);
    expect(pipe.transform(undefined, ellipsisTestLength)).toBe(undefined);
  });
});
