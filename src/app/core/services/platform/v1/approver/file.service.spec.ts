import { TestBed } from '@angular/core/testing';

import { ApproverFileService } from './file.service';

describe('ApproverFileService', () => {
  let service: ApproverFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApproverFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
