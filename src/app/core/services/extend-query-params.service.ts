import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExtendQueryParamsService {
  /**
   * Extends query parameters with a formatted search query based on user input
   *
   * @param queryParams - The original query parameters object to extend (defaults to empty object)
   * @param simpleSearchText - The search text provided by the user
   * @returns A new object containing the original query parameters plus the formatted search query
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  extendQueryParamsForTextSearch(queryParams = {}, simpleSearchText: string) {
    if (simpleSearchText === undefined || simpleSearchText.length < 1) {
      return queryParams;
    }

    const searchWords = simpleSearchText.split(/(\s+)/).filter((word) => word.trim().length > 0);
    const lastWord = searchWords[searchWords.length - 1];
    const arrayWithoutLastWord = searchWords.slice(0, -1);

    const searchQuery = arrayWithoutLastWord.reduce((curr, agg) => `${agg} & ${curr}`, '').concat(`${lastWord}:*`);

    return Object.assign({}, queryParams, { q: searchQuery });
  }
}
