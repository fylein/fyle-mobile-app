import { TestBed } from '@angular/core/testing';

import { SmartlookService } from './smartlook.service';

describe('SmartlookService', () => {
  let service: SmartlookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartlookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
