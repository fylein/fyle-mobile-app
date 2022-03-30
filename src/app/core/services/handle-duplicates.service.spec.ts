import { TestBed } from '@angular/core/testing';

import { HandleDuplicatesService } from './handle-duplicates.service';

describe('HandleDuplicatesService', () => {
  let service: HandleDuplicatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandleDuplicatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
