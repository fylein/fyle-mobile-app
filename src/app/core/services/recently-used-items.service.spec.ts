import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
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

describe('RecentlyUsedItemsService', () => {
  let recentlyUsedItemsService: RecentlyUsedItemsService;
  let apiService: jasmine.SpyObj<ApiService>;
  let projectService: jasmine.SpyObj<ProjectsService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecentlyUsedItemsService,
        {
          provide: ApiService,
          useValue: jasmine.createSpyObj('ApiService', ['get']),
        },
        {
          provide: ProjectsService,
          useValue: jasmine.createSpyObj('ProjectsService', ['getByParamsUnformatted']),
        },
      ],
    });
    recentlyUsedItemsService = TestBed.inject(RecentlyUsedItemsService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    projectService = TestBed.inject(ProjectsService) as jasmine.SpyObj<ProjectsService>;
  });

  it('should be created', () => {
    expect(recentlyUsedItemsService).toBeTruthy();
  });

  it('getRecentlyUsed(): should get recently used items', (done) => {
    apiService.get.and.returnValue(of(recentlyUsedRes));
    recentlyUsedItemsService.getRecentlyUsed().subscribe((res) => {
      expect(res).toEqual(recentlyUsedRes);
      expect(apiService.get).toHaveBeenCalledOnceWith('/recently_used');
      done();
    });
  });

  describe('getRecentlyUsedProjects():', () => {
    it('should get all the recently used projects', (done) => {
      projectService.getByParamsUnformatted.and.returnValue(of(recentlyUsedProjectRes));
      const config = {
        recentValues: recentlyUsedRes,
        eou: apiEouRes,
        categoryIds: ['16558', '16559', '16560', '16561', '16562'],
      };
      recentlyUsedItemsService.getRecentlyUsedProjects(config).subscribe((res) => {
        expect(projectService.getByParamsUnformatted).toHaveBeenCalledOnceWith({
          orgId: config.eou.ou.org_id,
          active: true,
          sortDirection: 'asc',
          sortOrder: 'project_name',
          orgCategoryIds: config.categoryIds,
          projectIds: config.recentValues.recent_project_ids,
          offset: 0,
          limit: 10,
        });
        expect(res).toEqual(recentlyUsedProjectRes);
        done();
      });
    });

    it('should return null when there are no recently used projects', (done) => {
      const config = {
        recentValues: null,
        eou: apiEouRes,
        categoryIds: ['16558', '16559', '16560', '16561', '16562'],
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
