import { TestBed } from '@angular/core/testing';

import { StaticMapPropertiesService } from './static-map-properties.service';
import { staticMapPropertiesData } from '../mock-data/static-map-properties.data';

fdescribe('StaticMapPropertiesService', () => {
  let service: StaticMapPropertiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticMapPropertiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProperties(): should return the static map properties', () => {
    const properties = service.getProperties();
    expect(properties).toEqual(staticMapPropertiesData);
  });
});
