import { TestBed } from '@angular/core/testing';

import { CustomFieldsService } from './custom-fields.service';

describe('CustomFieldsService', () => {
  let service: CustomFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomFieldsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
