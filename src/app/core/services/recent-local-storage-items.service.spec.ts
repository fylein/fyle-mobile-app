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
    expect(clearSpy).toHaveBeenCalledWith('expenseProjectCache');
    expect(clearSpy).toHaveBeenCalledWith('mileageProjectCache');
    expect(clearSpy).toHaveBeenCalledWith('mileageSubCategoryName');
    expect(clearSpy).toHaveBeenCalledWith('mileageCostCenterCache');
    expect(clearSpy).toHaveBeenCalledWith('perDiemProjectCache');
    expect(clearSpy).toHaveBeenCalledWith('perDiemCostCenterCache');
    expect(clearSpy).toHaveBeenCalledWith('perDiemSubCategoryCache');
    expect(clearSpy).toHaveBeenCalledWith('splitExpenseProjectCache');
    expect(clearSpy).toHaveBeenCalledWith('splitExpenseCategoryCache');
    expect(clearSpy).toHaveBeenCalledWith('splitExpenseCostCenterCache');
    expect(clearSpy).toHaveBeenCalledWith('recent-currency-cache');
    expect(clearSpy).toHaveBeenCalledWith('recentCategoryList');
    expect(clearSpy).toHaveBeenCalledWith('recentCostCenterList');
    expect(clearSpy).toHaveBeenCalledWith('recentPurposeList');
    expect(clearSpy).toHaveBeenCalledWith('recentNotesList');
    expect(clearSpy).toHaveBeenCalledWith('recentVendorList');
    expect(clearSpy).toHaveBeenCalledTimes(17);
  });
});
