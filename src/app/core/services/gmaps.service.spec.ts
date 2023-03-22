import { TestBed } from '@angular/core/testing';
import { MapDirectionsService, MapGeocoder } from '@angular/google-maps';

import { GmapsService } from './gmaps.service';

describe('GmapsService', () => {
  let gmapsService: GmapsService;
  let mapDirectionsService: jasmine.SpyObj<MapDirectionsService>;
  let mapGeocoder: jasmine.SpyObj<MapGeocoder>;

  beforeEach(() => {
    const mapDirectionsServiceSpy = jasmine.createSpyObj('MapDirectionsService', ['route']);
    const mapGeocoderSpy = jasmine.createSpyObj('MapGeocoder', ['geocode']);
    TestBed.configureTestingModule({
      providers: [
        GmapsService,
        { provide: MapDirectionsService, useValue: mapDirectionsServiceSpy },
        { provide: MapGeocoder, useValue: mapGeocoderSpy },
      ],
    });
    gmapsService = TestBed.inject(GmapsService);
    mapDirectionsService = TestBed.inject(MapDirectionsService) as jasmine.SpyObj<MapDirectionsService>;
    mapGeocoder = TestBed.inject(MapGeocoder) as jasmine.SpyObj<MapGeocoder>;
  });

  it('should be created', () => {
    expect(gmapsService).toBeTruthy();
  });
});
