import { TestBed } from '@angular/core/testing';

import { StaticMapPropertiesService } from './static-map-properties.service';

describe('StaticMapPropertiesService', () => {
  let service: StaticMapPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticMapPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
