import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  const highlightPipe = new HighlightPipe();
  it('create an instance', () => {
    expect(highlightPipe).toBeTruthy();
  });

  it('highlightPipe transform() : should highlight the search query in the text', () => {
    const text = 'Staging Project';
    const search = 'Staging';
    const expectedResult = '<span class="highlight">Staging</span> Project';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });

  it('highlightPipe transform() : should handle a search query with multiple words', () => {
    const text = 'Project Dummy Test-1';
    const search = 'Dummy Test-1';
    const expectedResult = 'Project <span class="highlight">Dummy</span> <span class="highlight">Test-1</span>';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });

  it('highlightPipe transform() : should handle a search query with single special character', () => {
    const text = 'Testing Project FAE 1/Test 1';
    const search = '/';
    const expectedResult = 'Testing Project FAE 1<span class="highlight">/</span>Test 1';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });

  it('highlightPipe transform() : should handle a search query with multiple special characters', () => {
    const text = 'This is some text with special characters: @#$%^+-[]{}()*';
    const search = '@#$%^+-[]{}()*';
    const expectedResult = 'This is some text with special characters: <span class="highlight">@#$%^+-[]{}()*</span>';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });

  it('highlightPipe transform() : should handle an empty text input', () => {
    const text = '';
    const search = 'None';
    const expectedResult = '';

    const result = highlightPipe.transform(text, search);

    expect(result).toBe(expectedResult);
  });
});
