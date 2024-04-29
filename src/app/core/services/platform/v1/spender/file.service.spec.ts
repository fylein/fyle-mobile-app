import { TestBed } from '@angular/core/testing';

import { SpenderFileService } from './file.service';

describe('SpenderFileService', () => {
  let service: SpenderFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpenderFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
