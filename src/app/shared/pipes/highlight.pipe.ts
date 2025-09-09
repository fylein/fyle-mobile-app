import { Pipe, PipeTransform } from '@angular/core';

// ref: https://forum.ionicframework.com/t/highlighting-text/105265/2
@Pipe({ name: 'highlight', })
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string): string {
    try {
      // Example: text = 'Mic Testing 123', search = 'Mic T'
      if (text && text.length > 0 && search && search.length > 0) {
        // searth.trim() - remove white spaces at both ends of search string
        search = search.trim();
        if (search.length > 0) {
          // used to prepend special characters if any with '\'. Wrt example, pattern will be 'Mic T'
          let pattern = search.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
          // Words separated with space will now be separated with '|'. Wrt example, pattern will be 'Mic|T'
          pattern = pattern
            .split(' ')
            .filter((t) => t.length > 0)
            .join('|');
          // create new regular expression of modifier type
          // gi(g: global, i: case-insensitive ) using the pattern 'Mic|T', which will be /Mic|T/gi
          const regex = new RegExp(pattern, 'gi');
          // actual text will be replaced with: matched patterns will be inside <span> with SCSS class highlight, rest will be normal text
          // reference for string replacement with regex in detail:
          // https://www.freecodecamp.org/news/javascript-string-replace-example-with-regex/
          text = text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
          // In our example, text will now have:
          // <span class="highlight">Mic</span> <span class="highlight">T</span>es<span class="highlight">t</span>ing 123
        }
      }
    } catch (exception) {}
    return text;
  }
}
