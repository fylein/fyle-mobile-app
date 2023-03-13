import { TestBed } from '@angular/core/testing';
import { of, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LocationService } from './location.service';
import { locationData1 } from '../mock-data/location.data';

describe('LocationService', () => {
  let locationService: LocationService;
  let httpClient: jasmine.SpyObj<HttpClient>;
  const rootUrl = 'https://staging.fyle.tech';

  const requestObj = {
    someKey: 'someValue',
  };

  const apiResponse = {
    message: 'SUCCESS',
  };

  beforeEach(() => {
    const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    TestBed.configureTestingModule({
      providers: [
        LocationService,
        {
          provide: HttpClient,
          useValue: httpClientSpy,
        },
      ],
    });
    locationService = TestBed.inject(LocationService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    locationService.setRoot(rootUrl);
  });

  it('should be created', () => {
    expect(locationService).toBeTruthy();
  });

  it('setRoot(): should set root url', () => {
    expect(locationService.ROOT_ENDPOINT).toBe(rootUrl);
  });

  describe('get():', () => {
    it('should make GET request without params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      locationService.get('/geocode').subscribe((res) => {
        expect(res).toEqual(apiResponse);
        expect(httpClient.get).toHaveBeenCalledOnceWith(`${rootUrl}/location/geocode`, {});
        done();
      });
    });

    it('should make GET request with params', (done) => {
      httpClient.get.and.returnValue(of(apiResponse));

      locationService
        .get('/geocode', {
          params: requestObj,
        })
        .subscribe((res) => {
          expect(res).toEqual(apiResponse);
          expect(httpClient.get).toHaveBeenCalledOnceWith(`${rootUrl}/location/geocode`, {
            params: requestObj,
          });
          done();
        });
    });
  });

  describe('timeoutWhen', () => {
    it('should not apply timeout when condition is false', (done) => {
      const source$ = of('Searching the location');
      const result$ = source$.pipe(locationService.timeoutWhen(false, 5000));

      result$.subscribe({
        next: (value) => {
          expect(value).toBe('Searching the location');
        },
        complete: () => {
          done();
        },
      });
    });

    it('should apply timeout when condition is true', (done) => {
      const source$ = of('hello').pipe(delay(2000)); // emit value after 2 seconds
      const result$ = source$.pipe(locationService.timeoutWhen(true, 1000));

      result$.subscribe({
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          done();
        },
      });
    });
  });

  it('should return location details with display name if displayName is provided', () => {
    const placeId = 'pLcId1234';
    const displayName = 'Tollygunge, Kolkata, West Bengal, India';
    const locationDetails = locationData1;

    httpClient.get.and.returnValue(of(locationDetails));

    const locationService = new LocationService(httpClient);

    locationService.getGeocode(placeId, displayName).subscribe((result) => {
      expect(result).toEqual({ ...locationDetails, display: displayName });
    });

    expect(httpClient.get).toHaveBeenCalledOnceWith(`/location/geocode/${placeId}`, {});
  });
});
