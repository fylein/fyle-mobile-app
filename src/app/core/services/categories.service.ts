import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { Observable, Subject } from 'rxjs';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformCategory } from '../models/platform/platform-category.model';
import { PlatformCategoryData } from '../models/platform/platform-category-data.model';
import { OrgCategory } from '../models/v1/org-category.model';

const categoriesCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

  @Cacheable({
    cacheBusterObserver: categoriesCacheBuster$,
  })
  getAll(): Observable<OrgCategory[]> {
    return this.spenderPlatformApiService.get<PlatformCategory>('/categories').pipe(
      map((res) => this.transformFrom(res.data)),
      map((categories) => this.sortCategories(categories))
    );
  }

  transformFrom(platformCategory: PlatformCategoryData[]): OrgCategory[] {
    let oldCategory = [];
    oldCategory = platformCategory.map((category) => ({
      code: category.code,
      created_at: new Date(category.created_at),
      displayName: category.display_name,
      enabled: category.is_enabled,
      fyle_category: category.system_category,
      id: category.id,
      name: category.name,
      org_id: category.org_id,
      sub_category: category.sub_category,
      updated_at: new Date(category.updated_at),
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

      if (subCategory1 < subCategory2) {
        return -1;
      }

      if (subCategory1 > subCategory2) {
        return 1;
      }

      return 1;
    });
  }

  filterRequired(categoryList: OrgCategory[]): OrgCategory[] {
    return categoryList.filter((category) => {
      if (!category.fyle_category) {
        return true;
      }

      return ['activity', 'mileage', 'per diem', 'unspecified'].indexOf(category.fyle_category.toLowerCase()) === -1;
    });
  }
}
