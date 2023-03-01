import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { RecentLocalStorageItemsService } from './recent-local-storage-items.service';

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
});
