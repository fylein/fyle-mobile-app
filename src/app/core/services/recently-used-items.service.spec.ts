import { TestBed } from '@angular/core/testing';

import { RecentlyUsedItemsService } from './recently-used-items.service';

xdescribe('RecentlyUsedItemsService', () => {
  let service: RecentlyUsedItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentlyUsedItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
