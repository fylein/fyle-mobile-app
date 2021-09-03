import { TestBed } from '@angular/core/testing';

import { NpsService } from './nps.service';

describe('NpsService', () => {
  let service: NpsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NpsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
