import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { SecureStorageService } from './secure-storage.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class RecentLocalStorageItemsService {
  constructor(private secureStorageService: SecureStorageService) {}

  async get(cacheName) {
    let recentItems = [];
    const res = await this.secureStorageService.get(cacheName);

    if (res && res.updatedAt) {
      if (moment(res.updatedAt).diff(moment.now(), 'minute') > 2) {
        await this.secureStorageService.delete(cacheName);
        return [];
      }
    }

    recentItems = res && res.recentItems;
    if (!recentItems) {
      recentItems = [];
    }
    return recentItems;
  }

  async clear(cacheName) {
    await this.secureStorageService.delete(cacheName);
  }

  clearRecentLocalStorageCache() {
    this.clear('advanceProjectCache');

    this.clear('expenseProjectCache');

    this.clear('mileageProjectCache');
    this.clear('mileageSubCategoryName');
    this.clear('mileageCostCenterCache');

    this.clear('perDiemProjectCache');
    this.clear('perDiemCostCenterCache');
    this.clear('perDiemSubCategoryCache');

    this.clear('tripProjectCache');
    this.clear('tripsRecentPurposeList');
    this.clear('recentTripRequestsList');

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

  indexOfItem(recentItemsArray, item, property?) {
    for (let i = 0, len = recentItemsArray.length; i < len; i++) {
      if (recentItemsArray[i][property] === item[property]) {
        return i;
      }
    }

    return -1;
  }

  async post(cacheName, item, property?) {
    const res = await this.get(cacheName);
    const recentItems = res;
    const maxArrayLength = 3;

    // 1. Find the index of the item
    let i;
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

    await this.secureStorageService.set(cacheName, { recentItems, updatedAt: new Date() });
    return recentItems;
  }
}
