import { TestBed } from '@angular/core/testing';

import { RealTimeFeedService } from './real-time-feed.service';

describe('RealTimeFeedService', () => {
  let service: RealTimeFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealTimeFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
