import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import * as dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class RecentLocalStorageItemsService {
  constructor(private storageService: StorageService) {}

  async get<T>(cacheName: string): Promise<T[]> {
    let recentItems: T[] = [];
    const res = await this.storageService.get<{ updatedAt: string; recentItems: T[] }>(cacheName);

    if (res && res.updatedAt) {
      if (dayjs(res.updatedAt).diff(Date.now(), 'minute') > 2) {
        await this.storageService.delete(cacheName);
        return [];
      }
    }

    recentItems = res && res.recentItems;
    if (!recentItems) {
      recentItems = [];
    }
    return recentItems;
  }

  async clear(cacheName: string): Promise<void> {
    await this.storageService.delete(cacheName);
  }

  clearRecentLocalStorageCache(): void {
    this.clear('advanceProjectCache');

    this.clear('expenseProjectCache');

    this.clear('mileageProjectCache');
    this.clear('mileageSubCategoryName');
    this.clear('mileageCostCenterCache');

    this.clear('perDiemProjectCache');
    this.clear('perDiemCostCenterCache');
    this.clear('perDiemSubCategoryCache');

    this.clear('splitExpenseProjectCache');
    this.clear('splitExpenseCategoryCache');
    this.clear('splitExpenseCostCenterCache');

    this.clear('recent-currency-cache');
    this.clear('recentCategoryList');
    this.clear('recentCostCenterList');
    this.clear('recentPurposeList');
    this.clear('recentNotesList');
    this.clear('recentVendorList');
  }

  indexOfItem<T>(recentItemsArray: T[], item: T, property?: string): number {
    for (let i = 0, len = recentItemsArray.length; i < len; i++) {
      if (recentItemsArray[i][property] === item[property]) {
        return i;
      }
    }

    return -1;
  }

  async post<T>(cacheName: string, item: T, property?: string): Promise<T[]> {
    const res = await this.get<T>(cacheName);
    const recentItems = res;
    const maxArrayLength = 3;

    // 1. Find the index of the item
    let i: number;
    if (property) {
      i = this.indexOfItem(recentItems, item, property);
    } else {
      i = recentItems.indexOf(item);
    }

    if (i > -1) {
      // 2. If found in the array
      // a. remove the object
      recentItems.splice(i, 1);
      // b. put it as first item
      recentItems.unshift(item);
    } else {
      // 3. If not found in the array
      // a. check if array is full (5)
      if (recentItems.length >= maxArrayLength) {
        // b. yes - remove last item
        recentItems.pop();
      }
      // c. add to first item
      recentItems.unshift(item);
    }

    await this.storageService.set(cacheName, { recentItems, updatedAt: new Date() });
    return recentItems;
  }
}
