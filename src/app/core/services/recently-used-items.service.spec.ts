import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { ProjectsService } from './projects.service';
import { RecentlyUsedItemsService } from './recently-used-items.service';
import {
  recentlyUsedRes,
  recentlyUsedProjectRes,
  recentCurrencyRes,
  currencies,
  recentlyUsedResWithoutCurr,
  recentlyUsedCostCentersRes,
  recentlyUsedResWithoutCostCenterId,
  recentlyUsedCategoryWithoutId,
  costCentersResWithNonMatchingIds,
} from '../mock-data/recently-used.data';
import { apiEouRes } from '../mock-data/extended-org-user.data';
import { of } from 'rxjs';
import { recentUsedCategoriesRes } from '../mock-data/org-category-list-item.data';
import { CategoriesService } from './categories.service';
import { orgCategoryPaginated1 } from '../mock-data/org-category.data';
import { testActiveCategoryList } from '../test-data/projects.spec.data';
import { platformProjectsArgs1 } from '../mock-data/platform/v1/platform-project-args.data';

describe('RecentlyUsedItemsService', () => {
  let recentlyUsedItemsService: RecentlyUsedItemsService;
  let spenderPlatformV1ApiService: jasmine.SpyObj<SpenderPlatformV1ApiService>;
  let projectsService: jasmine.SpyObj<ProjectsService>;
  let categoriesService: jasmine.SpyObj<CategoriesService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecentlyUsedItemsService,
        {
          provide: SpenderPlatformV1ApiService,
          useValue: jasmine.createSpyObj('SpenderPlatformV1ApiService', ['get']),
        },
        {
          provide: ProjectsService,
          useValue: jasmine.createSpyObj('ProjectsService', ['getByParamsUnformatted']),
        },
        {
          provide: CategoriesService,
          useValue: jasmine.createSpyObj('CategoriesService', ['getAll']),
        },
      ],
    });
    recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService);
    spenderPlatformV1ApiService = TestBed.inject(
      SpenderPlatformV1ApiService,
    ) as jasmine.SpyObj<SpenderPlatformV1ApiService>;
    projectsService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
    categoriesService = TestBed.inject(CategoriesService) as jasmine.SpyObj<CategoriesService>;
  });

  it('should be created', () => {
    expect(recentlyUsedItemsService).toBeTruthy();
  });

  it('getRecentlyUsed(): should get recently used items', (done) => {
    spenderPlatformV1ApiService.get.and.returnValue(of({ data: recentlyUsedRes }));
    recentlyUsedItemsService.getRecentlyUsed().subscribe((res) => {
      expect(res).toEqual(recentlyUsedRes);
      expect(spenderPlatformV1ApiService.get).toHaveBeenCalledOnceWith('/recently_used_fields');
      done();
    });
  });

  describe('getRecentlyUsedProjects():', () => {
    it('should get all the recently used projects', (done) => {
      categoriesService.getAll.and.returnValue(of(orgCategoryPaginated1));
      projectsService.getByParamsUnformatted.and.returnValue(of(recentlyUsedProjectRes));

      const config = {
        recentValues: recentlyUsedRes,
        eou: apiEouRes,
        categoryIds: ['16558', '16559', '16560', '16561', '16562'],
        isProjectCategoryRestrictionsEnabled: true,
        activeCategoryList: testActiveCategoryList,
      };

      recentlyUsedItemsService.getRecentlyUsedProjects(config).subscribe((res) => {
        expect(projectsService.getByParamsUnformatted).toHaveBeenCalledOnceWith(
          platformProjectsArgs1,
          true,
          testActiveCategoryList,
        );
        expect(res).toEqual(recentlyUsedProjectRes);
        done();
      });
    });

    it('should return null when there are no recently used projects', (done) => {
      categoriesService.getAll.and.returnValue(of(orgCategoryPaginated1));

      const config = {
        recentValues: null,
        eou: apiEouRes,
        categoryIds: ['16558', '16559', '16560', '16561', '16562'],
        isProjectCategoryRestrictionsEnabled: true,
        activeCategoryList: testActiveCategoryList,
      };
      recentlyUsedItemsService.getRecentlyUsedProjects(config).subscribe((res) => {
        expect(res).toBeNull();
        done();
      });
    });
  });

  describe('getRecentCurrencies():', () => {
    it('should return recent currencies', (done) => {
      recentlyUsedItemsService.getRecentCurrencies(currencies, recentlyUsedRes).subscribe((res) => {
        expect(res).toEqual(recentCurrencyRes);
        done();
      });
    });

    it('should return empty array if there are no recent currencies', (done) => {
      recentlyUsedItemsService.getRecentCurrencies(currencies, recentlyUsedResWithoutCurr).subscribe((res) => {
        expect(res).toEqual([]);
        done();
      });
    });
  });

  describe('getRecentCostCenters():', () => {
    it('should get recent cost centers', (done) => {
      recentlyUsedItemsService.getRecentCostCenters(recentlyUsedCostCentersRes, recentlyUsedRes).subscribe((res) => {
        expect(res).toEqual(recentlyUsedCostCentersRes);
        done();
      });
    });

    it('should return null when there are no recent cost centers', (done) => {
      recentlyUsedItemsService
        .getRecentCostCenters(recentlyUsedCostCentersRes, recentlyUsedResWithoutCostCenterId)
        .subscribe((res) => {
          expect(res).toBeNull();
          done();
        });
    });

    it('should return null when there are no matching recent cost center ids', (done) => {
      recentlyUsedItemsService
        .getRecentCostCenters(recentlyUsedCostCentersRes, costCentersResWithNonMatchingIds)
        .subscribe((res) => {
          expect(res).toBeNull();
          done();
        });
    });
  });

  describe('getRecentCategories() : ', () => {
    it('should get recent categories', (done) => {
      recentlyUsedItemsService.getRecentCategories(recentUsedCategoriesRes, recentlyUsedRes).subscribe((res) => {
        expect(res).toEqual(recentUsedCategoriesRes);
      });
      done();
    });

    it('should return null if there are no recent categories', (done) => {
      recentlyUsedItemsService
        .getRecentCategories(recentUsedCategoriesRes, recentlyUsedCategoryWithoutId)
        .subscribe((res) => {
          expect(res).toBeNull();
          done();
        });
    });
  });
});
