import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  const highlightPipe = new HighlightPipe();
  it('create an instance', () => {
    expect(highlightPipe).toBeTruthy();
  });

  it('transform() : should highlight the search term in the text', () => {
    const text = 'Staging Project';
    const search = 'Staging';
    const expectedResult = '<span class="highlight">Staging</span> Project';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });

  it('should handle a search term with multiple words', () => {
    const text = 'This is some text that we want to highlight multiple words';
    const search = 'highlight multiple';
    const expectedResult =
      'This is some text that we want to <span class="highlight">highlight</span> <span class="highlight">multiple</span> words';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });

  it('should handle a search term with special character', () => {
    const text = 'Testing Project FAE 1/Test 1';
    const search = '/';
    const expectedResult = 'Testing Project FAE 1<span class="highlight">/</span>Test 1';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });

  it('should handle an empty text input', () => {
    const text = '';
    const search = 'None';
    const expectedResult = '';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });
});
