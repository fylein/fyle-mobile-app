import { TestBed } from '@angular/core/testing';

import { DeepLinkService } from './deep-link.service';

describe('DeepLinkService', () => {
  let service: DeepLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeepLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
