import { TestBed } from '@angular/core/testing';

import { CostCentersService } from './cost-centers.service';

xdescribe('CostCentersService', () => {
  let service: CostCentersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostCentersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
