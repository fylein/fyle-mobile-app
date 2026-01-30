import { Injectable, inject } from '@angular/core';
import { concatMap, map, reduce, switchMap } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { Observable, range, Subject } from 'rxjs';
import { SpenderPlatformV1ApiService } from './spender-platform-v1-api.service';
import { PlatformCategory } from '../models/platform/platform-category.model';
import { PlatformApiResponse } from '../models/platform/platform-api-response.model';
import { PAGINATION_SIZE } from 'src/app/constants';
import { TranslocoService } from '@jsverse/transloco';

const categoriesCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private paginationSize = inject(PAGINATION_SIZE);

  private spenderPlatformV1ApiService = inject(SpenderPlatformV1ApiService);

  private translocoService = inject(TranslocoService);

  skipCategories = ['activity', 'mileage', 'per diem', 'unspecified'];

  @Cacheable()
  getMileageOrPerDiemCategories(): Observable<PlatformCategory[]> {
    const data = {
      params: {
        is_enabled: 'eq.true',
        system_category: 'in.(Mileage, Per Diem)',
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCategory[]>>('/categories', data)
      .pipe(map((res) => res.data));
  }

  @Cacheable({
    cacheBusterObserver: categoriesCacheBuster$,
  })
  getAll(): Observable<PlatformCategory[]> {
    return this.getActiveCategoriesCount().pipe(
      switchMap((count) => {
        count = count > this.paginationSize ? count / this.paginationSize : 1;
        return range(0, count);
      }),
      concatMap((page) => this.getCategories({ offset: this.paginationSize * page, limit: this.paginationSize })),
      reduce((acc, curr) => acc.concat(curr), [] as PlatformCategory[]),
    );
  }

  @Cacheable()
  getCategoryByName(name: string): Observable<PlatformCategory> {
    const data = {
      params: {
        name: 'ilike.' + name,
        is_enabled: 'eq.true',
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCategory[]>>(`/categories`, data)
      .pipe(map((res) => res.data[0]));
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
      .get<PlatformApiResponse<PlatformCategory[]>>('/categories', data)
      .pipe(map((res) => res.count));
  }

  getCategories(config: { offset: number; limit: number }): Observable<PlatformCategory[]> {
    const data = {
      params: {
        is_enabled: 'eq.' + true,
        offset: config.offset,
        limit: config.limit,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCategory[]>>('/categories', data)
      .pipe(map((res) => this.sortCategories(res.data)));
  }

  sortCategories(categories: PlatformCategory[]): PlatformCategory[] {
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

  filterByOrgCategoryId(orgCategoryId: number, categoryList: PlatformCategory[]): PlatformCategory {
    return categoryList.find((orgCategory) => orgCategory.id === orgCategoryId);
  }

  filterRequired(categoryList: PlatformCategory[]): PlatformCategory[] {
    return categoryList.filter((category) => {
      if (!category.system_category) {
        return true;
      }

      return this.skipCategories.indexOf(category.system_category.toLowerCase()) === -1;
    });
  }

  getSystemCategories(): string[] {
    const systemCategories = [
      this.translocoService.translate('services.categories.bus'),
      this.translocoService.translate('services.categories.airlines'),
      this.translocoService.translate('services.categories.lodging'),
      this.translocoService.translate('services.categories.train'),
    ];
    return systemCategories;
  }

  getSystemCategoriesWithTaxi(): string[] {
    const systemCategoriesWithTaxi = [
      this.translocoService.translate('services.categories.taxi'),
      this.translocoService.translate('services.categories.bus'),
      this.translocoService.translate('services.categories.airlines'),
      this.translocoService.translate('services.categories.lodging'),
      this.translocoService.translate('services.categories.train'),
    ];
    return systemCategoriesWithTaxi;
  }

  getBreakfastSystemCategories(): string[] {
    const breakfastSystemCategories = [this.translocoService.translate('services.categories.lodging')];
    return breakfastSystemCategories;
  }

  getTravelSystemCategories(): string[] {
    const travelSystemCategories = [
      this.translocoService.translate('services.categories.bus'),
      this.translocoService.translate('services.categories.airlines'),
      this.translocoService.translate('services.categories.train'),
    ];
    return travelSystemCategories;
  }

  getFlightSystemCategories(): string[] {
    const flightSystemCategories = [this.translocoService.translate('services.categories.airlines')];
    return flightSystemCategories;
  }

  getCategoryById(id: number): Observable<PlatformCategory> {
    const data = {
      params: {
        id: 'eq.' + id,
      },
    };
    return this.spenderPlatformV1ApiService
      .get<PlatformApiResponse<PlatformCategory[]>>(`/categories`, data)
      .pipe(map((res) => res.data.find((response) => response.id === id)));
  }
}
