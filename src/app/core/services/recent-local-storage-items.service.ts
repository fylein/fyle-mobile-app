import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class RecentLocalStorageItemsService {

  constructor(
    private storageService: StorageService
  ) { }

  get(cacheName) {
    let recentItems =  [];
    return this.storageService.get(cacheName).then(res => {
      recentItems = res;
      if (!recentItems) {
        recentItems = [];
      }
      return recentItems;
    });
  }

  indexOfItem(recentItemsArray, item, property?) {
    for (let i = 0, len = recentItemsArray.length; i < len; i++) {
      if (recentItemsArray[i][property] === item[property]) {
        return i;
      }
    }

    return -1;
  }

  post(cacheName, item, property?) {
    return this.get(cacheName).then(res => {
      const recentItems = res;
      const maxArrayLength = 3;

      // 1. Find the index of the item
      let i;
      if (property) {
        i = this.indexOfItem(recentItems, item, property);
      } else {
        i = recentItems.indexOf(item);
      }

      if (i > -1) { // 2. If found in the array
        // a. remove the object
        recentItems.splice(i, 1);
        // b. put it as first item
        recentItems.unshift(item);
      } else { // 3. If not found in the array
        // a. check if array is full (5)
        if (recentItems.length >= maxArrayLength) {
          // b. yes - remove last item
          recentItems.pop();
        }
        // c. add to first item
        recentItems.unshift(item);
      }

      this.storageService.set(cacheName, recentItems);
      return recentItems;
    })
  }

}
