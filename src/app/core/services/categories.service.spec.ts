import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CategoriesService } from './categories.service';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
import { apiCategoryCountRes, apiAllCategoryRes } from '../mock-data/api-category.data';
import { of } from 'rxjs';
import { sortedCategory, transformDataCategory } from '../mock-data/org-category.data';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let spenderPlatformV1BetaApiService: jasmine.SpyObj<SpenderPlatformV1BetaApiService>;

  beforeEach(() => {
    const spenderPlatformV1BetaApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1BetaApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        {
          provide: SpenderPlatformV1BetaApiService,
          useValue: spenderPlatformV1BetaApiServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    categoriesService = TestBed.inject(CategoriesService);
    spenderPlatformV1BetaApiService = TestBed.inject(
      SpenderPlatformV1BetaApiService
    ) as jasmine.SpyObj<SpenderPlatformV1BetaApiService>;
  });

  it('should be created', () => {
    expect(categoriesService).toBeTruthy();
  });

  it('getActiveCategoriesCount(): should get category count', (done) => {
    spenderPlatformV1BetaApiService.get.and.returnValue(of(apiCategoryCountRes));

    const apiParam = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };

    categoriesService.getActiveCategoriesCount().subscribe((res) => {
      expect(res).toEqual(318);
      expect(spenderPlatformV1BetaApiService.get).toHaveBeenCalledOnceWith('/categories', apiParam);
      done();
    });
  });

  it('sortCategories(): should sort categories', () => {
    const result = categoriesService.sortCategories(transformDataCategory);

    expect(result).toEqual(sortedCategory);
  });

  it('getSystemCategories(): should get system categories', () => {
    const result = categoriesService.getSystemCategories();

    expect(result).toEqual(['Bus', 'Airlines', 'Lodging', 'Train']);
  });

  it('getSystemCategoriesWithTaxi(): should get system categories with taxi', () => {
    const result = categoriesService.getSystemCategoriesWithTaxi();

    expect(result).toEqual(['Taxi', 'Bus', 'Airlines', 'Lodging', 'Train']);
  });

  it('getBreakfastSystemCategories(): should get breakfast system categories', () => {
    const result = categoriesService.getBreakfastSystemCategories();

    expect(result).toEqual(['Lodging']);
  });

  it('getTravelSystemCategories(): should get travel system categories', () => {
    const result = categoriesService.getTravelSystemCategories();

    expect(result).toEqual(['Bus', 'Airlines', 'Train']);
  });

  it('getFlightSystemCategories(): should get flight system categories', () => {
    const result = categoriesService.getFlightSystemCategories();

    expect(result).toEqual(['Airlines']);
  });
});
