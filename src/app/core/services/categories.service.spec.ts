import { TestBed } from '@angular/core/testing';
import { PAGINATION_SIZE } from 'src/app/constants';
import { CategoriesService } from './categories.service';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import {
  platformApiCategoryRes,
  platformApiAllCategories,
  platformApiCategoryById,
  platformApiCategoriesByName,
} from '../mock-data/platform-api-category.data';
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
  transformedOrgCategoryById,
  expectedOrgCategoryById,
  displayOrgCategoryById,
  transformedOrgCategoriesByName,
  displayOrgCategoriesByName,
  expectedOrgCategoryByName,
} from '../mock-data/org-category.data';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;

  beforeEach(() => {
    const spenderPlatformV1ApiServiceSpy = jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        CategoriesService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: spenderPlatformV1ApiServiceSpy,
        },
        {
          provide: PAGINATION_SIZE,
          useValue: 2,
        },
      ],
    });
    categoriesService = TestBed.inject(CategoriesService);
    spenderPlatformV1ApiService = TestBed.inject(
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
    spenderPlatformV1ApiService.get.and.returnValue(of(platformApiCategoryRes));

    const apiParam = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };

    categoriesService.getActiveCategoriesCount().subscribe((res) => {
      expect(res).toEqual(platformApiCategoryRes.count);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/categories', apiParam);
      done();
    });
  });

  it('getCategories(): should get categories from the api', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformApiAllCategories));
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

  it('getCategoryById(): should get a category from the api based on ID', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformApiCategoryById));
    spyOn(categoriesService, 'transformFrom').and.returnValue(transformedOrgCategoryById);
    spyOn(categoriesService, 'addDisplayName').and.returnValue(displayOrgCategoryById);

    const categoryId = 141295;

    categoriesService.getCategoryById(categoryId).subscribe((res) => {
      expect(res).toEqual(expectedOrgCategoryById);
      expect(categoriesService.transformFrom).toHaveBeenCalledOnceWith(platformApiCategoryById.data);
      expect(categoriesService.addDisplayName).toHaveBeenCalledOnceWith(transformedOrgCategoryById);
      done();
    });
  });

  it('getCategoryByName(): should get a category from the api based on name', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of(platformApiCategoriesByName));
    spyOn(categoriesService, 'transformFrom').and.returnValue(transformedOrgCategoriesByName);
    spyOn(categoriesService, 'addDisplayName').and.returnValue(displayOrgCategoriesByName);

    const categoryName = 'Business';

    categoriesService.getCategoryByName(categoryName).subscribe((res) => {
      expect(res).toEqual(expectedOrgCategoryByName);
      expect(categoriesService.transformFrom).toHaveBeenCalledOnceWith(platformApiCategoriesByName.data);
      expect(categoriesService.addDisplayName).toHaveBeenCalledOnceWith(transformedOrgCategoriesByName);
      done();
    });
  });
});
