import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CategoriesService } from './categories.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-beta-api.service';
import { platformApiCategoryRes, platformApiAllCategories } from '../mock-data/platform-api-category.data';
import { of } from 'rxjs';
import {
  sortedCategory,
  filterOrgCategoryParam,
  expectedFilterOrgCategory,
  transformedOrgCategories,
  sortedOrgCategories,
  expectedAllOrgCategories,
  orgCategoryWoDisplayName,
  orgCategoryWithDisplayName,
  orgCategoryPaginated1,
  orgCategoryPaginated2,
  expectedOrgCategoriesPaginated,
  expectedTransformedCategories,
  unsortedCategories1,
  sortedCategories1,
} from '../mock-data/org-category.data';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let spenderPlatformV1BetaApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1BetaApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        {
          provide: SpenderPlatformV1ApiService,
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
      SpenderPlatformV1ApiService
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
  });

  it('should be created', () => {
    expect(categoriesService).toBeTruthy();
  });

  it('getAll(): should get all org categories multiple pages', (done) => {
    const getCategories = spyOn(categoriesService, 'getCategories');
    spyOn(categoriesService, 'getActiveCategoriesCount').and.returnValue(of(4));
    getCategories.withArgs({ offset: 0, limit: 2 }).and.returnValue(of(orgCategoryPaginated1));
    getCategories.withArgs({ offset: 2, limit: 2 }).and.returnValue(of(orgCategoryPaginated2));

    categoriesService.getAll().subscribe((res) => {
      expect(res).toEqual(expectedOrgCategoriesPaginated);
      expect(categoriesService.getActiveCategoriesCount).toHaveBeenCalledTimes(1);
      expect(getCategories).toHaveBeenCalledWith({ offset: 0, limit: 2 });
      expect(getCategories).toHaveBeenCalledWith({ offset: 2, limit: 2 });
      expect(getCategories).toHaveBeenCalledTimes(2);
      done();
    });
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

  it('getCategories(): should get categories from the api', (done) => {
    spenderPlatformV1BetaApiService.get.and.returnValue(of(platformApiAllCategories));
    spyOn(categoriesService, 'transformFrom').and.returnValue(transformedOrgCategories);
    spyOn(categoriesService, 'sortCategories').and.returnValue(sortedOrgCategories);
    spyOn(categoriesService, 'addDisplayName').and.returnValue(expectedAllOrgCategories);

    categoriesService.getCategories({ offset: 0, limit: 4 }).subscribe((res) => {
      expect(res).toEqual(expectedAllOrgCategories);
      expect(categoriesService.transformFrom).toHaveBeenCalledOnceWith(platformApiAllCategories.data);
      expect(categoriesService.sortCategories).toHaveBeenCalledOnceWith(transformedOrgCategories);
      expect(categoriesService.addDisplayName).toHaveBeenCalledOnceWith(sortedOrgCategories);
      done();
    });
  });

  it('transformFrom(): should transfrom from platform-category to org-category', () => {
    expect(categoriesService.transformFrom(platformApiAllCategories.data)).toEqual(expectedTransformedCategories);
  });

  it('addDisplayName(): should modify display name', () => {
    expect(categoriesService.addDisplayName(orgCategoryWoDisplayName)).toEqual(orgCategoryWithDisplayName);
  });

  it('filterByOrgCategoryId(): should filter a category by ID', () => {
    expect(categoriesService.filterByOrgCategoryId(sortedCategory[0].id, sortedCategory)).toEqual(sortedCategory[0]);
  });

  it('filterRequired(): should remove the unrequired categories', () => {
    expect(categoriesService.filterRequired(filterOrgCategoryParam)).toEqual(expectedFilterOrgCategory);
  });

  describe('sortCategories():', () => {
    it('should sort categories', () => {
      expect(categoriesService.sortCategories(transformedOrgCategories)).toEqual(sortedCategory);
    });

    it('should sort categories when categories and sub-categories are same', () => {
      expect(categoriesService.sortCategories(unsortedCategories1)).toEqual(sortedCategories1);
    });
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
