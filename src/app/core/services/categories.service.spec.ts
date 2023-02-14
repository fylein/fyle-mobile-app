import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CategoriesService } from './categories.service';
import { SpenderPlatformV1BetaApiService } from './spender-platform-v1-beta-api.service';
import { platformApiCategoryRes, platformApiAllCategories } from '../mock-data/platform-api-category.data';
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
    spenderPlatformV1BetaApiService.get.and.returnValue(of(platformApiCategoryRes));

    const apiParam = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };

    categoriesService.getActiveCategoriesCount().subscribe((res) => {
      expect(res).toEqual(platformApiCategoryRes.count);
      expect(spenderPlatformV1BetaApiService.get).toHaveBeenCalledOnceWith('/categories', apiParam);
      done();
    });
  });

  it('sortCategories(): should sort categories', () => {
    expect(categoriesService.sortCategories(transformDataCategory)).toEqual(sortedCategory);
  });

  it('getSystemCategories(): should get system categories', () => {
    expect(categoriesService.getSystemCategories()).toEqual(['Bus', 'Airlines', 'Lodging', 'Train']);
  });

  it('getSystemCategoriesWithTaxi(): should get system categories with taxi', () => {
    expect(categoriesService.getSystemCategoriesWithTaxi()).toEqual(['Taxi', 'Bus', 'Airlines', 'Lodging', 'Train']);
  });

  it('getBreakfastSystemCategories(): should get breakfast system categories', () => {
    expect(categoriesService.getBreakfastSystemCategories()).toEqual(['Lodging']);
  });

  it('getTravelSystemCategories(): should get travel system categories', () => {
    expect(categoriesService.getTravelSystemCategories()).toEqual(['Bus', 'Airlines', 'Train']);
  });

  it('getFlightSystemCategories(): should get flight system categories', () => {
    expect(categoriesService.getFlightSystemCategories()).toEqual(['Airlines']);
  });
});
