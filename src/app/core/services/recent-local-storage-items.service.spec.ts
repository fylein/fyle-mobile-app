import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { RecentLocalStorageItemsService } from './recent-local-storage-items.service';
import {
  recentLocalStorageItemsRes,
  recentItemsRes,
  itemsRes,
  propertyRes,
  postRecentItemsRes,
} from '../mock-data/recent-local-storage-items.data';
import { of } from 'rxjs';
import * as dayjs from 'dayjs';
import { property, result } from 'lodash';

describe('RecentLocalStorageItemsService', () => {
  let recentLocalStorageItemsService: RecentLocalStorageItemsService;
  let storageService: jasmine.SpyObj<StorageService>;
  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['set', 'get', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        RecentLocalStorageItemsService,
        {
          provide: StorageService,
          useValue: storageServiceSpy,
        },
      ],
    });
    recentLocalStorageItemsService = TestBed.inject(RecentLocalStorageItemsService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(recentLocalStorageItemsService).toBeTruthy();
  });

  it('clear(): should delete the specified cache from storage', async () => {
    const cacheName = 'test-cache';
    await recentLocalStorageItemsService.clear(cacheName);

    expect(storageService.delete).toHaveBeenCalledWith(cacheName);
  });

  it('clearRecentLocalStorageCache(): should clear multiple recent local storage cache', async () => {
    const clearSpy = spyOn(recentLocalStorageItemsService, 'clear');
    recentLocalStorageItemsService.clearRecentLocalStorageCache();
    expect(clearSpy).toHaveBeenCalledWith('advanceProjectCache');
  });

  describe('get():', () => {
    it('should retrieve recent items from the specified cache in the local storage.', async () => {
      const cacheName = 'mileageSubCategoryName';
      const recentItems = recentLocalStorageItemsRes;
      const cache = {
        updatedAt: dayjs().toISOString(),
        recentItems,
      };
      storageService.get.and.returnValue(Promise.resolve(cache));

      const result = await recentLocalStorageItemsService.get(cacheName);

      expect(storageService.get).toHaveBeenCalledWith(cacheName);
      expect(result).toEqual(recentItems);
    });

    it('should return empty array when cache is outdated', async () => {
      const cacheName = 'recent-currency-cache';
      const outdatedCache = {
        updatedAt: dayjs().diff(5, 'minute').toString(),
        recentItems: recentLocalStorageItemsRes,
      };
      storageService.get.and.returnValue(Promise.resolve(outdatedCache));
      const result = await recentLocalStorageItemsService.get(cacheName);
      expect(storageService.get).toHaveBeenCalledOnceWith(cacheName);
      expect(result).toEqual([]);
    });

    it('should return an empty array when cache does not exist', async () => {
      const cacheName = 'recent-currency-cache';
      storageService.get.and.resolveTo(null);
      const result = await recentLocalStorageItemsService.get(cacheName);
      expect(result).toEqual([]);
    });
  });

  describe('indexOfItem():', () => {
    it('should return the item index', () => {
      const result = recentLocalStorageItemsService.indexOfItem(recentItemsRes, itemsRes, propertyRes);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it('should return -1 if there are no recent items in the array', () => {
      const result = recentLocalStorageItemsService.indexOfItem([], itemsRes, property);
      expect(result).toEqual(-1);
    });
  });

  describe('post():', () => {
    it('it should maintain and update a cache of recent items in the local storage', async () => {
      const cacheName = 'mileageSubCategoryName';
      const recentItems = postRecentItemsRes;
      const cache = {
        recentItems,
        updatedAt: jasmine.any(Date),
      };
      spyOn(recentLocalStorageItemsService, 'indexOfItem');
      spyOn(recentLocalStorageItemsService, 'get').and.returnValue(Promise.resolve(postRecentItemsRes));
      storageService.set.and.returnValue(Promise.resolve());
      const result = await recentLocalStorageItemsService.post(cacheName, itemsRes, propertyRes);
      expect(storageService.set).toHaveBeenCalledOnceWith(cacheName, cache);
      expect(result).toEqual(postRecentItemsRes);
    });

    it('should find the index of an item without the property argument', async () => {
      const cacheName = 'mileageSubCategoryName';
      const recentItems = postRecentItemsRes;
      const cache = {
        recentItems,
        updatedAt: jasmine.any(Date),
      };
      spyOn(recentLocalStorageItemsService, 'indexOfItem');
      spyOn(recentLocalStorageItemsService, 'get').and.returnValue(Promise.resolve(postRecentItemsRes));
      storageService.set.and.returnValue(Promise.resolve());
      const result = await recentLocalStorageItemsService.post(cacheName, itemsRes);
      expect(storageService.set).toHaveBeenCalledOnceWith(cacheName, cache);
      expect(result).toEqual(postRecentItemsRes);
    });
  });
});
