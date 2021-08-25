import { TestBed } from '@angular/core/testing';

import { TaxGroupService } from './tax_group.service';

describe('TaxGroupService', () => {
  let service: TaxGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
