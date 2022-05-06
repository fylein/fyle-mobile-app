import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { Subject } from 'rxjs';
import { SpenderPlatformApiService } from './spender-platform-api.service';
import { PlatformCategory } from '../models/platform/platform-category.model';
import { PlatformCategoryData } from '../models/platform/platform-category-data.model';
import { OrgCategory } from '../models/v1/org-category.model';

const categoriesCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  skipCategories = ['activity', 'mileage', 'per diem', 'unspecified'];

  constructor(private spenderPlatformApiService: SpenderPlatformApiService) {}

  @Cacheable({
    cacheBusterObserver: categoriesCacheBuster$,
  })
  getAll() {
    return this.spenderPlatformApiService.get('/categories').pipe(
      map((res: PlatformCategory) => this.transformFrom(res.data)),
      map(this.sortCategories),
      map(this.addDisplayName)
    );
  }

  transformFrom(platformCategory: PlatformCategoryData[]): OrgCategory[] {
    let oldCategory = [];
    oldCategory = platformCategory.map((category) => ({
      code: category.code,
      created_at: category.created_at,
      displayName: category.display_name,
      enabled: category.is_enabled,
      fyle_category: category.system_category,
      id: category.id,
      name: category.name,
      org_id: category.org_id,
      sub_category: category.sub_category,
      updated_at: category.updated_at,
    }));

    return oldCategory;
  }

  sortCategories(categories) {
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

  addDisplayName(categories: any[]) {
    return categories.map((category) => {
      let displayName = category.name;

      if (category.sub_category && category.sub_category.toLowerCase() !== displayName.toLowerCase()) {
        displayName += ' / ' + category.sub_category;
      }
      category.displayName = displayName;
      return category;
    });
  }

  filterRequired(categoryList) {
    return categoryList.filter((category) => {
      if (!category.fyle_category) {
        return true;
      }

      return this.skipCategories.indexOf(category.fyle_category.toLowerCase()) === -1;
    });
  }
}
