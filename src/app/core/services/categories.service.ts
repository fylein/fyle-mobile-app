import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ts-cacheable';
import { Subject } from 'rxjs';

const categoriesCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  skipCategories = ['activity', 'mileage', 'per diem', 'unspecified'];

  constructor(private apiService: ApiService) {}

  @Cacheable({
    cacheBusterObserver: categoriesCacheBuster$,
  })
  getAll() {
    return this.apiService.get('/org_categories').pipe(map(this.sortCategories), map(this.addDisplayName));
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
