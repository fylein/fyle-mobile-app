import { Inject, Injectable } from '@angular/core';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformCategory } from '../models/platform/platform-category.model';
import { OrgCategory } from '../models/v1/org-category.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PAGINATION_SIZE } from 'src/app/constants';

const categoriesCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  skipCategories = ['activity', 'mileage', 'per diem', 'unspecified'];

  constructor(
    @Inject(PAGINATION_SIZE) private paginationSize: number,
    private spenderPlatformV1ApiService: SpenderPlatformV1ApiService
  ) {}

  @Cacheable({
    cacheBusterObserver: categoriesCacheBuster$,
  })
  getAll(): Observable<OrgCategory[]> {
    return this.getActiveCategoriesCount().pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getCategories({ offset: this.paginationSize * page, limit: this.paginationSize })),
      reduce((acc, curr) => acc.concat(curr), [] as OrgCategory[])
    );
  }

  @Cacheable()
  getCategoryByName(name: string): Observable<OrgCategory> {
    const data = {
      params: {
        name: 'ilike.' + name,
        is_enabled: 'eq.true',
      },
    };
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformCategory>>(`/categories`, data).pipe(
      map((res) => this.transformFrom(res.data)),
      map((res) => this.addDisplayName(res)),
      map((responses) => responses[0])
    );
  }

  getActiveCategoriesCount(): Observable<number> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: 0,
        limit: 1,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCategory>>('/categories', data)
      .pipe(map((res) => res.count));
  }

  getCategories(config: { offset: number; limit: number }): Observable<OrgCategory[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformCategory>>('/categories', data).pipe(
      map((res) => this.transformFrom(res.data)),
      map((res) => this.sortCategories(res)),
      map((res) => this.addDisplayName(res))
    );
  }

  @Cacheable()
  getMileageOrPerDiemCategories(): Observable<PlatformCategory[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        system_category: 'in.(Mileage, Per Diem)',
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCategory>>('/categories', data)
      .pipe(map((res) => res.data));
  }

  transformFrom(platformCategory: PlatformCategory[]): OrgCategory[] {
    const oldCategory = platformCategory.map((category) => ({
      code: category.code,
      created_at: category.created_at,
      displayName: category.display_name,
      enabled: category.is_enabled,
      fyle_category: category.system_category,
      id: category.id,
      name: category.name,
      org_id: category.org_id,
      sub_category: category.sub_category || category.name,
      updated_at: category.updated_at,
    }));

    return oldCategory;
  }

  sortCategories(categories: OrgCategory[]): OrgCategory[] {
    return categories.sort((a, b) => {
      const category1 = a.name.toUpperCase();
      const category2 = b.name.toUpperCase();

      const subCategory1 = a.sub_category && a.sub_category.toUpperCase();
      const subCategory2 = b.sub_category && b.sub_category.toUpperCase();

      if (category1 < category2) {
        return -1;
      }

      if (category1 > category2) {
        return 1;
      }

      // If categories are equal && If sub category is same, this should show up first in the list
      if (category1 === subCategory1) {
        return -1;
      }

      if (category2 === subCategory2) {
        return 1;
      }

      if (subCategory1 < subCategory2) {
        return -1;
      }

      if (subCategory1 > subCategory2) {
        return 1;
      }

      return 0;
    });
  }

  addDisplayName(categories: OrgCategory[]): OrgCategory[] {
    return categories.map((category) => {
      let displayName = category.name;

      if (category.sub_category && category.sub_category.toLowerCase() !== displayName.toLowerCase()) {
        displayName += ' / ' + category.sub_category;
      }
      category.displayName = displayName;
      return category;
    });
  }

  filterByOrgCategoryId(orgCategoryId: number, categoryList: OrgCategory[]): OrgCategory {
    return categoryList.find((orgCategory) => orgCategory.id === orgCategoryId);
  }

  filterRequired(categoryList: OrgCategory[]): OrgCategory[] {
    return categoryList.filter((category) => {
      if (!category.fyle_category) {
        return true;
      }

      return this.skipCategories.indexOf(category.fyle_category.toLowerCase()) === -1;
    });
  }

  getSystemCategories(): string[] {
    const systemCategories = ['Bus', 'Airlines', 'Lodging', 'Train'];
    return systemCategories;
  }

  getSystemCategoriesWithTaxi(): string[] {
    const systemCategoriesWithTaxi = ['Taxi', 'Bus', 'Airlines', 'Lodging', 'Train'];
    return systemCategoriesWithTaxi;
  }

  getBreakfastSystemCategories(): string[] {
    const breakfastSystemCategories = ['Lodging'];
    return breakfastSystemCategories;
  }

  getTravelSystemCategories(): string[] {
    const travelSystemCategories = ['Bus', 'Airlines', 'Train'];
    return travelSystemCategories;
  }

  getFlightSystemCategories(): string[] {
    const flightSystemCategories = ['Airlines'];
    return flightSystemCategories;
  }

  getCategoryById(id: number): Observable<OrgCategory> {
    const data = {
      params: {
        id: 'eq.' + id,
      },
    };
    return this.spenderPlatformV1ApiService.get<PlatformApiResponse<PlatformCategory>>(`/categories`, data).pipe(
      map((res) => this.transformFrom(res.data)),
      map((res) => this.addDisplayName(res)),
      map((responses) => responses.find((response) => response.id === id))
    );
  }
}
