import { TestBed } from '@angular/core/testing';

import { TaxGroupsService } from './tax_groups.service';

describe('TaxGroupsService', () => {
  let service: TaxGroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxGroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
