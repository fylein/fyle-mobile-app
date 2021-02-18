import { TestBed } from '@angular/core/testing';

import { AppcuesService } from './appcues.service';

describe('AppcuesService', () => {
  let service: AppcuesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppcuesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
