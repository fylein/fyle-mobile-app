import { TestBed } from '@angular/core/testing';

import { InAppBrowserService } from './in-app-browser.service';

describe('InAppBrowserService', () => {
  let service: InAppBrowserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InAppBrowserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
