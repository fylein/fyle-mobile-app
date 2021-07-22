import { TestBed } from '@angular/core/testing';

import { RecentLocalStorageItemsService } from './recent-local-storage-items.service';

describe('RecentLocalStorageItemsService', () => {
    let service: RecentLocalStorageItemsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RecentLocalStorageItemsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
