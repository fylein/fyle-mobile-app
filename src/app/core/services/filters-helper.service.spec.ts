import { TestBed } from '@angular/core/testing';

import { FiltersHelperService } from './filters-helper.service';

describe('FiltersHelperService', () => {
  let service: FiltersHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiltersHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
