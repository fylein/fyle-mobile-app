import { TestBed } from '@angular/core/testing';
import { ExtendQueryParamsService } from './extend-query-params.service';

describe('ExtendQueryParamsService', () => {
  let extendQueryParamsService: ExtendQueryParamsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExtendQueryParamsService],
    });

    extendQueryParamsService = TestBed.inject(ExtendQueryParamsService);
  });

  it('should be created', () => {
    expect(extendQueryParamsService).toBeTruthy();
  });

  describe('extendQueryParamsForTextSearch():', () => {
    const queryParams = {
      param1: 'value1',
      param2: 'value2',
    };

    it('should return the original queryParams when simpleSearchText is undefined', () => {
      const result = extendQueryParamsService.extendQueryParamsForTextSearch(queryParams, undefined);
      expect(result).toEqual(queryParams);
    });

    it('should return the original queryParams when simpleSearchText is an empty string', () => {
      const result = extendQueryParamsService.extendQueryParamsForTextSearch(queryParams, '');
      expect(result).toEqual(queryParams);
    });

    it('should append the correct search query to the queryParams when simpleSearchText is not empty', () => {
      const simpleSearchText = 'example text search';
      const expectedSearchQuery = 'text & example & search:*';
      const expectedQueryParams = {
        param1: 'value1',
        param2: 'value2',
        q: expectedSearchQuery,
      };
      const result = extendQueryParamsService.extendQueryParamsForTextSearch(queryParams, simpleSearchText);
      expect(result).toEqual(expectedQueryParams);
    });
  });
});
