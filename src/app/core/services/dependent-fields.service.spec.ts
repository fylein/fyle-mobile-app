import { TestBed } from '@angular/core/testing';

import { DependentFieldsService } from './dependent-fields.service';

xdescribe('DependentFieldsService', () => {
  let service: DependentFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DependentFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
